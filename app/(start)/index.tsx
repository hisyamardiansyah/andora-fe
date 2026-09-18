import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Andora } from '@/constants/Andora';
import { useDebugMode } from '@/hooks/useDebugMode';
import { useSessionContext } from '@/hooks/useSession';

// Figma file yguOf0BB6X0G6FBhAVPHb9 node 18-1034 -> Splash Screen.
// Text-only: 50px title, 20px subtitle, by ORBIT footer.
// Routes to /home only with a live Supabase session, else /auth.
export default function StartScreen() {
  const router = useRouter();
  const { session, loading } = useSessionContext();
  const { debugEnabled, loading: debugLoading } = useDebugMode();

  useEffect(() => {
    if (loading || debugLoading) return;
    const timer = setTimeout(() => {
      router.replace(session || debugEnabled ? '/home' : '/auth');
    }, 1500);
    return () => clearTimeout(timer);
  }, [router, loading, session, debugEnabled, debugLoading]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Andora</Text>
      <Text style={styles.subtitle}>Akses Keperluan Dokumen yang Setara</Text>
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
  title: {
    color: Andora.colors.brand,
    fontSize: 50,
    fontWeight: Andora.typography.weight.bold,
    letterSpacing: -1.5,
    textAlign: 'center',
  },
  subtitle: {
    color: Andora.colors.bubbleUser,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.medium,
    lineHeight: Andora.typography.lineHeight.normal,
    textAlign: 'center',
    maxWidth: 251,
  },
  footer: {
    position: 'absolute',
    bottom: Andora.spacing.xl,
    color: Andora.colors.brandDeep,
    fontSize: Andora.typography.size.subtitle,
    fontWeight: Andora.typography.weight.medium,
    textAlign: 'center',
  },
  footerBrand: {
    fontWeight: Andora.typography.weight.bold,
    letterSpacing: 1,
  },
});
