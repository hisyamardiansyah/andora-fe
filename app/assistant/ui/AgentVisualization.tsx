import { useAgent } from '@livekit/components-react';
import { BarVisualizer } from '@livekit/react-native';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
  LayoutChangeEvent,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Andora } from '@/constants/Andora';

type AgentVisualizationProps = {
  style?: StyleProp<ViewStyle>;
};

const MIC_BLUE = '#1f5fa8';
const STATIC_BARS = [18, 32, 44, 28, 38, 22, 40, 26, 34];

export default function AgentVisualization({ style }: AgentVisualizationProps) {
  const { state, microphoneTrack } = useAgent();
  const [barWidth, setBarWidth] = useState(0);
  const [barBorderRadius, setBarBorderRadius] = useState(0);

  const layoutCallback = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    setBarWidth(0.2 * height);
    setBarBorderRadius(0.2 * height);
  }, []);

  return (
    <View style={[style, styles.container]}>
      <View style={styles.orbStage}>
        <View style={styles.orbGlow} />
        <View style={styles.orbOuter}>
          <View style={styles.orbInner}>
            <Ionicons name="mic" size={48} color="#FFFFFF" />
          </View>
        </View>
      </View>
      <View style={styles.waveform} onLayout={layoutCallback}>
        {microphoneTrack ? (
          <BarVisualizer
            state={state}
            barCount={9}
            options={{
              minHeight: 0.2,
              barWidth: barWidth || 8,
              barColor: MIC_BLUE,
              barBorderRadius: barBorderRadius || 5,
            }}
            trackRef={microphoneTrack}
            style={styles.barVisualizer}
          />
        ) : (
          STATIC_BARS.map((height, index) => (
            <View key={index} style={[styles.staticBar, { height }]} />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Andora.colors.background,
  },
  orbStage: {
    width: 249,
    height: 249,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbGlow: {
    position: 'absolute',
    width: 249,
    height: 249,
    borderRadius: Andora.radius.pill,
    backgroundColor: MIC_BLUE,
    opacity: 0.12,
  },
  orbOuter: {
    width: 200,
    height: 200,
    borderRadius: Andora.radius.pill,
    backgroundColor: Andora.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInner: {
    width: 120,
    height: 120,
    borderRadius: Andora.radius.pill,
    backgroundColor: MIC_BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveform: {
    width: 185,
    height: 50,
    marginTop: Andora.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  barVisualizer: {
    width: '100%',
    height: '100%',
  },
  staticBar: {
    width: 10,
    borderRadius: 5,
    backgroundColor: MIC_BLUE,
  },
});
