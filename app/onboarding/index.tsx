import { useRouter } from 'expo-router';
import { useEffect } from 'react';

// Deprecated: old onboarding flow removed.
// Kept as redirect so deep links to /onboarding don't break.
export default function OnboardingScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth');
  }, [router]);

  return null;
}
