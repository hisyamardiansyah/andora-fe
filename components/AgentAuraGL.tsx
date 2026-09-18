import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ExpoWebGLRenderingContext } from 'expo-gl';
import { useTrackVolume, type AgentState } from '@livekit/components-react';
import MicAura from '@/components/MicAura';

export type AgentAuraState = AgentState | 'idle-local';
export type AgentAuraTrack = Parameters<typeof useTrackVolume>[0];

type AgentAuraGLProps = {
  size?: number;
  color?: string;
  colorShift?: number;
  state?: AgentAuraState;
  themeMode?: 'dark' | 'light';
  audioTrack?: AgentAuraTrack;
  volume?: number;
  showMicIcon?: boolean;
  micIconSize?: number;
  style?: StyleProp<ViewStyle>;
};

// Fullscreen-triangle vertex shader; fragment covers the viewport.
const VERTEX_SOURCE = `attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

// Official AgentAudioVisualizerAura fragment math (WebGL1 GLSL), unchanged
// apart from the precision + uniform declarations and main() wrapper.
const FRAGMENT_SOURCE = `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uBlur;
uniform float uScale;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uBloom;
uniform float uMix;
uniform float uSpacing;
uniform float uColorShift;
uniform float uVariance;
uniform float uSmoothing;
uniform float uMode;
uniform vec3 uColor;
const float TAU = 6.283185;
vec2 randFibo(vec2 p) { p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.xx + p.yx) * p.xy); }
vec3 Tonemap(vec3 x) { x *= 4.0; return x / (1.0 + x); }
float luma(vec3 color) { return dot(color, vec3(0.299, 0.587, 0.114)); }
vec3 rgb2hsv(vec3 c) { vec4 K = vec4(0.0, -1.0/3.0, 2.0/3.0, -1.0); vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g)); vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r)); float d = q.x - min(q.w, q.y); float e = 1.0e-10; return vec3(abs(q.z + (q.w - q.y)/(6.0*d + e)), d/(q.x + e), q.x); }
vec3 hsv2rgb(vec3 c) { vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0); vec3 p = abs(fract(c.xxx + K.xyz)*6.0 - K.www); return c.z*mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y); }
float sdCircle(vec2 st, float r) { return length(st) - r; }
vec2 turb(vec2 pos, float t, float it) { mat2 rotation = mat2(0.6, -0.25, 0.25, 0.9); mat2 layerRotation = mat2(0.6, -0.8, 0.8, 0.6); float frequency = mix(2.0, 15.0, uFrequency); float amplitude = uAmplitude; float frequencyGrowth = 1.4; float animTime = t*0.1*uSpeed; for(int i=0;i<4;i++){ vec2 rotatedPos = pos*rotation; vec2 wave = sin(frequency*rotatedPos + float(i)*animTime + it); pos += (amplitude/frequency)*rotation[0]*wave; rotation *= layerRotation; amplitude *= mix(1.0, max(wave.x, wave.y), uVariance); frequency *= frequencyGrowth; } return pos; }
void mainImage(out vec4 fragColor, in vec2 fragCoord) { vec2 uv = fragCoord/iResolution.xy; vec3 pp = vec3(0.0); vec3 bloom = vec3(0.0); float t = iTime*0.5; vec2 pos = uv - 0.5; vec2 prevPos = turb(pos, t, 0.0-1.0/36.0); float spacing = mix(1.0, TAU, uSpacing); for(float i=1.0;i<37.0;i++){ float iter = i/36.0; vec2 st = turb(pos, t, iter*spacing); float d = abs(length(st)-uScale); float pd = distance(st, prevPos); prevPos = st; float dynamicBlur = exp2(pd*2.0*1.4426950408889634)-1.0; float ds = smoothstep(0.0, uBlur*0.05 + max(dynamicBlur*uSmoothing, 0.001), d); vec3 color = uColor; if(uColorShift > 0.01){ vec3 hsv = rgb2hsv(color); hsv.x = fract(hsv.x + (1.0-iter)*uColorShift*0.3); color = hsv2rgb(hsv); } float invd = 1.0/max(d + dynamicBlur, 0.001); pp += (ds-1.0)*color; bloom += clamp(invd, 0.0, 250.0)*color; } pp *= 1.0/36.0; vec3 color; if(uMode < 0.5){ bloom = bloom/(bloom + 2e4); color = (-pp + bloom*3.0*uBloom)*1.2; color += (randFibo(fragCoord).x - 0.5)/255.0; color = Tonemap(color); float alpha = luma(color)*uMix; fragColor = vec4(color*uMix, alpha); } else { color = -pp; color += (randFibo(fragCoord).x-0.5)/255.0; float brightness = length(color); vec3 direction = brightness > 0.0 ? color/brightness : color; float factor = 2.0; float mappedBrightness = (brightness*factor)/(1.0 + brightness*factor); color = direction*mappedBrightness; float gray = dot(color, vec3(0.2, 0.5, 0.1)); color = mix(vec3(gray), color, 3.0); color = clamp(color, 0.0, 1.0); float alpha = mappedBrightness*clamp(uMix, 1.0, 2.0); fragColor = vec4(color, alpha); } }
void main() { mainImage(gl_FragColor, gl_FragCoord); }
`;

type AuraTargets = {
  speed: number;
  scale: number;
  amplitude: number;
  frequency: number;
  brightness: number;
  pulse?: readonly [number, number];
};

// AgentState -> shader param targets (official animation map).
function targetsForState(state: AgentAuraState): AuraTargets {
  switch (state) {
    case 'listening':
    case 'pre-connect-buffering':
      return { speed: 20, scale: 0.3, amplitude: 1.0, frequency: 0.7, brightness: 1.75, pulse: [1.5, 2.0] };
    case 'thinking':
    case 'connecting':
    case 'initializing':
      return { speed: 30, scale: 0.3, amplitude: 0.5, frequency: 1.0, brightness: 1.5, pulse: [0.5, 2.5] };
    case 'speaking':
      return { speed: 70, scale: 0.3, amplitude: 0.75, frequency: 1.25, brightness: 1.5 };
    default:
      return { speed: 10, scale: 0.2, amplitude: 1.2, frequency: 0.4, brightness: 1.0 };
  }
}

function hexToRgb01(hex: string): [number, number, number] {
  const fallback: [number, number, number] = [0x1f / 255, 0xd5 / 255, 0xf9 / 255];
  try {
    let h = hex.trim().replace(/^#/, '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return fallback;
    const n = parseInt(h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  } catch {
    return fallback;
  }
}

// Web Audio analyser is unavailable on native; skip the hook so volume stays 0.
function canUseWebAudio(): boolean {
  try {
    const g = globalThis as unknown as Record<string, unknown>;
    return g['AudioContext'] !== undefined || g['webkitAudioContext'] !== undefined;
  } catch {
    return false;
  }
}

// Isolated so useTrackVolume only runs when a track + Web Audio exist.
function TrackVolumeProbe({
  track,
  onValue,
}: {
  track: NonNullable<AgentAuraTrack>;
  onValue: (v: number) => void;
}) {
  let v = 0;
  try {
    v = useTrackVolume(track);
  } catch {
    v = 0;
  }
  useEffect(() => {
    onValue(typeof v === 'number' && Number.isFinite(v) ? v : 0);
  }, [v, onValue]);
  return null;
}

function compileShader(gl: ExpoWebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('createShader returned null');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'unknown';
    try {
      gl.deleteShader(shader);
    } catch {
      // Ignore cleanup errors; the compile failure below is what matters.
    }
    throw new Error(`shader compile failed: ${log}`);
  }
  return shader;
}

function createProgram(gl: ExpoWebGLRenderingContext) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
  const program = gl.createProgram();
  if (!program) throw new Error('createProgram returned null');
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`program link failed: ${gl.getProgramInfoLog(program) ?? 'unknown'}`);
  }
  gl.useProgram(program);
  return program;
}

const LERP = 0.08;
const lerp = (cur: number, target: number) => cur + (target - cur) * LERP;

export default function AgentAuraGL({
  size = 197,
  color = '#1FD5F9',
  colorShift = 0.05,
  state = 'idle-local',
  themeMode = 'dark',
  audioTrack,
  volume,
  showMicIcon = true,
  micIconSize,
  style,
}: AgentAuraGLProps) {
  const [glFailed, setGlFailed] = useState(false);
  const [probedVolume, setProbedVolume] = useState(0);
  // expo-gl is a native module absent from Expo Go; resolve it lazily so
  // route loading never crashes when the native binary lacks ExponentGL.
  const [GLView, setGLView] = useState<ComponentType<{
    style?: StyleProp<ViewStyle>;
    onContextCreate: (gl: ExpoWebGLRenderingContext) => void;
  }> | null>(null);
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('expo-gl') as { GLView?: ComponentType<{
        style?: StyleProp<ViewStyle>;
        onContextCreate: (gl: ExpoWebGLRenderingContext) => void;
      }> };
      if (mod.GLView) {
        setGLView(() => mod.GLView as ComponentType<{
          style?: StyleProp<ViewStyle>;
          onContextCreate: (gl: ExpoWebGLRenderingContext) => void;
        }>);
      } else {
        setGlFailed(true);
      }
    } catch {
      setGlFailed(true);
    }
  }, []);
  const rafRef = useRef<number>(0);
  const stateRef = useRef(state);
  const colorRef = useRef(color);
  const colorShiftRef = useRef(colorShift);
  const themeModeRef = useRef(themeMode);
  const volumeRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  useEffect(() => {
    colorRef.current = color;
  }, [color]);
  useEffect(() => {
    colorShiftRef.current = colorShift;
  }, [colorShift]);
  useEffect(() => {
    themeModeRef.current = themeMode;
  }, [themeMode]);

  const handleProbe = useCallback((v: number) => {
    setProbedVolume(v);
  }, []);

  const effectiveVolume = volume ?? probedVolume;
  useEffect(() => {
    volumeRef.current = Math.min(1, Math.max(0, effectiveVolume));
  }, [effectiveVolume]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleContextCreate = useCallback((gl: ExpoWebGLRenderingContext) => {
    try {
      const program = createProgram(gl);
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const posLoc = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      const loc = (name: string) => gl.getUniformLocation(program, name);
      const uRes = loc('iResolution');
      const uTime = loc('iTime');
      const uSpeed = loc('uSpeed');
      const uBlur = loc('uBlur');
      const uScale = loc('uScale');
      const uFreq = loc('uFrequency');
      const uAmp = loc('uAmplitude');
      const uBloom = loc('uBloom');
      const uMix = loc('uMix');
      const uSpacing = loc('uSpacing');
      const uShift = loc('uColorShift');
      const uVar = loc('uVariance');
      const uSmooth = loc('uSmoothing');
      const uMode = loc('uMode');
      const uColor = loc('uColor');
      const set1f = (l: WebGLUniformLocation | null, v: number) => {
        if (l) gl.uniform1f(l, v);
      };

      gl.clearColor(0, 0, 0, 0);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const start = targetsForState(stateRef.current);
      const cur = { ...start };
      delete (cur as Partial<AuraTargets>).pulse;
      let pulsePhase = 0;
      const t0 = Date.now();
      let last = t0;

      const frame = () => {
        rafRef.current = requestAnimationFrame(frame);
        try {
          const now = Date.now();
          const dt = Math.min(0.1, Math.max(0, (now - last) / 1000));
          last = now;
          const t = (now - t0) / 1000;

          const target = targetsForState(stateRef.current);
          const vol = volumeRef.current;
          pulsePhase += dt * 3.0;
          const pulseTarget = target.pulse
            ? target.pulse[0] + (target.pulse[1] - target.pulse[0]) * (0.5 + 0.5 * Math.sin(pulsePhase))
            : target.brightness;

          cur.speed = lerp(cur.speed, target.speed);
          cur.amplitude = lerp(cur.amplitude, target.amplitude);
          cur.frequency = lerp(cur.frequency, target.frequency);
          cur.brightness = lerp(cur.brightness, pulseTarget);
          if (stateRef.current === 'speaking' && vol > 0) {
            cur.scale = 0.2 + 0.2 * vol;
          } else {
            cur.scale = lerp(cur.scale, target.scale);
          }

          const w = gl.drawingBufferWidth;
          const h = gl.drawingBufferHeight;
          gl.viewport(0, 0, w, h);
          gl.clear(gl.COLOR_BUFFER_BIT);
          if (uRes) gl.uniform2f(uRes, w, h);
          set1f(uTime, t);
          set1f(uSpeed, cur.speed);
          set1f(uBlur, 1.0);
          set1f(uScale, cur.scale);
          set1f(uFreq, cur.frequency);
          set1f(uAmp, cur.amplitude);
          set1f(uBloom, 0.0);
          set1f(uMix, cur.brightness);
          set1f(uSpacing, 0.5);
          set1f(uShift, colorShiftRef.current);
          set1f(uVar, 0.1);
          set1f(uSmooth, 1.0);
          set1f(uMode, themeModeRef.current === 'light' ? 1.0 : 0.0);
          if (uColor) {
            const [r, g, b] = hexToRgb01(colorRef.current);
            gl.uniform3f(uColor, r, g, b);
          }
          gl.drawArrays(gl.TRIANGLES, 0, 3);
          gl.endFrameEXP();
        } catch {
          cancelAnimationFrame(rafRef.current);
          setGlFailed(true);
        }
      };
      frame();
    } catch {
      setGlFailed(true);
    }
  }, []);

  if (glFailed || !GLView) {
    return (
      <MicAura
        size={size}
        color={color}
        state={state}
        showMicIcon={showMicIcon}
        micIconSize={micIconSize}
        style={style}
      />
    );
  }

  const iconSize = micIconSize ?? Math.round(size * 0.19);

  return (
    <View style={[{ width: size, height: size }, style]}>
      {audioTrack && volume === undefined && canUseWebAudio() ? (
        <TrackVolumeProbe track={audioTrack} onValue={handleProbe} />
      ) : null}
      <GLView style={{ width: size, height: size }} onContextCreate={handleContextCreate} />
      {showMicIcon ? (
        <View style={styles.iconOverlay} pointerEvents="none">
          <Ionicons name="mic" size={iconSize} color="#FFFFFF" />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  iconOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
