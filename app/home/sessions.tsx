import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import AndoraNavbar from '@/components/AndoraNavbar';
import { useConversationList } from '@/hooks/useConversations';
import { useSessionContext } from '@/hooks/useSession';

// FIGMA Andora (Copy) 7IHCYJs2bVqT4uzuCJKzhF node 41-121 (list) + 43-217 (sheet)
// -> /home/sessions. List comes from GET /conversations; the sheet
// creates a conversation then opens /assistant?conversationId=....
export default function SessionsScreen() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const { accessToken } = useSessionContext();
  const { items, loading, error, create } = useConversationList(
    query.trim() ? query.trim() : undefined
  );

  const openConversation = (conversationId: string) => {
    router.push({
      pathname: '/assistant',
      params: { conversationId },
    });
  };

  const startConversation = async (withVoice: boolean) => {
    if (creating) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await create('Percakapan Baru');
      setSheetOpen(false);
      router.push({
        pathname: '/assistant',
        params: withVoice
          ? { conversationId: created.id, voice: '1' }
          : { conversationId: created.id },
      });
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : String(e));
    } finally {
      setCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Pesan</Text>
            <Text style={styles.subtitle}>Percakapan dengan Andora</Text>
          </View>
        </View>
        <View style={styles.searchRow}>
          <Ionicons
            name="search-outline"
            size={20}
            color={Andora.colors.textMuted}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cari pesan..."
            placeholderTextColor={Andora.colors.inputPlaceholder}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query ? (
            <Pressable
              onPress={() => setQuery('')}
              accessibilityRole="button"
              accessibilityLabel="Hapus pencarian"
            >
              <Ionicons
                name="close-circle"
                size={20}
                color={Andora.colors.textMuted}
              />
            </Pressable>
          ) : null}
        </View>

        <Pressable
          onPress={() => setSheetOpen(true)}
          style={styles.newCard}
          accessibilityRole="button"
        >
          <View style={styles.newIcon}>
            <Ionicons name="add" size={28} color={Andora.colors.onPrimary} />
          </View>
          <View style={styles.newText}>
            <Text style={styles.newTitle}>Kebutuhan Baru</Text>
            <Text style={styles.newBody}>
              Mulai percakapan baru dengan Andora melalui suara atau teks
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={Andora.colors.primary}
          />
        </Pressable>

        <Text style={styles.sectionTitle}>Percakapan Terakhir</Text>
        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator size="small" color={Andora.colors.primary} />
            <Text style={styles.stateText}>Memuat percakapan...</Text>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>Gagal memuat: {error}</Text>
          </View>
        ) : !accessToken ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>
              Masuk dulu untuk melihat percakapan Anda.
            </Text>
          </View>
        ) : items.length === 0 ? (
          <View style={styles.stateBox}>
            <Text style={styles.stateText}>
              Belum ada percakapan. Mulai kebutuhan baru di atas.
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => openConversation(item.id)}
              style={styles.rowCard}
              accessibilityRole="button"
            >
              <View style={styles.rowIcon}>
                <Ionicons
                  name="document-text"
                  size={28}
                  color={Andora.colors.primary}
                />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                {item.last_message_preview ? (
                  <Text style={styles.rowBody} numberOfLines={2}>
                    {item.last_message_preview}
                  </Text>
                ) : null}
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={Andora.colors.primaryMuted}
              />
            </Pressable>
          ))
        )}
      </ScrollView>

      <Modal
        visible={sheetOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSheetOpen(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.botBadge}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={48}
                color={Andora.colors.primary}
              />
            </View>
            <Text style={styles.sheetTitle}>Mulai kebutuhan baru</Text>
            <Text style={styles.sheetBody}>
              Ceritakan apa yang ingin Anda lakukan dengan dokumen. Anda bisa
              berkata secara langsung atau mengetik permintaan Anda
            </Text>
            {createError ? (
              <Text style={styles.sheetError}>{createError}</Text>
            ) : null}
            <Text style={styles.sheetPrompt}>Sampaikan kebutuhan Anda</Text>
            <View style={styles.sheetRow}>
              <Pressable
                onPress={() => setSheetOpen(false)}
                style={styles.cancelCta}
                accessibilityRole="button"
                disabled={creating}
              >
                <Text style={styles.cancelCtaText}>Batalkan</Text>
                <Ionicons
                  name="close"
                  size={20}
                  color={Andora.colors.bubbleUser}
                />
              </Pressable>
              <Pressable
                onPress={() => void startConversation(false)}
                style={styles.typeCta}
                accessibilityRole="button"
                disabled={creating}
              >
                <Text style={styles.typeCtaText}>
                  {creating ? 'Membuat...' : 'Ketik Saja'}
                </Text>
                <Ionicons
                  name="keypad-outline"
                  size={20}
                  color={Andora.colors.onPrimary}
                />
              </Pressable>
            </View>
            <Pressable
              onPress={() => void startConversation(true)}
              style={styles.voiceCta}
              accessibilityRole="button"
              disabled={creating}
            >
              <Text style={styles.voiceCtaText}>
                {creating ? 'Membuat...' : 'Bicara Sekarang'}
              </Text>
              <Ionicons
                name="mic-outline"
                size={20}
                color={Andora.colors.onPrimary}
              />
            </Pressable>
          </View>
        </View>
      </Modal>
      <AndoraNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Andora.colors.background },
  scroll: { padding: Andora.spacing.lg, paddingBottom: Andora.spacing.xl },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Andora.spacing.md,
    marginBottom: Andora.spacing.md,
  },
  headerText: { flex: 1 },
  title: {
    color: Andora.colors.text,
    fontSize: 30,
    fontWeight: Andora.typography.weight.bold,
  },
  subtitle: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.semibold,
  },
  searchRow: {
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    borderRadius: 10,
    paddingHorizontal: Andora.spacing.sm,
    minHeight: 48,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: Andora.spacing.md,
  },
  searchInput: {
    flex: 1,
    color: Andora.colors.inputFilled,
    fontSize: Andora.typography.size.bodyLarge,
  },
  newCard: {
    backgroundColor: Andora.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    borderRadius: 7,
    padding: Andora.spacing.sm,
    flexDirection: 'row',
    gap: 19,
    alignItems: 'center',
    marginBottom: Andora.spacing.md,
    minHeight: 96,
  },
  newIcon: {
    width: 54,
    height: 55,
    borderRadius: 27,
    backgroundColor: Andora.colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newText: { flex: 1, gap: 8 },
  newTitle: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.bold,
  },
  newBody: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.medium,
  },
  sectionTitle: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.bold,
    marginBottom: Andora.spacing.sm,
  },
  rowCard: {
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    borderRadius: 10,
    padding: Andora.spacing.sm,
    flexDirection: 'row',
    gap: Andora.spacing.sm,
    alignItems: 'center',
    marginBottom: Andora.spacing.lg,
  },
  rowIcon: {
    width: 53,
    height: 55,
    borderRadius: 27,
    backgroundColor: Andora.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 8 },
  rowTitle: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.bold,
  },
  rowBody: {
    color: Andora.colors.messageMeta,
    fontSize: Andora.typography.size.body,
  },
  rowMeta: { alignItems: 'center', gap: 12, width: 46 },
  overlay: {
    flex: 1,
    backgroundColor: Andora.colors.overlay,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Andora.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Andora.colors.sheetHandle,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: Andora.spacing.lg,
    alignItems: 'center',
  },
  handle: {
    width: 59,
    height: 5,
    borderRadius: 100,
    backgroundColor: Andora.colors.sheetHandle,
    marginBottom: Andora.spacing.md,
  },
  botBadge: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: Andora.colors.botBadge,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Andora.spacing.sm,
  },
  sheetTitle: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.bold,
    marginBottom: Andora.spacing.xs,
  },
  sheetBody: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.bodyLarge,
    textAlign: 'center',
    marginBottom: Andora.spacing.md,
  },
  exampleBubble: {
    alignSelf: 'stretch',
    backgroundColor: Andora.colors.bubbleUser,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 5,
    padding: Andora.spacing.sm,
    marginBottom: 6,
  },
  exampleText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
  sheetPrompt: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.medium,
    marginVertical: Andora.spacing.sm,
  },
  sheetRow: { flexDirection: 'row', gap: 17, alignSelf: 'stretch' },
  cancelCta: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    borderRadius: 10,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelCtaText: {
    color: Andora.colors.bubbleUser,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.bold,
  },
  typeCta: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Andora.colors.primary,
    borderRadius: 10,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeCtaText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.bold,
  },
  voiceCta: {
    marginTop: 12,
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: Andora.colors.brand,
    borderRadius: 10,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceCtaText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.bold,
  },
  stateBox: {
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    borderRadius: 10,
    padding: Andora.spacing.md,
    alignItems: 'center',
    gap: 8,
    marginBottom: Andora.spacing.md,
  },
  stateText: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    textAlign: 'center',
  },
  sheetError: {
    color: Andora.colors.danger,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'center',
    marginBottom: Andora.spacing.sm,
  },
});
