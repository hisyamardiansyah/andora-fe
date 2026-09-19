import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import AndoraNavbar from '@/components/AndoraNavbar';
import DebugBanner from '@/components/DebugBanner';
import { useDebugMode } from '@/hooks/useDebugMode';

export default function ProfileSecurityScreen() {
  const router = useRouter();
  const { debugEnabled } = useDebugMode();
  const [pinLock, setPinLock] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
            <Text style={styles.title}>Keamanan & Privasi</Text>
            <Text style={styles.subtitle}>
              Kelola keamanan dan privasi akun
            </Text>
          </View>
        </View>
        {debugEnabled ? <DebugBanner /> : null}

        <View style={styles.list}>
          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="lock-closed"
                size={24}
                color={Andora.colors.primary}
              />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Kunci PIN Aplikasi</Text>
              <Text style={styles.cardSubtitle}>
                Minta PIN setiap membuka aplikasi
              </Text>
            </View>
            <Switch value={pinLock} onValueChange={setPinLock} />
          </View>

          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="shield-checkmark"
                size={24}
                color={Andora.colors.primary}
              />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Login Biometrik</Text>
              <Text style={styles.cardSubtitle}>
                Masuk dengan sidik jari atau wajah
              </Text>
            </View>
            <Switch value={biometric} onValueChange={setBiometric} />
          </View>

          <View style={styles.card}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="phone-portrait"
                size={24}
                color={Andora.colors.primary}
              />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Sesi Aktif</Text>
              <Text style={styles.cardSubtitle}>1 perangkat</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={Andora.colors.primaryMuted}
            />
          </View>
        </View>

        <Pressable
          onPress={() => setConfirmDelete(true)}
          style={styles.deleteButton}
          accessibilityRole="button"
        >
          <Text style={styles.deleteText}>Hapus Data</Text>
        </Pressable>
        {confirmDelete ? (
          <Text style={styles.confirmText}>
            Hapus data dibatalkan. Data Anda tetap aman.
          </Text>
        ) : null}
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
  deleteButton: {
    alignSelf: 'center',
    marginTop: Andora.spacing.md,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  deleteText: {
    color: Andora.colors.danger,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'center',
  },
  confirmText: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    textAlign: 'center',
    marginTop: Andora.spacing.sm,
  },
});
