import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  useAnimatedValue,
  View,
  ViewStyle,
} from 'react-native';

import React, { useCallback, useEffect, useState } from 'react';
import {
  AudioSession,
  useIOSAudioManagement,
  useLocalParticipant,
  useParticipantTracks,
  useRoomContext,
  VideoTrack,
} from '@livekit/react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import ControlBar from './ui/ControlBar';
import ChatBar from './ui/ChatBar';
import ChatLog from './ui/ChatLog';
import AgentVisualization from './ui/AgentVisualization';
import { Track } from 'livekit-client';
import {
  TrackReference,
  useSessionMessages,
  useTrackToggle,
} from '@livekit/components-react';
import { useConnection } from '@/hooks/useConnection';
import { Andora } from '@/constants/Andora';

export default function AssistantScreen() {
  useEffect(() => {
    let start = async () => {
      await AudioSession.startAudioSession();
    };

    start();
    return () => {
      AudioSession.stopAudioSession();
    };
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <RoomView />
    </SafeAreaView>
  );
}

const RoomView = () => {
  const router = useRouter();
  const connection = useConnection();
  const room = useRoomContext();

  useIOSAudioManagement(room, true);

  const {
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
    cameraTrack: localCameraTrack,
    localParticipant,
  } = useLocalParticipant();
  const localParticipantIdentity = localParticipant.identity;

  const localScreenShareTrack = useParticipantTracks(
    [Track.Source.ScreenShare],
    localParticipantIdentity
  );

  const localVideoTrack =
    localCameraTrack && isCameraEnabled
      ? ({
          participant: localParticipant,
          publication: localCameraTrack,
          source: Track.Source.Camera,
        } satisfies TrackReference)
      : localScreenShareTrack.length > 0 && isScreenShareEnabled
      ? localScreenShareTrack[0]
      : null;

  const { messages, send } = useSessionMessages();
  const [isChatEnabled, setChatEnabled] = useState(false);
  const [chatMessage, setChatMessage] = useState('');

  const onChatSend = useCallback(
    (message: string) => {
      send(message);
      setChatMessage('');
    },
    [setChatMessage, send]
  );

  const micToggle = useTrackToggle({ source: Track.Source.Microphone });
  const cameraToggle = useTrackToggle({ source: Track.Source.Camera });
  const screenShareToggle = useTrackToggle({
    source: Track.Source.ScreenShare,
  });
  const onChatClick = useCallback(() => {
    setChatEnabled(!isChatEnabled);
  }, [isChatEnabled, setChatEnabled]);
  const onExitClick = useCallback(() => {
    connection.disconnect();
    router.back();
  }, [connection, router]);

  const [containerWidth, setContainerWidth] = useState(
    Dimensions.get('window').width
  );
  const [containerHeight, setContainerHeight] = useState(
    Dimensions.get('window').height
  );
  const agentVisualizationPosition = useAgentVisualizationPosition(
    isChatEnabled,
    isCameraEnabled || isScreenShareEnabled
  );
  const localVideoPosition = useLocalVideoPosition(isChatEnabled, {
    width: containerWidth,
    height: containerHeight,
  });

  let localVideoView = localVideoTrack ? (
    <Animated.View
      style={[
        {
          position: 'absolute',
          zIndex: 1,
          ...localVideoPosition,
        },
      ]}
    >
      <VideoTrack trackRef={localVideoTrack} style={styles.video} />
    </Animated.View>
  ) : null;

  return (
    <View
      style={styles.container}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setContainerWidth(width);
        setContainerHeight(height);
      }}
    >
      <View style={styles.header}>
        <View style={styles.statusDot} />
        <Text style={styles.headerTitle}>Andora Mendengarkan...</Text>
      </View>
      <Text style={styles.headerSubtitle}>Silakan deskripsikan kebutuhan dokumen anda</Text>
      <View style={styles.spacer} />
      <ChatLog style={styles.logContainer} messages={messages} />
      <ChatBar
        style={styles.chatBar}
        value={chatMessage}
        onChangeText={(value) => {
          setChatMessage(value);
        }}
        onChatSend={onChatSend}
      />

      <Animated.View
        style={[
          {
            position: 'absolute',
            zIndex: 1,
            backgroundColor: Andora.colors.background,
            ...agentVisualizationPosition,
          },
        ]}
      >
        <AgentVisualization style={styles.agentVisualization} />
      </Animated.View>

      {localVideoView}

      <Link href="/assistant/validate" asChild>
        <Pressable style={styles.validateLink}>
          <Text style={styles.validateLinkText}>Review pemahaman Andora</Text>
        </Pressable>
      </Link>

      <Pressable onPress={onExitClick} style={styles.cancelCta} accessibilityRole="button">
        <Text style={styles.cancelCtaText}>✕   Batalkan</Text>
      </Pressable>

      <ControlBar
        style={styles.controlBar}
        options={{
          isMicEnabled: isMicrophoneEnabled,
          isCameraEnabled,
          isScreenShareEnabled,
          isChatEnabled,
          onMicClick: micToggle.toggle,
          onCameraClick: cameraToggle.toggle,
          onChatClick,
          onScreenShareClick: screenShareToggle.toggle,
          onExitClick,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Andora.colors.background,
  },
  container: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    backgroundColor: Andora.colors.background,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Andora.spacing.md,
    paddingBottom: Andora.spacing.sm,
    paddingHorizontal: Andora.spacing.md,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: Andora.radius.pill,
    backgroundColor: Andora.colors.success,
    marginEnd: Andora.spacing.sm,
  },
  headerTitle: {
    color: Andora.colors.text,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
  },
  headerSubtitle: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'center',
    paddingHorizontal: Andora.spacing.lg,
  },
  spacer: {
    height: '18%',
  },
  logContainer: {
    width: '100%',
    flexGrow: 1,
    flexDirection: 'column',
    marginBottom: Andora.spacing.sm,
  },
  chatBar: {
    left: 0,
    right: 0,
    marginHorizontal: Andora.spacing.md,
    marginBottom: Andora.spacing.md,
  },
  controlBar: {
    left: 0,
    right: 0,
    zIndex: 2,
    marginHorizontal: Andora.spacing.md,
    marginBottom: Andora.spacing.sm,
  },
  validateLink: {
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    borderRadius: Andora.radius.md,
    paddingVertical: 12,
    paddingHorizontal: Andora.spacing.lg,
    marginHorizontal: Andora.spacing.md,
    marginBottom: Andora.spacing.sm,
    alignItems: 'center',
  },
  validateLinkText: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
  },
  cancelCta: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    borderRadius: 20,
    width: 178,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Andora.spacing.md,
    marginBottom: Andora.spacing.sm,
  },
  cancelCtaText: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: Andora.radius.md,
  },
  agentVisualization: {
    width: '100%',
    height: '100%',
  },
});

