import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleProp,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { Andora } from '@/constants/Andora';

type ChatBarProps = {
  style: StyleProp<ViewStyle>;
  value: string;
  onChangeText: (text: string) => void;
  onChatSend: (text: string) => void;
};

export default function ChatBar({
  style,
  value,
  onChangeText,
  onChatSend,
}: ChatBarProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[style]}
      keyboardVerticalOffset={24}
    >
      <View style={styles.container}>
        <TextInput
          style={[styles.input]}
          value={value}
          placeholder={'Ketik atau langsung bicara'}
          placeholderTextColor={Andora.colors.textMuted}
          onChangeText={onChangeText}
          multiline={true}
        />
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.7}
          onPress={() => onChatSend(value)}
        >
          <View>
            <Image source={require('@/assets/images/arrow_upward_24dp.png')} />
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Andora.colors.inputBg,
    borderColor: Andora.colors.borderStrong,
    borderWidth: 1,
    borderRadius: 20,
    height: 59,
    padding: Andora.spacing.sm,
    paddingStart: 15,
    paddingEnd: 13,
  },
  input: {
    flexGrow: 1,
    flexShrink: 1,
    marginStart: Andora.spacing.sm,
    marginEnd: Andora.spacing.md,
    color: Andora.colors.inputFilled,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
  button: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Andora.radius.pill,
    backgroundColor: Andora.colors.primary,
  },
});
