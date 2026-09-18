import {
  ViewStyle,
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  StyleProp,
} from 'react-native';
import { Andora } from '@/constants/Andora';

type ControlBarProps = {
  style?: StyleProp<ViewStyle>;
  options: ControlBarOptions;
};

type ControlBarOptions = {
  isMicEnabled: boolean;
  onMicClick: () => void;
  isCameraEnabled: boolean;
  onCameraClick: () => void;
  isScreenShareEnabled: boolean;
  onScreenShareClick: () => void;
  isChatEnabled: boolean;
  onChatClick: () => void;
  onExitClick: () => void;
};

export default function ControlBar({ style = {}, options }: ControlBarProps) {
  let micImage = options.isMicEnabled
    ? require('@/assets/images/mic_24dp.png')
    : require('@/assets/images/mic_off_24dp.png');
  let cameraImage = options.isCameraEnabled
    ? require('@/assets/images/videocam_24dp.png')
    : require('@/assets/images/videocam_off_24dp.png');
  let screenShareImage = options.isScreenShareEnabled
    ? require('@/assets/images/present_to_all_24dp.png')
    : require('@/assets/images/present_to_all_off_24dp.png');
  let chatImage = options.isChatEnabled
    ? require('@/assets/images/chat_24dp.png')
    : require('@/assets/images/chat_off_24dp.png');
  let exitImage = require('@/assets/images/call_end_24dp.png');

  return (
    <View style={[style, styles.container]}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.micButton,
          options.isMicEnabled ? styles.micActive : styles.micMuted,
        ]}
        activeOpacity={0.7}
        onPress={() => options.onMicClick()}
      >
        <Image style={styles.icon} source={micImage} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          options.isCameraEnabled ? styles.enabledButton : undefined,
        ]}
        activeOpacity={0.7}
        onPress={() => options.onCameraClick()}
      >
        <Image style={styles.icon} source={cameraImage} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          options.isScreenShareEnabled ? styles.enabledButton : undefined,
        ]}
        activeOpacity={0.7}
        onPress={() => options.onScreenShareClick()}
      >
        <Image style={styles.icon} source={screenShareImage} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          options.isChatEnabled ? styles.enabledButton : undefined,
        ]}
        activeOpacity={0.7}
        onPress={() => options.onChatClick()}
      >
        <Image style={styles.icon} source={chatImage} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, styles.exitButton]}
        activeOpacity={0.7}
        onPress={() => options.onExitClick()}
      >
        <Image style={styles.icon} source={exitImage} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Andora.spacing.sm,
    paddingVertical: Andora.spacing.sm,
    backgroundColor: Andora.colors.surface,
    borderColor: Andora.colors.borderStrong,
    borderRadius: Andora.radius.pill,
    borderWidth: 1,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    padding: Andora.spacing.sm,
    marginHorizontal: Andora.spacing.xs,
    borderRadius: Andora.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  micButton: {
    borderRadius: Andora.radius.pill,
    paddingHorizontal: Andora.spacing.md,
  },
  micActive: {
    backgroundColor: Andora.colors.primary,
  },
  micMuted: {
    backgroundColor: Andora.colors.surfaceElevated,
    borderColor: Andora.colors.borderStrong,
    borderWidth: 1,
  },
  enabledButton: {
    backgroundColor: Andora.colors.surfaceElevated,
  },
  exitButton: {
    backgroundColor: Andora.colors.danger,
    borderRadius: Andora.radius.pill,
  },
  icon: {
    width: 20,
    height: 20,
  },
});
