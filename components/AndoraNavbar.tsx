import { Link, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';

// Shared bottom navbar adapted from Figma nodes 11-6 + 41-121.
// 118px bar, rounded-t 25px; active tab semibold brand, rest muted.
const TABS = [
  { key: 'home', label: 'Beranda', href: '/home', icon: 'home' },
  { key: 'sessions', label: 'Pesan', href: '/home/sessions', icon: 'chatbubble-ellipses-outline' },
  { key: 'insight', label: 'Dokumen', href: '/home/insight', icon: 'document-text-outline' },
  { key: 'auth', label: 'Profil', href: '/auth', icon: 'person-outline' },
] as const;

export default function AndoraNavbar() {
  const pathname = usePathname();
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const active =
          tab.key === 'home'
            ? pathname === '/home'
            : pathname.startsWith(tab.href);
        return (
          <Link key={tab.key} href={tab.href} asChild>
            <Pressable style={styles.tab} accessibilityRole="button">
              <Ionicons
                name={tab.icon as keyof typeof Ionicons.glyphMap}
                size={30}
                color={active ? Andora.colors.brand : Andora.colors.tabInactive}
              />
              <Text style={[styles.label, active ? styles.labelActive : undefined]}>
                {tab.label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: Andora.colors.navbarBg,
    borderWidth: 1,
    borderColor: Andora.colors.navbarBorder,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingHorizontal: Andora.spacing.sm,
    paddingTop: 15,
    paddingBottom: Andora.spacing.sm,
    height: 118,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  label: {
    color: Andora.colors.tabInactive,
    fontSize: Andora.typography.size.caption,
    fontWeight: Andora.typography.weight.medium,
  },
  labelActive: {
    color: Andora.colors.brand,
    fontWeight: Andora.typography.weight.semibold,
  },
});
