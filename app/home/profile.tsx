import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import AndoraNavbar from '@/components/AndoraNavbar';

// Simple profile screen for the Profil tab.
const MENU = [
  { id: 'settings', label: 'Pengaturan', icon: 'settings-outline' },
  { id: 'help', label: 'Bantuan', icon: 'help-circle-outline' },
  { id: 'logout', label: 'Keluar', icon: 'log-out-outline' },
] as const;

export default function ProfileScreen() {
  const router = useRouter();

  const onMenuPress = (id: (typeof MENU)[number]['id']) => {
    if (id === 'logout') {
      router.replace('/auth');
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color={Andora.colors.onPrimary} />
          </View>
          <Text style={styles.name}>Pengguna Andora</Text>
          <Text style={styles.email}>pengguna@andora.id</Text>
        </View>

        {MENU.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => onMenuPress(item.id)}
            style={styles.row}
            accessibilityRole="button"
          >
            <Ionicons
              name={item.icon as keyof typeof Ionicons.glyphMap}
              size={24}
              color={Andora.colors.primary}
            />
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Ionicons
              name="chevron-forward"
              size={20}
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
  header: { alignItems: 'center', marginBottom: Andora.spacing.lg },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Andora.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Andora.spacing.sm,
  },
  name: {
    color: Andora.colors.text,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
  },
  email: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
  },
  row: {
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
  rowLabel: {
    flex: 1,
    color: Andora.colors.text,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.semibold,
  },
});
