import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import AndoraNavbar from '@/components/AndoraNavbar';
import { useConversationList } from '@/hooks/useConversations';
import { useDebugMode } from '@/hooks/useDebugMode';
import { useSessionContext } from '@/hooks/useSession';

// Document list: cards come from GET /conversations (latest first).
// Tapping a card opens its transcript in /assistant.
export default function InsightScreen() {
  const router = useRouter();
  const { accessToken } = useSessionContext();
  const { debugEnabled } = useDebugMode();
  const { items, loading, error } = useConversationList();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Dokumen</Text>
        <Text style={styles.subtitle}>Surat siap kirim</Text>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="small" color={Andora.colors.primary} />
            <Text style={styles.stateText}>Memuat dokumen...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>Gagal memuat: {error}</Text>
          </View>
        ) : !accessToken && !debugEnabled ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>
              Masuk dulu untuk melihat dokumen Anda.
            </Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>
              Belum ada dokumen. Mulai percakapan baru dari tab Pesan.
            </Text>
          </View>
        ) : (
          items.map((doc) => (
            <Pressable
              key={doc.id}
              onPress={() =>
                router.push({
                  pathname: '/assistant',
                  params: { conversationId: doc.id },
                })
              }
              style={styles.card}
              accessibilityRole="button"
            >
              <Ionicons
                name="document-text"
                size={40}
                color={Andora.colors.primary}
              />
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{doc.title}</Text>
                {doc.last_message_preview ? (
                  <Text style={styles.cardMeta} numberOfLines={2}>
                    {doc.last_message_preview}
                  </Text>
                ) : null}
                <Text style={styles.openText}>Buka</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color={Andora.colors.primaryMuted}
              />
            </Pressable>
          ))
        )}
      </ScrollView>
      <AndoraNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Andora.colors.background },
  scroll: { padding: Andora.spacing.lg, paddingBottom: Andora.spacing.xl },
  title: {
    color: Andora.colors.text,
    fontSize: 30,
    fontWeight: Andora.typography.weight.bold,
  },
  subtitle: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.semibold,
    marginBottom: Andora.spacing.md,
  },
  card: {
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    borderRadius: 10,
    padding: Andora.spacing.md,
    flexDirection: 'row',
    gap: Andora.spacing.sm,
    alignItems: 'center',
    marginBottom: Andora.spacing.sm,
  },
  cardText: { flex: 1, gap: 4 },
  cardTitle: {
    color: Andora.colors.text,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
  cardMeta: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
  },
  openText: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'right',
  },
  stateBox: {
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    borderRadius: 10,
    padding: Andora.spacing.md,
    alignItems: 'center',
    gap: 8,
  },
  stateText: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    textAlign: 'center',
  },
});
