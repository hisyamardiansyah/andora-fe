import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';
import { SESSION_CANCELLED_CODE, useSessionContext } from '@/hooks/useSession';

// Login screen matching Figma node 87-675 ("Profile"). Illustration and
// Google G mark are PNGs exported from that node; doc/status glyphs use Ionicons.
export default function AuthScreen() {
  const router = useRouter();
  const { session, loading, configured, signInWithGoogle } =
    useSessionContext();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session) {
      router.replace('/home');
    }
  }, [loading, session, router]);

  const handleGoogleSignIn = async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      const code = (e as { code?: string }).code;
      if (code !== SESSION_CANCELLED_CODE && e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Image
              style={styles.brandLogo}
              source={require('../../assets/images/andora-logo-icon1.png')}
              resizeMode="contain"
              accessibilityLabel="Andora logo"
            />
            <Text style={styles.brandName}>Andora</Text>
          </View>
          <Text style={styles.tagline}>
            Asisten untuk Mengakses Keperluan Dokumen yang Setara
          </Text>
        </View>

        <View style={styles.illustrationWrap}>
          <Image
            style={styles.illustration}
            source={require('../../assets/images/login-illustration.png')}
            resizeMode="contain"
            accessibilityLabel="Woman with documents illustration"
          />
        </View>

        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Selamat Datang di Andora!</Text>
          <Text style={styles.welcomeBody}>
            Dapatkan bantuan untuk memahami, membuat, dan mengirimkan dokumen
            administrasi dengan lebih mudah
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleGoogleSignIn}
          activeOpacity={0.85}
          style={[styles.googleButton, busy ? styles.googleButtonBusy : null]}
          accessibilityRole="button"
          disabled={busy || loading}
        >
          <Image
            style={styles.googleIcon}
            source={require('../../assets/images/google-g.png')}
            resizeMode="contain"
            accessibilityLabel="Google logo"
          />
          <Text style={styles.googleText}>
            {busy
              ? 'Menghubungkan...'
              : loading
              ? 'Memeriksa sesi...'
              : 'Lanjutkan dengan akun google'}
          </Text>
        </TouchableOpacity>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : !configured ? (
          <Text style={styles.errorText}>
            Login Google butuh EXPO_PUBLIC_SUPABASE_URL dan
            EXPO_PUBLIC_SUPABASE_ANON_KEY.
          </Text>
        ) : null}

        <View style={styles.privacyRow}>
          <Ionicons
            name="lock-closed"
            size={24}
            color={Andora.colors.textMuted2}
          />
          <Text style={styles.privacyText}>
            Dengan melanjutkan, Anda menyetujui kebijakan privasi dan keamanan
            Andora
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Andora.colors.background },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: Andora.spacing.lg,
    paddingTop: 32,
    paddingBottom: Andora.spacing.xl,
  },
  header: { width: 315, alignItems: 'center' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandLogo: { width: 39, height: 39 },
  brandName: {
    color: Andora.colors.text,
    fontSize: 30,
    fontWeight: Andora.typography.weight.bold,
    letterSpacing: -0.9,
  },
  tagline: {
    marginTop: 8,
    color: Andora.colors.textMuted2,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.semibold,
    lineHeight: 21,
    textAlign: 'center',
  },
  illustrationWrap: { marginTop: 24, alignItems: 'center' },
  illustration: { width: 232, height: 226 },
  welcome: {
    width: 370,
    maxWidth: '100%',
    marginTop: 40,
    alignItems: 'center',
    gap: 4,
  },
  welcomeTitle: {
    color: Andora.colors.primaryMuted,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  welcomeBody: {
    color: Andora.colors.textMuted2,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.medium,
    lineHeight: 21,
    textAlign: 'center',
  },
  googleButton: {
    width: 380,
    maxWidth: '100%',
    height: 55,
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    backgroundColor: Andora.colors.bubbleUser,
    borderWidth: 1,
    borderColor: Andora.colors.borderStrong,
    borderRadius: 20,
  },
  googleIcon: { width: 21, height: 21 },
  googleButtonBusy: { opacity: 0.6 },
  errorText: {
    marginTop: 12,
    color: Andora.colors.danger,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.semibold,
    textAlign: 'center',
  },
  googleText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.title,
    fontWeight: Andora.typography.weight.bold,
    letterSpacing: -0.6,
  },
  privacyRow: {
    width: 370,
    maxWidth: '100%',
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  privacyText: {
    flex: 1,
    color: Andora.colors.textMuted2,
    fontSize: 14,
    fontWeight: Andora.typography.weight.semibold,
    lineHeight: 21,
    textAlign: 'justify',
  },
});
