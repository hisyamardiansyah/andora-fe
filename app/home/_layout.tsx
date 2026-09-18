import { Redirect, Stack } from 'expo-router';
import React from 'react';
import { useDebugMode } from '@/hooks/useDebugMode';
import { useSessionContext } from '@/hooks/useSession';

export default function HomeLayout() {
  const { session, loading } = useSessionContext();
  const { debugEnabled, loading: debugLoading } = useDebugMode();
  if (!loading && !debugLoading && !session && !debugEnabled) {
    return <Redirect href="/auth" />;
  }
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="sessions" options={{ headerShown: false }} />
      <Stack.Screen name="insight" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="profile-personal" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile-accessibility"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="profile-security" options={{ headerShown: false }} />
      <Stack.Screen name="profile-help" options={{ headerShown: false }} />
      <Stack.Screen name="profile-about" options={{ headerShown: false }} />
    </Stack>
  );
}
