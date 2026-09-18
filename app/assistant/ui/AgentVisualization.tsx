import { useAgent, useRemoteParticipants } from '@livekit/components-react';
import { BarVisualizer, VideoTrack } from '@livekit/react-native';
import React, { useCallback, useState } from 'react';
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Andora } from '@/constants/Andora';

type AgentVisualizationProps = {
  style: StyleProp<ViewStyle>;
};

const barSize = 0.2;

export default function AgentVisualization({ style }: AgentVisualizationProps) {
  const { state, microphoneTrack, cameraTrack } = useAgent();
  const remoteParticipants = useRemoteParticipants();
  const hasAgent = remoteParticipants.some(
    (participant) => participant.isAgent
  );
  const [barWidth, setBarWidth] = useState(0);
  const [barBorderRadius, setBarBorderRadius] = useState(0);

  const layoutCallback = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setBarWidth(barSize * height);
    setBarBorderRadius(barSize * height);
  }, []);

  let videoView = cameraTrack ? (
    <VideoTrack trackRef={cameraTrack} style={styles.videoTrack} />
  ) : null;
  return (
    <View style={[style, styles.container]}>
      <View style={styles.orbGlow} />
      <View style={styles.orb} onLayout={layoutCallback}>
        <BarVisualizer
          state={state}
          barCount={5}
          options={{
            minHeight: barSize,
            barWidth: barWidth,
            barColor: Andora.colors.onPrimary,
            barBorderRadius: barBorderRadius,
          }}
          trackRef={microphoneTrack}
          style={styles.barVisualizer}
        />
      </View>
      {!hasAgent && (
        <Text style={styles.waitingText}>Memahami Kebutuhan Anda...</Text>
      )}
      {videoView}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Andora.colors.background,
  },
  orbGlow: {
    position: 'absolute',
    width: 232,
    height: 232,
    borderRadius: Andora.radius.pill,
    backgroundColor: Andora.colors.primary,
    opacity: Andora.opacity.subtle,
  },
  orb: {
    width: 192,
    height: 192,
    borderRadius: Andora.radius.pill,
    backgroundColor: Andora.colors.surfaceElevated,
    borderColor: Andora.colors.borderStrong,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    zIndex: 0,
  },
  videoTrack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  barVisualizer: {
    width: '60%',
    height: '30%',
  },
  waitingText: {
    position: 'absolute',
    top: '68%',
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.medium,
  },
});
