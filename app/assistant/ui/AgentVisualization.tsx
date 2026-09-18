import { useAgent } from '@livekit/components-react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import AgentAuraGL from '@/components/AgentAuraGL';
import { Andora } from '@/constants/Andora';

type AgentVisualizationProps = {
  style?: StyleProp<ViewStyle>;
};

export default function AgentVisualization({ style }: AgentVisualizationProps) {
  const { state, microphoneTrack } = useAgent();

  return (
    <View style={[style, styles.container]}>
      <AgentAuraGL
        size={249}
        color="#1FD5F9"
        colorShift={0.05}
        state={state}
        themeMode="light"
        audioTrack={microphoneTrack ?? undefined}
        micIconSize={48}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Andora.colors.background,
  },
});
