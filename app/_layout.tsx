import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { Andora } from '@/constants/Andora';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ConnectionProvider } from '@/hooks/useConnection';
import { DebugProvider } from '@/hooks/useDebugMode';
import { SessionProvider } from '@/hooks/useSession';

SplashScreen.preventAutoHideAsync().catch(() => {});

const AndoraDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Andora.colors.background,
    card: Andora.colors.surface,
    text: Andora.colors.text,
    border: Andora.colors.border,
    primary: Andora.colors.primary,
  },
};

const AndoraLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Andora.colors.background,
    card: Andora.colors.surface,
    text: Andora.colors.text,
    border: Andora.colors.border,
    primary: Andora.colors.primary,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  return (
    <DebugProvider>
      <SessionProvider>
        <ConnectionProvider>
          <ThemeProvider
            value={colorScheme === 'dark' ? AndoraDarkTheme : AndoraLightTheme}
          >
            <Stack>
              <Stack.Screen name="(start)" options={{ headerShown: false }} />
              <Stack.Screen
                name="onboarding"
                options={{ headerShown: false }}
              />
              <Stack.Screen name="auth" options={{ headerShown: false }} />
              <Stack.Screen name="home" options={{ headerShown: false }} />
              <Stack.Screen name="assistant" options={{ headerShown: false }} />
            </Stack>
            <StatusBar
              style="light"
              backgroundColor={Andora.colors.background}
            />
          </ThemeProvider>
        </ConnectionProvider>
      </SessionProvider>
    </DebugProvider>
  );
}
