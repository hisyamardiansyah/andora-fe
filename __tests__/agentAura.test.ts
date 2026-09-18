import {
  AURA_DEFAULTS,
  brightnessForVolume,
  buildAuraUniforms,
  clamp01,
  hexToRgb01,
  resolveScale,
  scaleForVolume,
  smoothValue,
  targetsForState,
} from '@/lib/agentAura';

describe('agentAura canonical mapping', () => {
  it('maps listening to the canonical pulse targets', () => {
    expect(targetsForState('listening')).toEqual({
      speed: 20,
      scale: 0.3,
      amplitude: 1.0,
      frequency: 0.7,
      brightness: 1.75,
      pulse: [1.5, 2.0],
    });
  });

  it('maps thinking/connecting/initializing to the canonical pulse targets', () => {
    for (const state of ['thinking', 'connecting', 'initializing'] as const) {
      expect(targetsForState(state)).toEqual({
        speed: 30,
        scale: 0.3,
        amplitude: 0.5,
        frequency: 1.0,
        brightness: 1.5,
        pulse: [0.5, 2.5],
      });
    }
  });

  it('maps speaking and idle/offline states', () => {
    expect(targetsForState('speaking')).toEqual({
      speed: 70,
      scale: 0.3,
      amplitude: 0.75,
      frequency: 1.25,
      brightness: 1.5,
    });
    expect(targetsForState('disconnected')).toEqual({
      speed: 10,
      scale: 0.2,
      amplitude: 1.2,
      frequency: 0.4,
      brightness: 1.0,
    });
    expect(targetsForState('idle-local')).toEqual(
      targetsForState('disconnected')
    );
  });

  it('grows scale and brightness with live mic volume', () => {
    expect(scaleForVolume(0)).toBeCloseTo(0.2);
    expect(scaleForVolume(1)).toBeCloseTo(0.4);
    expect(resolveScale('speaking', 0.5)).toBeCloseTo(0.3);
    expect(resolveScale('listening', 0.5)).toBeCloseTo(0.3);
    expect(brightnessForVolume(1.5, 0.5)).toBeGreaterThan(1.5);
    expect(clamp01(Number.NaN)).toBe(0);
    expect(smoothValue(0, 1)).toBeCloseTo(0.08);
  });

  it('wires canonical static uniforms, color, and theme mode', () => {
    const uniforms = buildAuraUniforms({
      state: 'speaking',
      volume: 0.5,
      color: '#1FD5F9',
      colorShift: 0.3,
      themeMode: 'dark',
    });
    expect(uniforms.blur).toBe(AURA_DEFAULTS.blur);
    expect(uniforms.shape).toBe(AURA_DEFAULTS.shape);
    expect(uniforms.spacing).toBe(AURA_DEFAULTS.spacing);
    expect(uniforms.variance).toBe(AURA_DEFAULTS.variance);
    expect(uniforms.smoothing).toBe(AURA_DEFAULTS.smoothing);
    expect(uniforms.bloom).toBe(AURA_DEFAULTS.bloom);
    expect(uniforms.mode).toBe(0);
    expect(uniforms.scale).toBeCloseTo(0.3);
    expect(hexToRgb01('#1FD5F9')[0]).toBeCloseTo(0x1f / 255);
    expect(
      buildAuraUniforms({
        state: 'speaking',
        volume: 0,
        color: '#1FD5F9',
        colorShift: 0.05,
        themeMode: 'light',
      }).mode
    ).toBe(1);
  });
});
