import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SystemBars } from 'react-native-edge-to-edge';

import { DraftMealProvider } from '@/context/draft-meal-context';
import { MealsProvider } from '@/context/meals-context';
import { ProfileProvider } from '@/context/profile-context';
import { ThemePreferenceProvider } from '@/context/theme-preference-context';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

SplashScreen.preventAutoHideAsync();

function RootLayoutInner() {
  const colorScheme = useResolvedColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SystemBars style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <ProfileProvider>
        <MealsProvider>
          <DraftMealProvider>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="add-meal" options={{ presentation: 'modal', headerShown: false }} />
            </Stack>
          </DraftMealProvider>
        </MealsProvider>
      </ProfileProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootLayoutInner />
    </ThemePreferenceProvider>
  );
}
