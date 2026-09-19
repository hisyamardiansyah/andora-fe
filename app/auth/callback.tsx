// OAuth return target for Supabase Google sign-in (redirectTo).
// The code exchange happens in hooks/useSession via openAuthSessionAsync;
// this route only forwards anyone who lands here to the right screen.
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Andora } from '@/constants/Andora';
import { useSessionContext } from '@/hooks/useSession';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { session, loading } = useSessionContext();

  useEffect(() => {
    if (loading) return;
    router.replace(session ? '/home' : '/auth');
  }, [loading, session, router]);

  return (
    <View style={styles.body}>
      <ActivityIndicator size="large" color={Andora.colors.primary} />
      <Text style={styles.text}>Menyelesaikan login Google...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    backgroundColor: Andora.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  text: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
  },
});
