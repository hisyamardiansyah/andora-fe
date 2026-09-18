import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Andora } from '@/constants/Andora';

// Pre-auth flow: intro step -> product step -> /auth.
// Figma voice states live under /assistant and /assistant/validate.
const STEPS = [
  {
    key: 'intro',
    node: '11-6',
    image: require('../../assets/images/start-logo.png'),
    title: 'Meet Andora',
    body: 'Your voice AI companion. Talk naturally and get things done hands-free.',
  },
  {
    key: 'onboarding',
    node: '21-1064',
    image: require('../../assets/images/andora-logo-icon1.png'),
    title: 'Talk naturally',
    body: 'Connect in one tap and start a live conversation with your agent.',
  },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const last = step === STEPS.length - 1;
  const current = STEPS[step];

  const goAuth = () => router.replace('/auth');
  const goNext = () => {
    if (last) {
      goAuth();
    } else {
      setStep(step + 1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={goAuth}
        activeOpacity={0.7}
        style={styles.skipHit}
        accessibilityRole="button"
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <Image
        style={styles.illustration}
        source={current.image}
        resizeMode="contain"
        accessibilityLabel="Andora illustration"
      />
      <Text style={styles.title}>{current.title}</Text>
      <Text style={styles.body}>{current.body}</Text>

      <View style={styles.dots}>
        {STEPS.map((s, index) => (
          <View
            key={s.key}
            style={[styles.dot, index === step ? styles.dotActive : undefined]}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={goNext}
        activeOpacity={0.7}
        style={styles.button}
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>
          {last ? 'Get Started' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Andora.colors.background,
    padding: Andora.spacing.lg,
    paddingTop: Andora.spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipHit: {
    position: 'absolute',
    top: Andora.spacing.xl,
    right: Andora.spacing.lg,
    padding: Andora.spacing.sm,
  },
  skipText: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.body,
    fontWeight: Andora.typography.weight.medium,
  },
  illustration: {
    width: 160,
    height: 160,
    marginBottom: Andora.spacing.lg,
  },
  title: {
    color: Andora.colors.text,
    fontSize: Andora.typography.size.heading,
    fontWeight: Andora.typography.weight.bold,
    textAlign: 'center',
    marginBottom: Andora.spacing.sm,
  },
  body: {
    color: Andora.colors.textMuted,
    fontSize: Andora.typography.size.bodyLarge,
    lineHeight: Andora.typography.lineHeight.normal,
    textAlign: 'center',
    marginBottom: Andora.spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Andora.spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Andora.radius.pill,
    backgroundColor: Andora.colors.borderStrong,
    marginHorizontal: Andora.spacing.xs,
  },
  dotActive: {
    width: 24,
    backgroundColor: Andora.colors.primary,
  },
  button: {
    backgroundColor: Andora.colors.primary,
    borderRadius: Andora.radius.lg,
    paddingVertical: Andora.spacing.md,
    paddingHorizontal: Andora.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: Andora.colors.onPrimary,
    fontSize: Andora.typography.size.bodyLarge,
    fontWeight: Andora.typography.weight.semibold,
  },
});
