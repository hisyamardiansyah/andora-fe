// OAuth return target for Supabase Google sign-in (redirectTo).
// The code exchange happens in hooks/useSession via openAuthSessionAsync;
// this route only forwards anyone who lands here to the right screen.
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import { useSessionContext } from '@/hooks/useSession';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const { session, loading } = useSessionContext();

  useEffect(() => {
    if (loading) return;
    router.replace(session ? '/home' : '/auth');
  }, [loading, session, router]);

  return <View />;
}
