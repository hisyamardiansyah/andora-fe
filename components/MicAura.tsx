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

export type MicAuraState = AgentState | 'idle-local';

type MicAuraProps = {
  size?: number;
  color?: string;
  ringColor?: string;
  glowColor?: string;
  state?: MicAuraState;
  showMicIcon?: boolean;
  micIconSize?: number;
  style?: StyleProp<ViewStyle>;
};

const ACTIVE_STATES: ReadonlySet<string> = new Set([
  'speaking',
  'thinking',
  'listening',
]);

// One expanding ring that fades as it grows; two of these phase-shifted
// create the continuous aura ripple.
function RippleRing({
  progress,
  phase,
  size,
  color,
  maxOpacity,
}: {
  progress: SharedValue<number>;
  phase: number;
  size: number;
  color: string;
  maxOpacity: number;
}) {
  const style = useAnimatedStyle(() => {
    const t = (progress.value + phase) % 1;
    return {
      transform: [{ scale: 0.65 + t * 0.55 }],
      opacity: maxOpacity * (1 - t),
    };
  });
  return (
    <Animated.View
      style={[
        styles.ripple,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
        style,
      ]}
    />
  );
}

export default function MicAura({
  size = 197,
  color = '#1f5fa8',
  ringColor = '#9fc3e0',
  glowColor,
  state = 'idle-local',
  showMicIcon = true,
  micIconSize,
  style,
}: MicAuraProps) {
  const middle = size * 0.86;
  const inner = size * 0.46;
  const iconSize = micIconSize ?? Math.round(inner * 0.42);
  const active = ACTIVE_STATES.has(state);
  const auraColor = glowColor ?? color;

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
        duration: active ? 1600 : 2800,
        easing: Easing.out(Easing.ease),
      }),
      -1,
      false
    );
    return () => {
      cancelAnimation(breathe);
      cancelAnimation(ripple);
    };
  }, [active, breathe, ripple]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * (active ? 0.1 : 0.05) }],
    opacity: active ? 0.22 + breathe.value * 0.14 : 0.1 + breathe.value * 0.08,
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * (active ? 0.08 : 0.03) }],
  }));

  return (
    <View
      style={[styles.stage, { width: size, height: size }, style]}
      accessibilityRole="image"
    >
      <Animated.View
        style={[
          styles.glow,
          { width: size, height: size, borderRadius: size / 2, backgroundColor: auraColor },
          glowStyle,
        ]}
      />
      <RippleRing
        progress={ripple}
        phase={0}
        size={size}
        color={auraColor}
        maxOpacity={active ? 0.35 : 0.18}
      />
      <RippleRing
        progress={ripple}
        phase={0.5}
        size={size}
        color={auraColor}
        maxOpacity={active ? 0.35 : 0.18}
      />
      <Animated.View
        style={[
          styles.ring,
          { width: middle, height: middle, borderRadius: middle / 2, backgroundColor: ringColor },
          ringStyle,
        ]}
      >
        <View
          style={[
            styles.core,
            { width: inner, height: inner, borderRadius: inner / 2, backgroundColor: color },
          ]}
        >
          {showMicIcon ? (
            <Ionicons name="mic" size={iconSize} color="#FFFFFF" />
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
  },
  ripple: {
    position: 'absolute',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  core: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
