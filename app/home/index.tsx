import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>Andora</Text>

        <View style={styles.reminder}>
          <View style={styles.reminderHeader}>
            <Ionicons
              name="notifications-outline"
              size={20}
              color={Andora.colors.onPrimary}
            />
            <Text style={styles.reminderTitle}>Pengingat Ramah</Text>
          </View>
          <View style={styles.reminderCard}>
            <View style={styles.reminderTop}>
              <View style={styles.reminderText}>
                <Text style={styles.reminderHeading}>
                  Laporan Surat Kehilangan Dompet
                </Text>
                <Text style={styles.reminderBody}>
                  Tenggat: 12 Oktober 2026
                </Text>
              </View>
              <View style={styles.reminderBadge}>
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={Andora.colors.danger}
                />
                <Text style={styles.reminderBadgeText}>2 hari lagi</Text>
              </View>
            </View>
            <View style={styles.reminderCtaRow}>
              <Pressable
                onPress={startVoice}
                style={styles.reminderCta}
                accessibilityRole="button"
              >
                <Text style={styles.reminderCtaText}>Kirim Surat</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <Text style={styles.greeting}>
          Halo, saya Andora. Ada yang bisa saya bantu untuk mengurus dokumen?
        </Text>

        <Pressable
          onPress={startVoice}
          style={styles.micWrap}
          accessibilityRole="button"
        >
          <View style={styles.orbOuter}>
            <View style={styles.orbMiddle}>
              <View style={styles.orbInner}>
                <Ionicons
                  name="mic"
                  size={38}
                  color={Andora.colors.onPrimary}
                />
              </View>
            </View>
          </View>
          <Text style={styles.micLabel}>Tekan untuk bicara</Text>
        </Pressable>
      </ScrollView>
      <AndoraNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1f3247' },
  scroll: {
    paddingHorizontal: Andora.spacing.md,
    paddingTop: Andora.spacing.md,
    paddingBottom: Andora.spacing.xl,
    alignItems: 'center',
  },
  brand: {
    color: Andora.colors.onPrimary,
    fontSize: 30,
    fontWeight: Andora.typography.weight.bold,
    textAlign: 'center',
    marginBottom: Andora.spacing.md,
  },
  reminder: {
    width: 380,
    maxWidth: '100%',
    marginBottom: Andora.spacing.lg,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: Andora.spacing.xs,
  },
  reminderTitle: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.bold,
  },
  reminderCard: {
    backgroundColor: Andora.colors.reminderBg,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  reminderTop: {
    flexDirection: 'row',
    gap: Andora.spacing.sm,
    alignItems: 'flex-start',
  },
  reminderText: { flex: 1, gap: 5 },
  reminderHeading: {
    color: Andora.colors.reminderTitle,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.semibold,
    width: 181,
  },
  reminderBody: {
    color: Andora.colors.primaryMuted,
    fontSize: Andora.typography.size.bodyLarge,
  },
  reminderBadge: {
    backgroundColor: Andora.colors.reminderBadge,
    borderRadius: 8,
    width: 98,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  reminderBadgeText: {
    color: Andora.colors.danger,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
  },
  reminderCtaRow: {
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
    textAlign: 'center',
    width: 312,
    marginBottom: Andora.spacing.lg,
  },
  micWrap: { alignItems: 'center', gap: 5, marginBottom: Andora.spacing.lg },
  orbOuter: {
    width: 197,
    height: 197,
    borderRadius: 98.5,
    borderWidth: 1,
    borderColor: Andora.colors.onPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbMiddle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: '#9fc3e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#1f5fa8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micLabel: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
    textAlign: 'center',
  },
});
