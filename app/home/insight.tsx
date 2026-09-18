import { Link, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';

// FIGMA Andora (Copy) 7IHCYJs2bVqT4uzuCJKzhF nodes 43-356 (doc card) + 23-1311 /
// 29-1786 (chat variants) -> /home/insight. White header, avatar bubbles,
// dark user bubble, doc card, bottom input bar.
const CHAT = [
  {
    id: '1',
    from: 'andora',
    text: 'Silakan deskripsikan kebutuhan dokumen anda',
  },
  {
    id: '2',
    from: 'user',
    text: 'Tolong buatkan pemohonan pembuatan Surat Keterangan Tidak Mampu',
  },
  {
    id: '3',
    from: 'andora',
    text: 'Baik, Andora akan membuatkan pemohonan Surat Keterangan Tidak Mampu. Saya ingin memastikan, Apakah tujuan keperluan surat ini untuk kuliah atau kegiatan lainnya?',
  },
] as const;

export default function InsightScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backHit}
          accessibilityRole="button"
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color={Andora.colors.primary}
          />
        </Pressable>
        <View style={styles.headerBrand}>
          <View style={styles.headerAvatar}>
            <Ionicons
              name="document-text"
              size={20}
              color={Andora.colors.onPrimary}
            />
          </View>
          <Text style={styles.title}>Andora</Text>
        </View>
        <View style={styles.backHit} />
      </View>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Sampaikan kebutuhan Anda</Text>

        {CHAT.map((bubble) =>
          bubble.from === 'user' ? (
            <View key={bubble.id} style={styles.userRow}>
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{bubble.text}</Text>
              </View>
            </View>
          ) : (
            <View key={bubble.id} style={styles.andoraRow}>
              <View style={styles.avatar}>
                <Ionicons
                  name="document-text"
                  size={18}
                  color={Andora.colors.onPrimary}
                />
              </View>
              <View style={styles.andoraBubble}>
                <Text style={styles.andoraText}>{bubble.text}</Text>
              </View>
            </View>
          )
        )}

        <View style={styles.andoraRow}>
          <View style={styles.avatar}>
            <Ionicons
              name="document-text"
              size={18}
              color={Andora.colors.onPrimary}
            />
          </View>
          <View style={styles.docCard}>
            <View style={styles.docMain}>
              <Ionicons
                name="document-text"
                size={48}
                color={Andora.colors.primary}
              />
              <Text style={styles.docTitle}>Surat keterangan tidak mampu</Text>
            </View>
            <Text style={styles.docOpenText}>Buka</Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.inputBar}>
        <Link href="/assistant" asChild>
          <Pressable style={styles.primaryCta}>
            <Text style={styles.primaryCtaText}>
              Ketik atau langsung bicara
            </Text>
            <Ionicons
              name="send"
              size={24}
              color={Andora.colors.primaryMuted}
            />
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Andora.colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Andora.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Andora.colors.background,
    paddingHorizontal: Andora.spacing.sm,
    paddingVertical: Andora.spacing.sm,
  },
  backHit: { width: 44, alignItems: 'flex-start' },
  headerBrand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  headerAvatar: {
    width: 39,
    height: 39,
    borderRadius: 20,
    backgroundColor: Andora.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Andora.colors.text,
    fontSize: 30,
    fontWeight: Andora.typography.weight.bold,
  },
  scroll: { padding: Andora.spacing.lg, paddingBottom: Andora.spacing.xl },
  subtitle: {
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.medium,
    textAlign: 'center',
    marginBottom: Andora.spacing.lg,
  },
  andoraRow: {
    flexDirection: 'row',
    gap: 0,
    marginBottom: Andora.spacing.md,
    alignItems: 'flex-start',
  },
  avatar: {
    width: 57,
    height: 57,
    borderRadius: 29,
    backgroundColor: Andora.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -34,
    marginTop: 10,
    zIndex: 1,
  },
  andoraBubble: {
    flex: 1,
    marginLeft: -8,
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    borderRadius: 10,
    padding: 21,
  },
  andoraText: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
  userRow: { alignItems: 'flex-end', marginBottom: Andora.spacing.md },
  userBubble: {
    maxWidth: '85%',
    backgroundColor: Andora.colors.bubbleUser,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 5,
    padding: 15,
  },
  userText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
  docCard: {
    flex: 1,
    marginLeft: -8,
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    borderRadius: 10,
    padding: 15,
    minHeight: 114,
  },
  docMain: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  docTitle: {
    flex: 1,
    color: Andora.colors.text,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
  docOpenText: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'right',
    marginTop: 8,
  },
  inputBar: {
    backgroundColor: Andora.colors.surface,
    paddingHorizontal: 15,
    paddingTop: 15,
    paddingBottom: Andora.spacing.sm,
  },
  primaryCta: {
    backgroundColor: Andora.colors.inputBg,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    borderRadius: 20,
    height: 59,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  primaryCtaText: {
    color: Andora.colors.inputPlaceholder,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
});
