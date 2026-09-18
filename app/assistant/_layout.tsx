import { Stack } from 'expo-router';
import React from 'react';

export default function AssistantLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="validate" options={{ headerShown: false }} />
      <Stack.Screen name="sending" options={{ headerShown: false }} />
      <Stack.Screen name="send-result" options={{ headerShown: false }} />
      <Stack.Screen name="send-error" options={{ headerShown: false }} />
      <Stack.Screen name="send-retry" options={{ headerShown: false }} />
    </Stack>
  );
}
