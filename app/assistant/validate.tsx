import { useRouter } from 'expo-router';
import { useEffect } from 'react';

// Legacy entry point retired: the old "Andora paham" validate screen is gone.
// The transcript chat at /assistant is the only entry; keep this redirect so
// old deep links do not break.
export default function ValidateRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/assistant');
  }, [router]);

  return null;
}
