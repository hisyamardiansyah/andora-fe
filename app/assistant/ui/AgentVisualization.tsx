import { useAgent } from '@livekit/components-react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import AssistantOrb from '@/components/AssistantOrb';
import { Andora } from '@/constants/Andora';

type AgentVisualizationProps = {
  style?: StyleProp<ViewStyle>;
};

export default function AgentVisualization({ style }: AgentVisualizationProps) {
  const { state, microphoneTrack } = useAgent();

  return (
    <View style={[style, styles.container]}>
      <AssistantOrb
        size={249}
        color="#1FD5F9"
        state={state}
        themeMode="light"
        audioTrack={microphoneTrack ?? undefined}
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
