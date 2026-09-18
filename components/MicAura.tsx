import { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { AgentState } from '@livekit/components-react';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import {
  AURA_DEFAULT_COLOR,
  brightnessForVolume,
  clamp01,
  targetsForState,
} from '@/lib/agentAura';

export type MicAuraState = AgentState | 'idle-local';

type MicAuraProps = {
  size?: number;
  color?: string;
  ringColor?: string;
  glowColor?: string;
  state?: MicAuraState;
  themeMode?: 'dark' | 'light';
  volume?: number;
  showMicIcon?: boolean;
  micIconSize?: number;
  style?: StyleProp<ViewStyle>;
};

const ACTIVE_STATES: ReadonlySet<string> = new Set([
  'speaking',
  'thinking',
  'listening',
]);

// One turbulent energy lobe: a large soft blob offset from center that
// breathes and rotates around the core, so overlapping lobes read as one
// continuous pulsing aura field rather than concentric rings.
function AuraLobe({
  breathe,
  size,
  color,
  angle,
  distance,
  scaleBase,
  scaleGain,
  opacity,
}: {
  breathe: SharedValue<number>;
  size: number;
  color: string;
  angle: number;
  distance: number;
  scaleBase: number;
  scaleGain: number;
  opacity: number;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: Math.cos(angle) * distance },
      { translateY: Math.sin(angle) * distance },
      { scale: scaleBase + breathe.value * scaleGain },
      { rotate: `${angle + breathe.value * 0.6}rad` },
    ],
    opacity,
  }));
  return (
    <Animated.View
      style={[
        styles.lobe,
        {
          width: size,
          height: size * 0.82,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
}

export default function MicAura({
  size = 197,
  color = AURA_DEFAULT_COLOR,
  ringColor,
  glowColor,
  state = 'idle-local',
  themeMode = 'dark',
  volume = 0,
  showMicIcon = true,
  micIconSize,
  style,
}: MicAuraProps) {
  const targets = targetsForState(state);
  const level = clamp01(volume);
  const active =
    ACTIVE_STATES.has(state) ||
    state === 'pre-connect-buffering' ||
    level > 0.02;
  const auraColor = glowColor ?? color;
  const haloColor = ringColor ?? auraColor;
  const dim = themeMode === 'light';
  const field = size;
  const lobe = size * (0.52 + level * 0.22);
  const haloDiameter = size * (0.72 + level * 0.16);
  const haloWidth = Math.max(2, size * 0.02);
  const badge = Math.round(size * 0.3);
  const iconSize = micIconSize ?? Math.round(badge * 0.5);
  const basePulse = targets.pulse?.[0] ?? targets.brightness;
  const liveBrightness = brightnessForVolume(basePulse, level);
  const lobeBase = (dim ? 0.16 : 0.24) + level * 0.2;
  const haloBase = (active ? 0.5 : 0.28) * (dim ? 0.8 : 1);

  const breathe = useSharedValue(0);
  const ripple = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, {
        duration: active ? 900 : 2200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
    ripple.value = withRepeat(
      withTiming(1, {
        duration:
          targets.speed >= 70
            ? 900
            : targets.speed >= 30
            ? 1600
            : targets.speed >= 20
            ? 2000
            : 2800,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false
    );
    return () => {
      cancelAnimation(breathe);
      cancelAnimation(ripple);
    };
  }, [active, targets.speed, breathe, ripple]);

  const fieldStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * (0.03 + level * 0.08) }],
    opacity: Math.min(
      0.5,
      Math.max(0.06, lobeBase + breathe.value * (0.05 + level * 0.1))
    ),
  }));

  const haloStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.9 + ripple.value * 0.25 + level * 0.05 }],
    opacity: Math.max(0, haloBase * (1 - ripple.value)),
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * (0.02 + level * 0.06) }],
    opacity: Math.min(1, 0.92 + liveBrightness * 0.02),
  }));

  return (
    <View
      style={[styles.stage, { width: size, height: size }, style]}
      accessibilityRole="image"
    >
      <Animated.View
        style={[
          styles.field,
          {
            width: field,
            height: field,
            borderRadius: field / 2,
            backgroundColor: auraColor,
          },
          fieldStyle,
        ]}
      />
      <AuraLobe
        breathe={breathe}
        size={lobe}
        color={auraColor}
        angle={0.4}
        distance={size * 0.1}
        scaleBase={0.9}
        scaleGain={0.22 + level * 0.18}
        opacity={Math.min(0.5, lobeBase + 0.08)}
      />
      <AuraLobe
        breathe={breathe}
        size={lobe * 0.9}
        color={auraColor}
        angle={2.5}
        distance={size * 0.11}
        scaleBase={0.95}
        scaleGain={0.2 + level * 0.16}
        opacity={Math.min(0.5, lobeBase + 0.04)}
      />
      <AuraLobe
        breathe={breathe}
        size={lobe * 0.8}
        color={auraColor}
        angle={4.4}
        distance={size * 0.09}
        scaleBase={0.9}
        scaleGain={0.18 + level * 0.14}
        opacity={Math.min(0.45, lobeBase)}
      />
      <Animated.View
        style={[
          styles.halo,
          {
            width: haloDiameter,
            height: haloDiameter,
            borderRadius: haloDiameter / 2,
            borderColor: haloColor,
            borderWidth: haloWidth,
          },
          haloStyle,
        ]}
      />
      <Animated.View
        style={[
          styles.badge,
          {
            width: badge,
            height: badge,
            borderRadius: badge / 2,
            backgroundColor: color,
          },
          badgeStyle,
        ]}
      >
        {showMicIcon ? (
          <Ionicons name="mic" size={iconSize} color="#FFFFFF" />
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    position: 'absolute',
  },
  lobe: {
    position: 'absolute',
  },
  halo: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
