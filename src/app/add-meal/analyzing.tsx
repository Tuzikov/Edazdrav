import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDraftMeal } from '@/context/draft-meal-context';
import { mockAnalyzeMeal } from '@/lib/mock-analysis';

export default function AnalyzingScreen() {
  const { photoUri, setIngredients } = useDraftMeal();

  useEffect(() => {
    let cancelled = false;
    mockAnalyzeMeal(photoUri ?? '').then((ingredients) => {
      if (cancelled) return;
      setIngredients(ingredients);
      router.replace('/add-meal/review');
    });
    return () => {
      cancelled = true;
    };
    // Анализ запускается один раз при входе на экран, независимо от последующих рендеров.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {photoUri && <Image source={{ uri: photoUri }} style={styles.photo} />}
        <ActivityIndicator size="large" color="#3c87f7" style={styles.spinner} />
        <ThemedText type="default">Распознаём блюдо…</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Это займёт несколько секунд
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.three, paddingHorizontal: Spacing.four },
  photo: { width: 200, height: 200, borderRadius: Spacing.three, marginBottom: Spacing.three },
  spinner: { marginBottom: Spacing.two },
});
