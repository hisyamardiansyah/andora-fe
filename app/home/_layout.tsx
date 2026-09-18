import { Stack } from 'expo-router';
import React from 'react';

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="sessions" options={{ headerShown: false }} />
      <Stack.Screen name="insight" options={{ headerShown: false }} />
    </Stack>
  );
}
