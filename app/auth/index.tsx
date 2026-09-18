import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Andora } from '@/constants/Andora';

// Auth entry: Supabase Google SSO placeholder. Currently bypasses to /home.
export default function AuthScreen() {
  const router = useRouter();

  const goHome = () => router.replace('/home');

  // TODO: wire to supabase.auth.signInWithOAuth({provider:'google'}) when EXPO_PUBLIC_SUPABASE_URL/KEY set — currently bypasses to /home.
  const supabaseConfigured = false;

  const handleGoogleSignIn = () => {
    if (supabaseConfigured) {
      return;
    }
    goHome();
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require('../../assets/images/andora-logo-icon1.png')}
        resizeMode="contain"
        accessibilityLabel="Andora logo"
      />
      <Text style={styles.title}>Welcome to Andora</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TouchableOpacity
        onPress={handleGoogleSignIn}
        activeOpacity={0.7}
        style={styles.googleButton}
        accessibilityRole="button"
      >
        <Ionicons
          name="logo-google"
          size={20}
          color={Andora.colors.text}
          style={styles.googleIcon}
        />
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      <Text style={styles.terms}>
        By continuing you agree to the Terms and Privacy Policy.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Andora.colors.background,
    padding: Andora.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: Andora.spacing.md,
  },
  title: {
    color: Andora.colors.text,
    fontSize: Andora.typography.size.heading,
    fontWeight: Andora.typography.weight.bold,
    textAlign: 'center',
    marginBottom: Andora.spacing.xs,
  },
  subtitle: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.bodyLarge,
    lineHeight: Andora.typography.lineHeight.normal,
    textAlign: 'center',
    marginBottom: Andora.spacing.lg,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: Andora.colors.surface,
    borderColor: Andora.colors.border,
    borderWidth: 1,
    borderRadius: Andora.radius.lg,
    paddingVertical: Andora.spacing.md,
    paddingHorizontal: Andora.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    marginBottom: Andora.spacing.md,
  },
  googleIcon: {
    marginRight: Andora.spacing.sm,
  },
  googleText: {
    color: Andora.colors.text,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.semibold,
  },
  terms: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.caption,
    textAlign: 'center',
  },
});
