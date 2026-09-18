import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import AndoraNavbar from '@/components/AndoraNavbar';

export default function ProfileAboutScreen() {
  const router = useRouter();

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
            <Text style={styles.title}>Tentang Andora</Text>
            <Text style={styles.subtitle}>Versi aplikasi dan informasi lainnya</Text>
          </View>
        </View>

        <View style={styles.brandBlock}>
          <Image
            source={require('../../assets/images/andora-logo-icon1.png')}
            style={styles.logo}
            accessibilityLabel="Logo Andora"
          />
          <Text style={styles.appName}>Andora</Text>
          <Text style={styles.version}>Versi 1.0.0</Text>
          <Text style={styles.description}>
            Andora membantu Anda membuat, memahami, dan mengirim dokumen dengan panduan suara yang mudah.
          </Text>
        </View>

        <View style={styles.list}>
          <Pressable style={styles.card} accessibilityRole="button" onPress={() => {}}>
            <View style={styles.iconCircle}>
              <Ionicons name="document-text" size={24} color={Andora.colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Kebijakan Privasi</Text>
            <Ionicons name="chevron-forward" size={20} color={Andora.colors.primaryMuted} />
          </Pressable>
          <Pressable style={styles.card} accessibilityRole="button" onPress={() => {}}>
            <View style={styles.iconCircle}>
              <Ionicons name="shield-checkmark" size={24} color={Andora.colors.primary} />
            </View>
            <Text style={styles.cardTitle}>Syarat Layanan</Text>
            <Ionicons name="chevron-forward" size={20} color={Andora.colors.primaryMuted} />
          </Pressable>
        </View>

        <Text style={styles.copyright}>© 2025 Andora</Text>
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
  brandBlock: { alignItems: 'center', marginBottom: Andora.spacing.md },
  logo: { width: 72, height: 72, borderRadius: 16, marginBottom: Andora.spacing.sm },
  appName: {
    color: Andora.colors.text,
    fontSize: Andora.typography.size.heading,
    fontWeight: Andora.typography.weight.bold,
  },
  version: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
    marginTop: 2,
  },
  description: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    textAlign: 'center',
    marginTop: Andora.spacing.sm,
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
  cardTitle: {
    flex: 1,
    color: Andora.colors.primary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.bold,
  },
  copyright: {
    color: Andora.colors.textMuted2,
    fontSize: Andora.typography.size.body,
    textAlign: 'center',
    marginTop: Andora.spacing.md,
  },
});
