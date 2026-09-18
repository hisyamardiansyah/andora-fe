import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';

// FIGMA Andora (Copy) 7IHCYJs2bVqT4uzuCJKzhF node 18-1034 -> splash.
// 237px circular logo, 50px title, 20px subtitle, by ORBIT footer.
export default function StartScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/onboarding');
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <View style={styles.logoRing}>
        <Image
          style={styles.logo}
          source={require('../../assets/images/andora-logo-icon1.png')}
          resizeMode="contain"
          accessibilityLabel="Andora logo"
        />
        <View style={styles.logoBadge}>
          <Ionicons name="document-text" size={64} color={Andora.colors.onPrimary} />
        </View>
      </View>
      <Text style={styles.title}>Andora</Text>
      <Text style={styles.subtitle}>Akses Keperluan Dokumen yang Setara</Text>
      <ActivityIndicator
        size="small"
        color={Andora.colors.primary}
        style={styles.spinner}
      />
      <Text style={styles.footer}>
        by <Text style={styles.footerBrand}>ORBIT</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Andora.colors.splashBg,
    padding: Andora.spacing.lg,
  },
  logoRing: {
    width: 237,
    height: 237,
    borderRadius: 119,
    backgroundColor: Andora.colors.logoRing,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: Andora.spacing.md,
  },
  logo: {
    position: 'absolute',
    width: 267,
    height: 267,
    opacity: 0.35,
  },
  logoBadge: {
    width: 106,
    height: 85,
    borderRadius: 42,
    backgroundColor: Andora.colors.logoBadge,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: Andora.colors.brand,
    fontSize: 50,
    fontWeight: Andora.typography.weight.bold,
    marginBottom: Andora.spacing.xs,
  },
  subtitle: {
    color: Andora.colors.brandDeep,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.medium,
    lineHeight: Andora.typography.lineHeight.normal,
    textAlign: 'center',
    maxWidth: 251,
  },
  spinner: {
    marginTop: Andora.spacing.lg,
  },
  footer: {
    position: 'absolute',
    bottom: Andora.spacing.xl,
    color: Andora.colors.brandDeep,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.medium,
  },
  footerBrand: {
    fontWeight: Andora.typography.weight.bold,
    letterSpacing: 1,
  },
});
