import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import DebugBanner from '@/components/DebugBanner';
import { useDebugMode } from '@/hooks/useDebugMode';
import { sendRetryRoute } from '@/lib/letterSendRoutes';

// FIGMA Andora (Copy) yguOf0BB6X0G6FBhAVPHb9 node 54-357 -> /assistant/send-error.
// WhatsApp failure state; retry goes to /assistant/send-retry.
export default function SendErrorScreen() {
  const router = useRouter();
  const { debugEnabled } = useDebugMode();
  const { conversationId, message } = useLocalSearchParams<{
    conversationId?: string;
    message?: string;
  }>();
  const retryParams = sendRetryRoute(
    typeof conversationId === 'string' ? conversationId : undefined
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.brand}>Andora</Text>
        {debugEnabled ? <DebugBanner /> : null}
        <View style={styles.visual}>
          <Ionicons name="warning" size={120} color={Andora.colors.danger} />
        </View>
        <Text style={styles.error}>Dokumen belum terkirim</Text>
        <Text style={styles.error}>
          WhatsApp tidak dapat mengirim dokumen untuk saat ini
        </Text>
        <Text style={styles.note}>Dokumen Anda tetap aman</Text>
        {typeof message === 'string' && message ? (
          <Text style={styles.hint}>{message}</Text>
        ) : null}
        <Pressable
          onPress={() => router.replace(retryParams)}
          style={styles.primaryCta}
          accessibilityRole="button"
        >
          <Text style={styles.primaryCtaText}>Coba kirim lagi</Text>
        </Pressable>
        <Pressable
          onPress={() => router.replace('/home')}
          style={styles.secondaryCta}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryCtaText}>Selesai</Text>
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
  brand: {
    color: Andora.colors.text,
    fontSize: 30,
    fontWeight: Andora.typography.weight.bold,
    textAlign: 'center',
    marginBottom: Andora.spacing.md,
  },
  visual: {
    width: 220,
    height: 211,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    color: Andora.colors.danger,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
    textAlign: 'center',
  },
  note: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'center',
    width: 312,
    marginTop: Andora.spacing.sm,
    marginBottom: Andora.spacing.sm,
  },
  hint: {
    color: Andora.colors.danger,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.medium,
    textAlign: 'center',
    width: 312,
    marginBottom: Andora.spacing.md,
  },
  primaryCta: {
    width: '100%',
    maxWidth: 380,
    height: 55,
    borderRadius: 20,
    backgroundColor: Andora.colors.primary,
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
    height: 55,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryCtaText: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.semibold,
  },
});