const expandedAgentWidth = 1;
const expandedAgentHeight = 1;
const expandedLocalWidth = 0.3;
const expandedLocalHeight = 0.2;
const collapsedWidth = 0.3;
const collapsedHeight = 0.2;

const createAnimConfig = (toValue: any) => {
  return {
    toValue,
    stiffness: 200,
    damping: 30,
    useNativeDriver: false,
    isInteraction: false,
    overshootClamping: true,
  };
};

const useAgentVisualizationPosition = (
  isChatVisible: boolean,
  hasLocalVideo: boolean
) => {
  const width = useAnimatedValue(
    isChatVisible ? collapsedWidth : expandedAgentWidth
  );
  const height = useAnimatedValue(
    isChatVisible ? collapsedHeight : expandedAgentHeight
  );

  useEffect(() => {
    const widthAnim = Animated.spring(
      width,
      createAnimConfig(isChatVisible ? collapsedWidth : expandedAgentWidth)
    );
    const heightAnim = Animated.spring(
      height,
      createAnimConfig(isChatVisible ? collapsedHeight : expandedAgentHeight)
    );

    widthAnim.start();
    heightAnim.start();

    return () => {
      widthAnim.stop();
      heightAnim.stop();
    };
  }, [width, height, isChatVisible]);

  const x = useAnimatedValue(0);
  const y = useAnimatedValue(0);
  useEffect(() => {
    let targetX: number;
    let targetY: number;

    if (!isChatVisible) {
      targetX = 0;
      targetY = 0;
    } else {
      if (!hasLocalVideo) {
        targetX = 0.5 - collapsedWidth / 2;
        targetY = 16;
      } else {
        targetX = 0.32 - collapsedWidth / 2;
        targetY = 16;
      }
    }

    const xAnim = Animated.spring(x, createAnimConfig(targetX));
    const yAnim = Animated.spring(y, createAnimConfig(targetY));

    xAnim.start();
    yAnim.start();

    return () => {
      xAnim.stop();
      yAnim.stop();
    };
  }, [x, y, isChatVisible, hasLocalVideo]);

  return {
    left: x.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
    top: y,
    width: width.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
    height: height.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
  };
};

const useLocalVideoPosition = (
  isChatVisible: boolean,
  containerDimens: { width: number; height: number }
): ViewStyle => {
  const width = useAnimatedValue(
    isChatVisible ? collapsedWidth : expandedLocalWidth
  );
  const height = useAnimatedValue(
    isChatVisible ? collapsedHeight : expandedLocalHeight
  );

  useEffect(() => {
    const widthAnim = Animated.spring(
      width,
      createAnimConfig(isChatVisible ? collapsedWidth : expandedLocalWidth)
    );
    const heightAnim = Animated.spring(
      height,
      createAnimConfig(isChatVisible ? collapsedHeight : expandedLocalHeight)
    );

    widthAnim.start();
    heightAnim.start();

    return () => {
      widthAnim.stop();
      heightAnim.stop();
    };
  }, [width, height, isChatVisible]);

  const x = useAnimatedValue(0);
  const y = useAnimatedValue(0);
  useEffect(() => {
    let targetX: number;
    let targetY: number;

    if (!isChatVisible) {
      targetX = 1 - expandedLocalWidth - 16 / containerDimens.width;
      targetY = 1 - expandedLocalHeight - 106 / containerDimens.height;
    } else {
      targetX = 0.66 - collapsedWidth / 2;
      targetY = 0;
    }

    const xAnim = Animated.spring(x, createAnimConfig(targetX));
    const yAnim = Animated.spring(y, createAnimConfig(targetY));
    xAnim.start();
    yAnim.start();
    return () => {
      xAnim.stop();
      yAnim.stop();
    };
  }, [containerDimens.width, containerDimens.height, x, y, isChatVisible]);

  return {
    left: x.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
    top: y.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
    width: width.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
    height: height.interpolate({
      inputRange: [0, 1],
      outputRange: ['0%', '100%'],
    }),
    marginTop: 16,
  };
};
