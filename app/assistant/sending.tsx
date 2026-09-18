import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import { downloadLetterPdf } from '@/lib/downloadLetterPdf';
import { SHARE_CANCELLED_CODE, shareLetterToWhatsApp } from '@/lib/shareLetter';
import { useSessionContext } from '@/hooks/useSession';

// FIGMA Andora (Copy) yguOf0BB6X0G6FBhAVPHb9 node 48-237 -> /assistant/sending.
// Real send: downloads the PDF from the backend, then shares to WhatsApp.
// Requires a dev build (`npx expo run:android`); Expo Go will NOT work.
export default function SendingScreen() {
  const router = useRouter();
  const { title, recipient } = useLocalSearchParams<{
    title?: string;
    recipient?: string;
  }>();
  const { accessToken } = useSessionContext();
  const [status, setStatus] = useState('Menyiapkan dokumen...');
  const [hint, setHint] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const uri = await downloadLetterPdf(undefined, {
          accessToken: accessToken ?? undefined,
        });
        if (cancelled) return;
        setStatus('Mengirim Dokumen...');
        await shareLetterToWhatsApp(uri);
        if (cancelled) return;
        router.replace('/assistant/send-result?ok=1');
      } catch (error) {
        if (cancelled) return;
        if ((error as { code?: string })?.code === SHARE_CANCELLED_CODE) {
          router.replace('/home');
          return;
        }
        if (error instanceof Error && error.message) {
          setHint(`Unduhan/pengiriman gagal: ${error.message}`);
        }
        router.replace('/assistant/send-error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router, accessToken]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Text style={styles.brand}>Andora</Text>
        <View style={styles.visual}>
          <ActivityIndicator size="large" color={Andora.colors.primary} />
        </View>
        <Text style={styles.title}>Mengirim Dokumen...</Text>
        <Text style={styles.subtitle}>
          {status === 'Menyiapkan dokumen...'
            ? 'Mohon tunggu sebentar'
            : status}
        </Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
        <View style={styles.card}>
          <Ionicons
            name="document-text"
            size={38}
            color={Andora.colors.primary}
          />
          <Text style={styles.cardTitle}>
            {typeof title === 'string' && title ? title : 'Surat Andora'}
          </Text>
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
        </View>
        <Pressable
          onPress={() => router.back()}
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
