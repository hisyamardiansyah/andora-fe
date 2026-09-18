import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import AndoraNavbar from '@/components/AndoraNavbar';

// FIGMA Andora (Copy) 7IHCYJs2bVqT4uzuCJKzhF node 41-121 (list) + 43-217 (sheet)
// -> /home/sessions. New-need sheet opens as a modal overlay.
const EXAMPLES = [
  'Saya ingin membuat surat izin kampus',
  'Tolong jelaskan maksud dan isi surat ini',
  'Saya ingin membuat surat izin dan mengirim surat tersebut',
] as const;

export default function SessionsScreen() {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Pesan</Text>
            <Text style={styles.subtitle}>Percakapan dengan Andora</Text>
          </View>
          <Link href="/home/insight" asChild>
            <Pressable style={styles.searchCta} accessibilityRole="button">
              <Text style={styles.searchCtaText}>Cari Pesan</Text>
              <Ionicons name="search-outline" size={22} color={Andora.colors.onPrimary} />
            </Pressable>
          </Link>
        </View>

        <Pressable onPress={() => setSheetOpen(true)} style={styles.newCard} accessibilityRole="button">
          <View style={styles.newIcon}>
            <Ionicons name="add" size={28} color={Andora.colors.onPrimary} />
          </View>
          <View style={styles.newText}>
            <Text style={styles.newTitle}>Kebutuhan Baru</Text>
            <Text style={styles.newBody}>Mulai percakapan baru dengan Andora melalui suara atau teks</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={Andora.colors.primary} />
        </Pressable>

        <Text style={styles.sectionTitle}>Percakapan Terakhir</Text>
        <Pressable onPress={() => router.push('/assistant')} style={styles.rowCard} accessibilityRole="button">
          <View style={styles.rowIcon}>
            <Ionicons name="document-text" size={28} color={Andora.colors.primary} />
          </View>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Surat Keterangan Tidak Mampu</Text>
            <Text style={styles.rowBody}>Andora: Surat sudah siap kirim. Ingin dikirim kemana surat ini?</Text>
          </View>
          <View style={styles.rowMeta}>
            <Text style={styles.rowTime}>Hari ini 10.30</Text>
            <Ionicons name="chevron-forward" size={18} color={Andora.colors.primaryMuted} />
          </View>
        </Pressable>
      </ScrollView>

      <Modal visible={sheetOpen} transparent animationType="fade" onRequestClose={() => setSheetOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.handle} />
            <View style={styles.botBadge}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={Andora.colors.primary} />
            </View>
            <Text style={styles.sheetTitle}>Mulai kebutuhan baru</Text>
            <Text style={styles.sheetBody}>
              Ceritakan apa yang ingin Anda lakukan dengan dokumen. Anda bisa berkata secara langsung
              atau mengetik permintaan Anda
            </Text>
            {EXAMPLES.map((example) => (
              <View key={example} style={styles.exampleBubble}>
                <Text style={styles.exampleText}>“{example}”</Text>
              </View>
            ))}
            <Text style={styles.sheetPrompt}>Sampaikan kebutuhan Anda</Text>
            <View style={styles.sheetRow}>
              <Pressable onPress={() => setSheetOpen(false)} style={styles.cancelCta} accessibilityRole="button">
                <Text style={styles.cancelCtaText}>Batalkan</Text>
                <Ionicons name="close" size={20} color={Andora.colors.bubbleUser} />
              </Pressable>
              <Pressable
                onPress={() => {
                  setSheetOpen(false);
                  router.push('/assistant');
                }}
                style={styles.typeCta}
                accessibilityRole="button"
              >
                <Text style={styles.typeCtaText}>Ketik Saja</Text>
                <Ionicons name="keypad-outline" size={20} color={Andora.colors.onPrimary} />
              </Pressable>
            </View>
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
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: Andora.spacing.md, marginBottom: Andora.spacing.md },
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
  searchCta: {
    backgroundColor: Andora.colors.primary,
    borderRadius: 10,
    height: 55,
    width: 146,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchCtaText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.bold,
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
  newBody: { color: Andora.colors.primary, fontSize: Andora.typography.size.bodyLarge, fontWeight: Andora.typography.weight.medium },
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
  rowTitle: { color: Andora.colors.primary, fontSize: Andora.typography.size.bodyLarge, fontWeight: Andora.typography.weight.bold },
  rowBody: { color: Andora.colors.messageMeta, fontSize: Andora.typography.size.body },
  rowMeta: { alignItems: 'center', gap: 12, width: 46 },
  rowTime: { color: Andora.colors.timeMuted, fontSize: Andora.typography.size.caption, fontWeight: Andora.typography.weight.semibold, textAlign: 'center' },
  overlay: { flex: 1, backgroundColor: Andora.colors.overlay, justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: Andora.colors.surface,
    borderTopWidth: 1,
    borderTopColor: Andora.colors.sheetHandle,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: Andora.spacing.lg,
    alignItems: 'center',
  },
  handle: { width: 59, height: 5, borderRadius: 100, backgroundColor: Andora.colors.sheetHandle, marginBottom: Andora.spacing.md },
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
  sheetBody: { color: Andora.colors.primary, fontSize: Andora.typography.size.bodyLarge, textAlign: 'center', marginBottom: Andora.spacing.md },
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
  exampleText: { color: Andora.colors.onPrimary, fontSize: Andora.typography.size.subtitle, fontWeight: Andora.typography.weight.semibold },
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
  cancelCtaText: { color: Andora.colors.bubbleUser, fontSize: Andora.typography.size.subtitle, fontWeight: Andora.typography.weight.bold },
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
});
