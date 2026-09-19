import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import AndoraNavbar from '@/components/AndoraNavbar';
import DebugBanner from '@/components/DebugBanner';
import { useDebugMode } from '@/hooks/useDebugMode';

const FAQS = [
  {
    id: '1',
    question: 'Bagaimana cara membuat surat baru?',
    answer:
      'Buka halaman Pesan, pilih Kebutuhan Baru, lalu ikuti panduan suara atau ketik kebutuhan Anda.',
  },
  {
    id: '2',
    question: 'Apakah data saya aman?',
    answer:
      'Ya. Data Anda tersimpan aman dan hanya digunakan untuk memproses kebutuhan dokumen Anda.',
  },
  {
    id: '3',
    question: 'Bagaimana cara menghubungi bantuan?',
    answer:
      'Hubungi kami melalui email halo@andora.id atau telepon 1500-xxx setiap hari kerja.',
  },
] as const;

export default function ProfileHelpScreen() {
  const router = useRouter();
  const { debugEnabled } = useDebugMode();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={Andora.colors.primary}
            />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Bantuan & Akun</Text>
            <Text style={styles.subtitle}>Pusat bantuan, FAQ, dan Kontak</Text>
          </View>
        </View>
        {debugEnabled ? <DebugBanner /> : null}

        <View style={styles.list}>
          {FAQS.map((faq) => {
            const open = expanded === faq.id;
            return (
              <Pressable
                key={faq.id}
                onPress={() => setExpanded(open ? null : faq.id)}
                style={styles.card}
                accessibilityRole="button"
              >
                <View style={styles.faqRow}>
                  <Text style={styles.cardTitle}>{faq.question}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={Andora.colors.primaryMuted}
                  />
                </View>
                {open ? <Text style={styles.answer}>{faq.answer}</Text> : null}
              </Pressable>
            );
          })}
        </View>

        <View style={styles.list}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail" size={24} color={Andora.colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Email</Text>
              <Text style={styles.cardSubtitle}>halo@andora.id</Text>
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons name="call" size={24} color={Andora.colors.primary} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Telepon</Text>
              <Text style={styles.cardSubtitle}>1500-xxx</Text>
            </View>
          </View>
        </View>

        <Pressable
          style={styles.contactButton}
          accessibilityRole="button"
          onPress={() => {}}
        >
          <Text style={styles.contactText}>Hubungi Bantuan</Text>
        </Pressable>
      </ScrollView>
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
    gap: Andora.spacing.sm,
    marginBottom: Andora.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
  list: { gap: Andora.spacing.sm, marginBottom: Andora.spacing.md },
  card: {
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    borderRadius: 10,
    padding: Andora.spacing.md,
    flexDirection: 'column',
    gap: Andora.spacing.sm,
  },
  faqRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Andora.spacing.sm,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Andora.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1 },
  cardTitle: {
    flex: 1,
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.bold,
  },
  cardSubtitle: {
    color: Andora.colors.textMuted2,
    fontSize: Andora.typography.size.body,
    marginTop: 2,
  },
  answer: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
  },
  contactButton: {
    backgroundColor: Andora.colors.primary,
    borderRadius: 10,
    height: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.bold,
  },
});
