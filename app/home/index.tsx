import { Link, useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Andora } from '@/constants/Andora';
import AndoraNavbar from '@/components/AndoraNavbar';
import { useConnection } from '@/hooks/useConnection';

// FIGMA Andora (Copy) 7IHCYJs2bVqT4uzuCJKzhF node 11-6 -> /home.
// Dark brand screen, reminder card, mic CTA, Kirim Surat, bottom navbar.
export default function HomeScreen() {
  const router = useRouter();
  const connection = useConnection();

  const startVoice = () => {
    connection.connect();
    router.push('/assistant');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>Andora</Text>

        <View style={styles.reminder}>
          <Text style={styles.reminderTitle}>Pengingat Ramah</Text>
          <View style={styles.reminderCard}>
            <View style={styles.reminderText}>
              <Text style={styles.reminderHeading}>Laporan Surat Kehilangan Dompet</Text>
              <Text style={styles.reminderBody}>Tenggat: 12 Oktober 2026</Text>
            </View>
            <View style={styles.reminderBadge}>
              <Text style={styles.reminderBadgeText}>2 hari lagi</Text>
            </View>
          </View>
          <View style={styles.reminderCtaRow}>
            <Pressable onPress={startVoice} style={styles.reminderCta} accessibilityRole="button">
              <Text style={styles.reminderCtaText}>Kirim Surat</Text>
            </Pressable>
          </View>
        </View>

        <Text style={styles.greeting}>Halo, saya Andora. Ada yang bisa saya bantu untuk mengurus dokumen?</Text>

        <Pressable onPress={startVoice} style={styles.micWrap} accessibilityRole="button">
          <Image source={require('@/assets/images/mic_24dp.png')} style={styles.micIcon} />
          <Text style={styles.micLabel}>Tekan untuk bicara</Text>
        </Pressable>

        <View style={styles.quickRow}>
          <Link href="/home/sessions" asChild>
            <Pressable style={styles.quickCard}>
              <Text style={styles.quickTitle}>Pesan</Text>
              <Text style={styles.quickBody}>Percakapan dengan Andora</Text>
            </Pressable>
          </Link>
          <Link href="/home/insight" asChild>
            <Pressable style={styles.quickCard}>
              <Text style={styles.quickTitle}>Dokumen</Text>
              <Text style={styles.quickBody}>Surat siap kirim</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
      <AndoraNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Andora.colors.brand },
  scroll: { padding: Andora.spacing.lg, paddingBottom: Andora.spacing.xl },
  brand: {
    color: Andora.colors.onPrimary,
    fontSize: 30,
    fontWeight: Andora.typography.weight.bold,
    marginBottom: Andora.spacing.md,
  },
  reminder: {
    marginBottom: Andora.spacing.lg,
  },
  reminderTitle: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.bold,
    marginBottom: Andora.spacing.xs,
  },
  reminderCard: {
    backgroundColor: Andora.colors.reminderBg,
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    gap: Andora.spacing.sm,
    alignItems: 'flex-start',
  },
  reminderText: { flex: 1, gap: 5 },
  reminderHeading: {
    color: Andora.colors.reminderTitle,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
  },
  reminderBody: {
    color: Andora.colors.primaryMuted,
    fontSize: Andora.typography.size.bodyLarge,
  },
  reminderBadge: {
    backgroundColor: Andora.colors.reminderBadge,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reminderBadgeText: { color: Andora.colors.danger, fontSize: Andora.typography.size.body, fontWeight: Andora.typography.weight.semibold },
  reminderCtaRow: {
    backgroundColor: Andora.colors.reminderBg,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 15,
    paddingTop: 7,
    alignItems: 'flex-end',
  },
  reminderCta: {
    backgroundColor: Andora.colors.brandDeep,
    borderRadius: 10,
    width: 140,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderCtaText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.bold,
  },
  greeting: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.semibold,
    lineHeight: Andora.typography.lineHeight.relaxed,
    marginBottom: Andora.spacing.lg,
  },
  micWrap: { alignItems: 'center', marginBottom: Andora.spacing.lg },
  micIcon: { width: 64, height: 64, marginBottom: Andora.spacing.sm },
  micLabel: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
  },
  quickRow: { flexDirection: 'row', gap: Andora.spacing.md },
  quickCard: {
    flex: 1,
    backgroundColor: Andora.colors.surface,
    borderRadius: Andora.radius.md,
    padding: Andora.spacing.md,
  },
  quickTitle: { color: Andora.colors.text, fontSize: Andora.typography.size.bodyLarge, fontWeight: Andora.typography.weight.semibold, marginBottom: Andora.spacing.xs },
  quickBody: { color: Andora.colors.textMuted, fontSize: Andora.typography.size.body },
});
