import { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import type { LocalAudioTrack, RemoteAudioTrack } from 'livekit-client';
import type {
  AgentState,
  TrackReferenceOrPlaceholder,
} from '@livekit/components-react';
import { useTrackVolume as useNativeTrackVolume } from '@livekit/react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { AURA_DEFAULT_COLOR, clamp01, targetsForState } from '@/lib/agentAura';

export type AssistantOrbState = AgentState | 'idle-local';
export type AssistantOrbTrack =
  | LocalAudioTrack
  | RemoteAudioTrack
  | TrackReferenceOrPlaceholder;

type AssistantOrbProps = {
  size?: number;
  color?: string;
  state?: AssistantOrbState;
  themeMode?: 'dark' | 'light';
  audioTrack?: AssistantOrbTrack;
  volume?: number;
  style?: StyleProp<ViewStyle>;
};

const ACTIVE_STATES: ReadonlySet<string> = new Set([
  'speaking',
  'thinking',
  'listening',
]);

// Hook order must stay stable, so the component always calls the native
// volume hook and only gates the reported value on having a live track.
function useProbedVolume(
  track: AssistantOrbTrack | undefined,
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

function durationForSpeed(speed: number, base: number): number {
  if (speed >= 70) return Math.round(base * 0.35);
  if (speed >= 30) return Math.round(base * 0.6);
  if (speed >= 20) return Math.round(base * 0.8);
  return base;
}

// One arc ring of the orb shell, rotating around the core.
function OrbRing({
  spin,
  diameter,
  color,
  borderWidth,
  opacity,
  bottom = false,
  reverse = false,
}: {
  spin: SharedValue<number>;
  diameter: number;
  color: string;
  borderWidth: number;
  opacity: number;
  bottom?: boolean;
  reverse?: boolean;
}) {
  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${reverse ? -spin.value : spin.value}deg` }],
    opacity,
  }));
  return (
    <Animated.View
      style={[
        styles.centered,
        {
          width: diameter,
          height: diameter,
          borderRadius: diameter / 2,
          borderWidth,
          borderColor: 'transparent',
          ...(bottom
            ? { borderBottomColor: color, borderLeftColor: color }
            : { borderTopColor: color, borderRightColor: color }),
        },
        style,
      ]}
    />
  );
}

export default function AssistantOrb({
  size = 197,
  color = AURA_DEFAULT_COLOR,
  state = 'idle-local',
  themeMode = 'dark',
  audioTrack,
  volume,
  style,
}: AssistantOrbProps) {
  const targets = targetsForState(state);
  const level = clamp01(useProbedVolume(audioTrack, volume));
  const active =
    ACTIVE_STATES.has(state) ||
    state === 'pre-connect-buffering' ||
    level > 0.02;
  const dim = themeMode === 'light';

  const glowSize = size;
  const orbitSize = size * 0.8;
  const ringOuter = size * 0.78;
  const ringInner = size * 0.62;
  const coreSize = size * 0.5;
  const ringWidth = Math.max(2, size * 0.012);
  const dotSize = Math.max(6, size * 0.055);
  const glossSize = size * 0.13;
  const coreLayers = [
    { fraction: 1, opacity: (dim ? 0.16 : 0.24) + level * 0.15 },
    { fraction: 0.8, opacity: (dim ? 0.22 : 0.34) + level * 0.18 },
    { fraction: 0.6, opacity: (dim ? 0.3 : 0.48) + level * 0.2 },
    { fraction: 0.4, opacity: (dim ? 0.45 : 0.68) + level * 0.2 },
  ];

  const breathe = useSharedValue(0);
  const spinA = useSharedValue(0);
  const spinB = useSharedValue(0);
  const satellite = useSharedValue(0);

  useEffect(() => {
    breathe.value = withRepeat(
      withTiming(1, {
        duration: active ? 900 : 2200,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
    spinA.value = withRepeat(
      withTiming(360, {
        duration: durationForSpeed(targets.speed, 6000),
        easing: Easing.linear,
      }),
      -1,
      false
    );
    spinB.value = withRepeat(
      withTiming(360, {
        duration: durationForSpeed(targets.speed, 9000),
        easing: Easing.linear,
      }),
      -1,
      false
    );
    satellite.value = withRepeat(
      withTiming(360, {
        duration: durationForSpeed(targets.speed, 4200),
        easing: Easing.linear,
      }),
      -1,
      false
    );
    return () => {
      cancelAnimation(breathe);
      cancelAnimation(spinA);
      cancelAnimation(spinB);
      cancelAnimation(satellite);
    };
  }, [active, targets.speed, breathe, spinA, spinB, satellite]);

  const glowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * (0.03 + level * 0.08) }],
    opacity: Math.min(
      0.45,
      Math.max(0.08, 0.18 + breathe.value * 0.08 + level * 0.22)
    ),
  }));

  const coreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + breathe.value * (0.04 + level * 0.12) }],
  }));

  const orbitStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${satellite.value}deg` }],
  }));

  const glossStyle = useAnimatedStyle(() => ({
    opacity: 0.35 + breathe.value * 0.25,
  }));

  return (
    <View
      testID="assistant-orb"
      accessibilityRole="image"
      accessibilityLabel="Asisten suara Andora"
      style={[styles.stage, { width: size, height: size }, style]}
    >
      <Animated.View
        style={[
          styles.centered,
          {
            width: glowSize,
            height: glowSize,
            borderRadius: glowSize / 2,
            backgroundColor: color,
          },
          glowStyle,
        ]}
      />
      <OrbRing
        spin={spinA}
        diameter={ringOuter}
        color={color}
        borderWidth={ringWidth}
        opacity={active ? 0.85 : 0.5}
      />
      <OrbRing
        spin={spinB}
        diameter={ringInner}
        color={color}
        borderWidth={ringWidth}
        opacity={active ? 0.7 : 0.4}
        bottom
        reverse
      />
      <Animated.View
        style={[
          styles.centered,
          {
            width: coreSize,
            height: coreSize,
            alignItems: 'center',
            justifyContent: 'center',
          },
          coreStyle,
        ]}
      >
        {coreLayers.map((layer, index) => {
          const d = coreSize * layer.fraction;
          return (
            <View
              key={`core-${index}`}
              style={{
                position: 'absolute',
                width: d,
                height: d,
                borderRadius: d / 2,
                left: (coreSize - d) / 2,
                top: (coreSize - d) / 2,
                backgroundColor: color,
                opacity: Math.min(0.95, layer.opacity),
              }}
            />
          );
        })}
      </Animated.View>
      <Animated.View
        style={[
          styles.centered,
          {
            width: orbitSize,
            height: orbitSize,
          },
          orbitStyle,
        ]}
      >
        <View
          style={{
            position: 'absolute',
            width: dotSize,
            height: dotSize,
            borderRadius: dotSize / 2,
            left: (orbitSize - dotSize) / 2,
            top: -dotSize / 2,
            backgroundColor: color,
            opacity: active ? 1 : 0.6,
          }}
        />
      </Animated.View>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: glossSize,
            height: glossSize,
            borderRadius: glossSize / 2,
            left: size * 0.38,
            top: size * 0.3,
            backgroundColor: '#FFFFFF',
          },
          glossStyle,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centered: {
    position: 'absolute',
  },
});
