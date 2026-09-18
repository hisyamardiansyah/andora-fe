import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import AndoraNavbar from '@/components/AndoraNavbar';

// Profile screen from Figma node 87-495 ("Profile").
const MENU: {
  id: string;
  title: string;
  subtitle: string;
  href: '/home/profile-personal' | '/home/profile-accessibility' | '/home/profile-security' | '/home/profile-help' | '/home/profile-about';
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: 'personal',
    title: 'Informasi Pribadi',
    subtitle: 'Lihat dan ubah data diri',
    href: '/home/profile-personal',
    icon: 'person',
  },
  {
    id: 'accessibility',
    title: 'Pengaturan Aksebilitas',
    subtitle: 'Sesuaikan pengalaman pengguna',
    href: '/home/profile-accessibility',
    icon: 'mic',
  },
  {
    id: 'security',
    title: 'Keamanan & Privasi',
    subtitle: 'Kelola keamanan dan privasi akun',
    href: '/home/profile-security',
    icon: 'shield',
  },
  {
    id: 'help',
    title: 'Bantuan & Akun',
    subtitle: 'Pusat bantuan, FAQ, dan Kontak',
    href: '/home/profile-help',
    icon: 'help-circle',
  },
  {
    id: 'about',
    title: 'Tentang Andora',
    subtitle: 'Versi aplikasi dan informasi lainnya',
    href: '/home/profile-about',
    icon: 'information-circle',
  },
];

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Profil</Text>
          <Text style={styles.subtitle}>Informasi Personal Anda</Text>
        </View>

        <View style={styles.avatarBlock}>
          <View style={styles.avatarWrap}>
            <Image
              source={require('../../assets/images/profile-avatar.png')}
              style={styles.avatarImage}
              accessibilityLabel="Foto profil Adib Naziri"
            />
            <View style={styles.cameraBadge}>
              <Ionicons name="camera" size={18} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.name}>Adib Naziri</Text>
        </View>

        <View style={styles.menuList}>
          {MENU.map((item) => (
            <Pressable
              key={item.id}
              style={styles.card}
              accessibilityRole="button"
              onPress={() => router.push(item.href)}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name={item.icon}
                  size={28}
                  color={Andora.colors.primary}
                />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={19}
                color={Andora.colors.primary}
              />
            </Pressable>
          ))}
        </View>

        <Pressable
          style={styles.logoutButton}
          accessibilityRole="button"
          onPress={() => router.replace('/auth')}
        >
          <Text style={styles.logoutText}>Keluar</Text>
        </Pressable>
      </ScrollView>
      <AndoraNavbar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Andora.colors.background },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  header: { alignItems: 'flex-start', marginBottom: 24 },
  title: {
    color: Andora.colors.text,
    fontSize: 30,
    fontWeight: Andora.typography.weight.bold,
    letterSpacing: -0.9,
  },
  subtitle: {
    color: Andora.colors.textMuted,
    fontSize: 16,
    fontWeight: Andora.typography.weight.semibold,
    marginTop: 2,
  },
  avatarBlock: { alignItems: 'center', marginBottom: 24 },
  avatarWrap: { width: 125, height: 125, position: 'relative' },
  avatarImage: { width: 125, height: 125, borderRadius: 62.5 },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Andora.colors.bubbleUser,
    borderWidth: 2,
    borderColor: Andora.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    color: Andora.colors.primary,
    fontSize: 18,
    fontWeight: Andora.typography.weight.bold,
    letterSpacing: -0.54,
    textAlign: 'center',
    marginTop: 8,
  },
  menuList: { gap: 10 },
  card: {
    backgroundColor: Andora.colors.surface,
    height: 88,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Andora.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
    gap: 15,
  },
  iconCircle: {
    width: 53,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: Andora.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, justifyContent: 'center' },
  cardTitle: {
    color: Andora.colors.primary,
    fontSize: 16,
    fontWeight: Andora.typography.weight.bold,
  },
  cardSubtitle: {
    color: Andora.colors.textMuted2,
    fontSize: 14,
    fontWeight: Andora.typography.weight.semibold,
    marginTop: 2,
  },
  logoutButton: {
    alignSelf: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  logoutText: {
    color: Andora.colors.danger,
    fontSize: 16,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'center',
  },
});
