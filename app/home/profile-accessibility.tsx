import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import AndoraNavbar from '@/components/AndoraNavbar';

const ROWS: {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'large-text', title: 'Teks Besar', subtitle: 'Perbesar ukuran teks', icon: 'text' },
  { id: 'contrast', title: 'Kontras Tinggi', subtitle: 'Tingkatkan kontras tampilan', icon: 'contrast' },
  { id: 'voice', title: 'Panduan Suara', subtitle: 'Aktifkan panduan suara', icon: 'volume-high' },
  { id: 'haptic', title: 'Notifikasi Getar', subtitle: 'Getar saat ada notifikasi', icon: 'phone-portrait' },
];

export default function ProfileAccessibilityScreen() {
  const router = useRouter();
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    'large-text': false,
    contrast: false,
    voice: true,
    haptic: true,
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            accessibilityRole="button"
            accessibilityLabel="Kembali"
          >
            <Ionicons name="chevron-back" size={24} color={Andora.colors.primary} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={styles.title}>Pengaturan Aksebilitas</Text>
            <Text style={styles.subtitle}>Sesuaikan pengalaman pengguna</Text>
          </View>
        </View>

        <View style={styles.list}>
          {ROWS.map((row) => (
            <View key={row.id} style={styles.card}>
              <View style={styles.iconCircle}>
                <Ionicons name={row.icon} size={24} color={Andora.colors.primary} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{row.title}</Text>
                <Text style={styles.cardSubtitle}>{row.subtitle}</Text>
              </View>
              <Switch
                value={toggles[row.id] ?? false}
                onValueChange={(value) => setToggles((prev) => ({ ...prev, [row.id]: value }))}
              />
            </View>
          ))}
        </View>
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
  list: { gap: Andora.spacing.sm },
  card: {
    backgroundColor: Andora.colors.surface,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    borderRadius: 10,
    padding: Andora.spacing.md,
    flexDirection: 'row',
    gap: Andora.spacing.sm,
    alignItems: 'center',
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
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.bold,
  },
  cardSubtitle: {
    color: Andora.colors.textMuted2,
    fontSize: Andora.typography.size.body,
    marginTop: 2,
  },
});
