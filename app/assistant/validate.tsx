import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';

// FIGMA Andora (Copy) 7IHCYJs2bVqT4uzuCJKzhF node 22-1254 -> /assistant/validate.
// Confirmation of the understood document need before continuing the LiveKit chat.
export default function ValidateScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <View style={styles.doneBadge}>
          <Ionicons
            name="checkmark"
            size={48}
            color={Andora.colors.onPrimary}
          />
        </View>
        <Text style={styles.title}>Andora paham, Anda ingin:</Text>
        <View style={styles.card}>
          <Ionicons
            name="document-text"
            size={54}
            color={Andora.colors.primary}
          />
          <Text style={styles.cardTitle}>
            Membuat surat keterangan tidak mampu
          </Text>
        </View>
        <Text style={styles.question}>Apakah ini sudah benar?</Text>

        <Pressable
          onPress={() => router.push('/assistant')}
          style={styles.primaryCta}
          accessibilityRole="button"
        >
          <Text style={styles.primaryCtaText}>Ya, Lanjutkan</Text>
        </Pressable>
        <Pressable
          onPress={() => router.back()}
          style={styles.secondaryCta}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryCtaText}>Ubah/katakan lagi</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace('/home')}
          style={styles.cancelCta}
          accessibilityRole="button"
        >
          <Ionicons name="close" size={18} color={Andora.colors.primary} />
          <Text style={styles.cancelText}>Batalkan</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Andora.colors.background },
  body: {
    flex: 1,
    padding: Andora.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBadge: {
    width: 91,
    height: 88,
    borderRadius: 46,
    backgroundColor: Andora.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Andora.spacing.md,
  },
  title: {
    color: Andora.colors.text,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
    textAlign: 'center',
    marginBottom: Andora.spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    minHeight: 99,
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    borderRadius: 10,
    padding: Andora.spacing.sm,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: Andora.spacing.md,
  },
  cardTitle: {
    flex: 1,
    color: Andora.colors.text,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
  question: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.semibold,
    marginBottom: Andora.spacing.lg,
  },
  primaryCta: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: Andora.colors.primary,
    borderRadius: 20,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Andora.spacing.sm,
  },
  primaryCtaText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
  },
  secondaryCta: {
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    borderRadius: 20,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Andora.spacing.md,
  },
  secondaryCtaText: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.semibold,
  },
  cancelCta: {
    flexDirection: 'row',
    gap: 15,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    borderRadius: 20,
    width: 178,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Andora.spacing.sm,
  },
  cancelText: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
});
