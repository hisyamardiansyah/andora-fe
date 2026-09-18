import {
  ReceivedMessage,
  useLocalParticipant,
} from '@livekit/components-react';
import { useCallback } from 'react';
import {
  ListRenderItemInfo,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { Andora } from '@/constants/Andora';

export type ChatLogProps = {
  style: StyleProp<ViewStyle>;
  messages: ReceivedMessage[];
};
export default function ChatLog({
  style,
  messages: transcriptions,
}: ChatLogProps) {
  const { localParticipant } = useLocalParticipant();

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ReceivedMessage>) => {
      const isLocalUser = item.from === localParticipant;
      if (isLocalUser) {
        return <UserTranscriptionText text={item.message} />;
      } else {
        return <AgentTranscriptionText text={item.message} />;
      }
    },
    [localParticipant]
  );

  return (
    <Animated.FlatList
      renderItem={renderItem}
      data={transcriptions.toReversed()}
      style={style}
      inverted={true}
      itemLayoutAnimation={LinearTransition}
    />
  );
}

const UserTranscriptionText = (props: { text: string }) => {
  let { text } = props;

  return (
    text && (
      <View style={styles.userTranscriptionContainer}>
        <Text style={styles.userTranscription}>{text}</Text>
      </View>
    )
  );
};

const AgentTranscriptionText = (props: { text: string }) => {
  let { text } = props;
  return (
    text && (
      <View style={styles.agentTranscriptionContainer}>
        <Text style={styles.agentTranscription}>{text}</Text>
      </View>
    )
  );
};

const styles = StyleSheet.create({
  userTranscriptionContainer: {
    width: '100%',
    alignItems: 'flex-end',
    paddingHorizontal: Andora.spacing.md,
    marginBottom: Andora.spacing.sm,
  },
  userTranscription: {
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.semibold,
    lineHeight: Andora.typography.lineHeight.normal,
    color: Andora.colors.onPrimary,
    backgroundColor: Andora.colors.bubbleUser,
    alignSelf: 'flex-end',
    borderRadius: Andora.radius.md,
    borderBottomRightRadius: Andora.radius.xs,
    paddingHorizontal: Andora.spacing.md,
    paddingVertical: Andora.spacing.sm,
    maxWidth: '85%',
  },
  agentTranscriptionContainer: {
    width: '100%',
    alignItems: 'flex-start',
    paddingHorizontal: Andora.spacing.md,
    marginBottom: Andora.spacing.sm,
  },
  agentTranscription: {
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.regular,
    lineHeight: Andora.typography.lineHeight.normal,
    color: Andora.colors.text,
    backgroundColor: Andora.colors.surfaceElevated,
    borderColor: Andora.colors.borderStrong,
    borderWidth: 1,
    textAlign: 'left',
    borderRadius: Andora.radius.md,
    borderBottomLeftRadius: Andora.radius.xs,
    paddingHorizontal: Andora.spacing.md,
    paddingVertical: Andora.spacing.sm,
    maxWidth: '85%',
  },
});
