import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Andora } from '@/constants/Andora';

// Auth entry after /onboarding. Layout adapted from Andora tokens + local assets.
// Flow: /onboarding -> /auth -> /home.
export default function AuthScreen() {
  const router = useRouter();

  const goHome = () => router.replace('/home');

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require('../../assets/images/andora-logo-icon1.png')}
        resizeMode="contain"
        accessibilityLabel="Andora logo"
      />
      <Text style={styles.title}>Welcome to Andora</Text>
      <Text style={styles.subtitle}>
        Sign in to continue to your voice agent
      </Text>

      <TouchableOpacity
        onPress={goHome}
        activeOpacity={0.7}
        style={styles.primaryButton}
        accessibilityRole="button"
      >
        <Text style={styles.primaryText}>Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={goHome}
        activeOpacity={0.7}
        style={styles.secondaryButton}
        accessibilityRole="button"
      >
        <Text style={styles.secondaryText}>Continue as Guest</Text>
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
  primaryButton: {
    backgroundColor: Andora.colors.primary,
    borderRadius: Andora.radius.lg,
    paddingVertical: Andora.spacing.md,
    paddingHorizontal: Andora.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    marginBottom: Andora.spacing.sm,
  },
  primaryText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.semibold,
  },
  secondaryButton: {
    borderColor: Andora.colors.borderStrong,
    borderWidth: 1,
    borderRadius: Andora.radius.lg,
    paddingVertical: Andora.spacing.md,
    paddingHorizontal: Andora.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 220,
    marginBottom: Andora.spacing.md,
  },
  secondaryText: {
    color: Andora.colors.text,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.medium,
  },
  terms: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.caption,
    textAlign: 'center',
  },
});
