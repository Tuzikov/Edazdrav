import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { DraftMealProvider } from '@/context/draft-meal-context';
import { MealsProvider } from '@/context/meals-context';
import { ProfileProvider } from '@/context/profile-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
