import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
} from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ExpoWebGLRenderingContext } from 'expo-gl';
import type { LocalAudioTrack, RemoteAudioTrack } from 'livekit-client';
import type {
  AgentState,
  TrackReferenceOrPlaceholder,
} from '@livekit/components-react';
import { useTrackVolume as useNativeTrackVolume } from '@livekit/react-native';
import MicAura from '@/components/MicAura';
import {
  AURA_DEFAULT_COLOR,
  AURA_DEFAULTS,
  brightnessForVolume,
  buildAuraUniforms,
  clamp01,
  hexToRgb01,
  resolveScale,
  smoothValue,
  targetsForState,
} from '@/lib/agentAura';

export type AgentAuraState = AgentState | 'idle-local';
export type AgentAuraTrack =
  | LocalAudioTrack
  | RemoteAudioTrack
  | TrackReferenceOrPlaceholder;

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

// AgentAudioVisualizerAura fragment math (WebGL1 GLSL), ported verbatim
// apart from the precision + uniform declarations and main() wrapper.
const FRAGMENT_SOURCE = `precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uBlur;
uniform float uScale;
uniform float uShape;
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
float sdLine(vec2 p, float r) { float halfLen = r * 2.0; vec2 a = vec2(-halfLen, 0.0); vec2 b = vec2(halfLen, 0.0); vec2 pa = p - a; vec2 ba = b - a; float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0); return length(pa - ba * h); }
float getSdf(vec2 st) { if(uShape == 1.0) return sdCircle(st, uScale); else if(uShape == 2.0) return sdLine(st, uScale); return sdCircle(st, uScale); }
vec2 turb(vec2 pos, float t, float it) { mat2 rotation = mat2(0.6, -0.25, 0.25, 0.9); mat2 layerRotation = mat2(0.6, -0.8, 0.8, 0.6); float frequency = mix(2.0, 15.0, uFrequency); float amplitude = uAmplitude; float frequencyGrowth = 1.4; float animTime = t*0.1*uSpeed; for(int i=0;i<4;i++){ vec2 rotatedPos = pos*rotation; vec2 wave = sin(frequency*rotatedPos + float(i)*animTime + it); pos += (amplitude/frequency)*rotation[0]*wave; rotation *= layerRotation; amplitude *= mix(1.0, max(wave.x, wave.y), uVariance); frequency *= frequencyGrowth; } return pos; }
const float ITERATIONS = 36.0;
void mainImage(out vec4 fragColor, in vec2 fragCoord) { vec2 uv = fragCoord/iResolution.xy; vec3 pp = vec3(0.0); vec3 bloom = vec3(0.0); float t = iTime*0.5; vec2 pos = uv - 0.5; vec2 prevPos = turb(pos, t, 0.0 - 1.0/ITERATIONS); float spacing = mix(1.0, TAU, uSpacing); for(float i=1.0;i<ITERATIONS + 1.0;i++){ float iter = i/ITERATIONS; vec2 st = turb(pos, t, iter*spacing); float d = abs(getSdf(st)); float pd = distance(st, prevPos); prevPos = st; float dynamicBlur = exp2(pd*2.0*1.4426950408889634)-1.0; float ds = smoothstep(0.0, uBlur*0.05 + max(dynamicBlur*uSmoothing, 0.001), d); vec3 color = uColor; if(uColorShift > 0.01){ vec3 hsv = rgb2hsv(color); hsv.x = fract(hsv.x + (1.0-iter)*uColorShift*0.3); color = hsv2rgb(hsv); } float invd = 1.0/max(d + dynamicBlur, 0.001); pp += (ds-1.0)*color; bloom += clamp(invd, 0.0, 250.0)*color; } pp *= 1.0/ITERATIONS; vec3 color; if(uMode < 0.5){ bloom = bloom/(bloom + 2e4); color = (-pp + bloom*3.0*uBloom)*1.2; color += (randFibo(fragCoord).x - 0.5)/255.0; color = Tonemap(color); float alpha = luma(color)*uMix; fragColor = vec4(color*uMix, alpha); } else { color = -pp; color += (randFibo(fragCoord).x-0.5)/255.0; float brightness = length(color); vec3 direction = brightness > 0.0 ? color/brightness : color; float factor = 2.0; float mappedBrightness = (brightness*factor)/(1.0 + brightness*factor); color = direction*mappedBrightness; float gray = dot(color, vec3(0.2, 0.5, 0.1)); color = mix(vec3(gray), color, 3.0); color = clamp(color, 0.0, 1.0); float alpha = mappedBrightness*clamp(uMix, 1.0, 2.0); fragColor = vec4(color, alpha); } }
void main() { mainImage(gl_FragColor, gl_FragCoord); }
`;

