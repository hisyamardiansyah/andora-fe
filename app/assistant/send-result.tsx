import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import DebugBanner from '@/components/DebugBanner';
import { useDebugMode } from '@/hooks/useDebugMode';

// FIGMA Andora (Copy) yguOf0BB6X0G6FBhAVPHb9 node 48-289 -> /assistant/send-result.
// Success state; error is handled by /assistant/send-error.
// Card shows the actual send time plus optional title/recipient params.
export default function SendResultScreen() {
  const router = useRouter();
  const { debugEnabled } = useDebugMode();
  const { ok, title, recipient, conversationId } = useLocalSearchParams<{
    ok?: string;
    title?: string;
    recipient?: string;
    conversationId?: string;
  }>();
  void ok;
  const sentAt = new Date().toLocaleString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.brand}>Andora</Text>
        {debugEnabled ? <DebugBanner /> : null}
        <View style={styles.visual}>
          <Ionicons
            name="checkmark-circle"
            size={120}
            color={Andora.colors.success}
          />
        </View>
        <Text style={styles.title}>Dokumen Terkirim</Text>
        <Text style={styles.subtitle}>Mohon tunggu sebentar</Text>
        <View style={styles.card}>
          <Ionicons
            name="document-text"
            size={38}
            color={Andora.colors.primary}
          />
          <Text style={styles.cardTitle}>
            {typeof title === 'string' && title ? title : 'Surat Andora'}
          </Text>
          {debugEnabled &&
          typeof conversationId === 'string' &&
          conversationId ? (
            <View style={styles.row}>
              <Text style={styles.label}>Conversation</Text>
              <Text style={styles.value}>{conversationId}</Text>
            </View>
          ) : null}
          <View style={styles.row}>
            <Text style={styles.label}>Pengiriman Via</Text>
            <Text style={styles.value}>WhatsApp</Text>
          </View>
          {typeof recipient === 'string' && recipient ? (
            <View style={styles.row}>
              <Text style={styles.label}>Kontak Penerima</Text>
              <Text style={styles.value}>{recipient}</Text>
            </View>
          ) : null}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{sentAt}</Text>
          </View>
        </View>
        <Pressable
          onPress={() => router.replace('/home')}
          style={styles.primaryCta}
          accessibilityRole="button"
        >
          <Text style={styles.primaryCtaText}>Selesai</Text>
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
  title: {
    color: Andora.colors.text,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
    textAlign: 'center',
  },
  subtitle: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'center',
    width: 312,
    marginBottom: Andora.spacing.md,
  },
  card: {
    width: 315,
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    borderRadius: 10,
    padding: Andora.spacing.sm,
    gap: 6,
    marginBottom: Andora.spacing.md,
  },
  cardTitle: {
    color: Andora.colors.text,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.bold,
  },
  row: { gap: 2 },
  label: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.medium,
  },
  value: {
    color: Andora.colors.bubbleUser,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
  },
  badge: {
    width: '100%',
    backgroundColor: Andora.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: '#D3DFEA',
    borderRadius: 7,
    padding: 10,
  },
  badgeText: {
    color: Andora.colors.bubbleUser,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
  },
  primaryCta: {
    width: '100%',
    maxWidth: 380,
    height: 55,
    borderRadius: 20,
    backgroundColor: Andora.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryCtaText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
  },
});
