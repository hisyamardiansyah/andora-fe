import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';

// Shown on BE-backed screens while debug mode is on: reads on both the
// dark home screen and the light assistant screen.
export default function DebugBanner({ text }: { text?: string }) {
  return (
    <View
      style={styles.banner}
      accessibilityRole="text"
      accessibilityLabel="Mode debug aktif"
    >
      <Ionicons name="bug-outline" size={14} color={Andora.colors.primary} />
      <Text style={styles.text}>
        {text ?? 'Mode debug: data dummy mirip backend, tidak tersimpan'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    maxWidth: '100%',
    marginBottom: Andora.spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Andora.colors.reminderBg,
    borderWidth: 1,
    borderColor: Andora.colors.warning,
    borderRadius: Andora.radius.pill,
  },
  text: {
    flexShrink: 1,
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.caption,
    fontWeight: Andora.typography.weight.bold,
  },
});
