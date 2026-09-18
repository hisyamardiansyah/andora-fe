import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import AndoraNavbar from '@/components/AndoraNavbar';

// Document list only: header + doc cards -> /assistant. No chat, no input bar.
const DOCS = [
  {
    id: '1',
    title: 'Surat Keterangan Tidak Mampu',
    meta: '12 Oktober 2026 • Siap kirim',
  },
  {
    id: '2',
    title: 'Surat Keterangan Domisili',
    meta: '10 Oktober 2026 • Siap kirim',
  },
  {
    id: '3',
    title: 'Surat Pengantar KTP',
    meta: '8 Oktober 2026 • Siap kirim',
  },
  {
    id: '4',
    title: 'Laporan Surat Kehilangan Dompet',
    meta: '5 Oktober 2026 • Siap kirim',
  },
] as const;

export default function InsightScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Dokumen</Text>
        <Text style={styles.subtitle}>Surat siap kirim</Text>

        {DOCS.map((doc) => (
          <Pressable
            key={doc.id}
            onPress={() => router.push('/assistant')}
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
              <Text style={styles.cardMeta}>{doc.meta}</Text>
              <Text style={styles.openText}>Buka</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={Andora.colors.primaryMuted}
            />
          </Pressable>
        ))}
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
});