// Hook order must stay stable, so the component always calls the native
// volume hook and only gates the reported value on having a live track.
function useProbedVolume(
  track: AgentAuraTrack | undefined,
  volume: number | undefined
): number {
  let probed = 0;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    probed = useNativeTrackVolume(track);
  } catch {
    probed = 0;
  }
  const reported =
    typeof probed === 'number' && Number.isFinite(probed) ? probed : 0;
  if (volume !== undefined) return volume;
  return track ? reported : 0;
}

function compileShader(
  gl: ExpoWebGLRenderingContext,
  type: number,
  source: string
) {
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
    throw new Error(
      `program link failed: ${gl.getProgramInfoLog(program) ?? 'unknown'}`
    );
  }
  gl.useProgram(program);
  return program;
}

export default function AgentAuraGL({
  size = 197,
  color = AURA_DEFAULT_COLOR,
  colorShift = AURA_DEFAULTS.colorShift,
  state = 'idle-local',
  themeMode = 'dark',
  audioTrack,
  volume,
  showMicIcon = true,
  micIconSize,
  style,
}: AgentAuraGLProps) {
  const [glFailed, setGlFailed] = useState(false);
  const effectiveVolume = useProbedVolume(audioTrack, volume);
  // expo-gl is a native module absent from Expo Go; resolve it lazily so
  // route loading never crashes when the native binary lacks ExponentGL.
  const [GLView, setGLView] = useState<ComponentType<{
    style?: StyleProp<ViewStyle>;
    onContextCreate: (gl: ExpoWebGLRenderingContext) => void;
  }> | null>(null);
  useEffect(() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const mod = require('expo-gl') as {
        GLView?: ComponentType<{
          style?: StyleProp<ViewStyle>;
          onContextCreate: (gl: ExpoWebGLRenderingContext) => void;
        }>;
      };
      if (mod.GLView) {
        setGLView(
          () =>
            mod.GLView as ComponentType<{
              style?: StyleProp<ViewStyle>;
              onContextCreate: (gl: ExpoWebGLRenderingContext) => void;
            }>
        );
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

  useEffect(() => {
    volumeRef.current = clamp01(effectiveVolume);
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
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW
      );
      const posLoc = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      const loc = (name: string) => gl.getUniformLocation(program, name);
      const uRes = loc('iResolution');
      const uTime = loc('iTime');
      const uSpeed = loc('uSpeed');
      const uBlur = loc('uBlur');
      const uScale = loc('uScale');
      const uShape = loc('uShape');
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

      const uniforms = buildAuraUniforms({
        state: stateRef.current,
        volume: volumeRef.current,
        color: colorRef.current,
        colorShift: colorShiftRef.current,
        themeMode: themeModeRef.current,
      });
      const cur = {
        speed: uniforms.speed,
        scale: uniforms.scale,
        amplitude: uniforms.amplitude,
        frequency: uniforms.frequency,
        brightness: uniforms.brightness,
      };
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
            ? target.pulse[0] +
              (target.pulse[1] - target.pulse[0]) *
                (0.5 + 0.5 * Math.sin(pulsePhase))
            : target.brightness;

          cur.speed = smoothValue(cur.speed, target.speed);
          cur.amplitude = smoothValue(cur.amplitude, target.amplitude);
          cur.frequency = smoothValue(cur.frequency, target.frequency);
          const liveBrightness = brightnessForVolume(pulseTarget, vol);
          cur.brightness = smoothValue(cur.brightness, liveBrightness);
          cur.scale = smoothValue(
            cur.scale,
            resolveScale(stateRef.current, vol)
          );

          const w = gl.drawingBufferWidth;
          const h = gl.drawingBufferHeight;
          gl.viewport(0, 0, w, h);
          gl.clear(gl.COLOR_BUFFER_BIT);
          if (uRes) gl.uniform2f(uRes, w, h);
          set1f(uTime, t);
          set1f(uSpeed, cur.speed);
          set1f(uBlur, AURA_DEFAULTS.blur);
          set1f(uScale, cur.scale);
          set1f(uShape, AURA_DEFAULTS.shape);
          set1f(uFreq, cur.frequency);
          set1f(uAmp, cur.amplitude);
          set1f(uBloom, AURA_DEFAULTS.bloom);
          set1f(uMix, cur.brightness);
          set1f(uSpacing, AURA_DEFAULTS.spacing);
          set1f(uShift, colorShiftRef.current);
          set1f(uVar, AURA_DEFAULTS.variance);
          set1f(uSmooth, AURA_DEFAULTS.smoothing);
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
        themeMode={themeMode}
        volume={effectiveVolume}
        showMicIcon={showMicIcon}
        micIconSize={micIconSize}
        style={style}
      />
    );
  }

  const iconSize = micIconSize ?? Math.round(size * 0.19);

  return (
    <View style={[{ width: size, height: size }, style]}>
      <GLView
        style={{ width: size, height: size }}
        onContextCreate={handleContextCreate}
      />
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
