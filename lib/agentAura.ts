import type { AgentState } from '@livekit/components-react';

export type AuraState = AgentState | 'idle-local';

export type AuraTargets = {
  speed: number;
  scale: number;
  amplitude: number;
  frequency: number;
  brightness: number;
  pulse?: readonly [number, number];
};

export const AURA_DEFAULT_COLOR = '#1FD5F9';

// Static uniform defaults from AgentAudioVisualizerAura / AuraShader.
export const AURA_DEFAULTS = {
  shape: 1.0,
  blur: 0.2,
  spacing: 0.5,
  variance: 0.1,
  smoothing: 1.0,
  bloom: 0.0,
  colorShift: 0.05,
} as const;

// Canonical AgentAudioVisualizerAura animation map.
export function targetsForState(state: AuraState): AuraTargets {
  switch (state) {
    case 'listening':
    case 'pre-connect-buffering':
      return {
        speed: 20,
        scale: 0.3,
        amplitude: 1.0,
        frequency: 0.7,
        brightness: 1.75,
        pulse: [1.5, 2.0],
      };
    case 'thinking':
    case 'connecting':
    case 'initializing':
      return {
        speed: 30,
        scale: 0.3,
        amplitude: 0.5,
        frequency: 1.0,
        brightness: 1.5,
        pulse: [0.5, 2.5],
      };
    case 'speaking':
      return {
        speed: 70,
        scale: 0.3,
        amplitude: 0.75,
        frequency: 1.25,
        brightness: 1.5,
      };
    default:
      return {
        speed: 10,
        scale: 0.2,
        amplitude: 1.2,
        frequency: 0.4,
        brightness: 1.0,
      };
  }
}

export function clamp01(value: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

// Canonical speaking rule: scale snaps to 0.2 + 0.2 * volume on live level.
export function scaleForVolume(volume: number): number {
  return 0.2 + 0.2 * clamp01(volume);
}

// Resolve the shader scale target. Canonical behavior applies live volume
// while speaking; mic surfaces also apply it while listening so mic input
// visibly grows the aura before the agent responds.
export function resolveScale(state: AuraState, volume: number): number {
  const targets = targetsForState(state);
  if (
    volume > 0 &&
    (state === 'speaking' ||
      state === 'listening' ||
      state === 'pre-connect-buffering')
  ) {
    return scaleForVolume(volume);
  }
  return targets.scale;
}

// Live-volume brightness lift added to the state pulse target.
export function brightnessForVolume(base: number, volume: number): number {
  return base + clamp01(volume) * 0.8;
}

export function smoothValue(
  current: number,
  target: number,
  factor = 0.08
): number {
  return current + (target - current) * factor;
}

// Canonical hexToRgb: strict 6-digit hex, falls back to the default color.
export function hexToRgb01(hex: string): [number, number, number] {
  try {
    const match = hex.match(
      /^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
    );
    if (match) {
      const [, r, g, b] = match;
      return [
        parseInt(r ?? '00', 16) / 255,
        parseInt(g ?? '00', 16) / 255,
        parseInt(b ?? '00', 16) / 255,
      ];
    }
  } catch {
    // Fall through to the default color below.
  }
  if (hex === AURA_DEFAULT_COLOR) return [0x1f / 255, 0xd5 / 255, 0xf9 / 255];
  return hexToRgb01(AURA_DEFAULT_COLOR);
}

export type AuraUniforms = {
  speed: number;
  scale: number;
  amplitude: number;
  frequency: number;
  brightness: number;
  blur: number;
  shape: number;
  bloom: number;
  spacing: number;
  colorShift: number;
  variance: number;
  smoothing: number;
  mode: number;
  color: [number, number, number];
};

// Static per-frame uniform base matching AuraShader's uniform wiring.
export function buildAuraUniforms(args: {
  state: AuraState;
  volume: number;
  color: string;
  colorShift: number;
  themeMode: 'dark' | 'light';
}): AuraUniforms {
  const targets = targetsForState(args.state);
  return {
    speed: targets.speed,
    scale: resolveScale(args.state, args.volume),
    amplitude: targets.amplitude,
    frequency: targets.frequency,
    brightness: brightnessForVolume(targets.brightness, args.volume),
    blur: AURA_DEFAULTS.blur,
    shape: AURA_DEFAULTS.shape,
    bloom: AURA_DEFAULTS.bloom,
    spacing: AURA_DEFAULTS.spacing,
    colorShift: args.colorShift,
    variance: AURA_DEFAULTS.variance,
    smoothing: AURA_DEFAULTS.smoothing,
    mode: args.themeMode === 'light' ? 1.0 : 0.0,
    color: hexToRgb01(args.color),
  };
}
