import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDraftMeal } from '@/context/draft-meal-context';
import { analyzeMealPhoto } from '@/lib/meal-analysis-api';

export default function AnalyzingScreen() {
  const { photo, setIngredients } = useDraftMeal();
  const [isRetrying, setIsRetrying] = useState(0);

  useEffect(() => {
    if (!photo) {
      router.back();
      return;
    }

    let cancelled = false;

    analyzeMealPhoto(photo.base64, photo.mimeType)
      .then((ingredients) => {
        if (cancelled) return;
        setIngredients(ingredients);
        router.replace('/add-meal/review');
      })
      .catch(() => {
        if (cancelled) return;
        Alert.alert('Не получилось распознать блюдо', 'Проверьте подключение к интернету и попробуйте ещё раз.', [
          { text: 'Назад', style: 'cancel', onPress: () => router.back() },
          { text: 'Повторить', onPress: () => setIsRetrying((n) => n + 1) },
        ]);
      });

    return () => {
      cancelled = true;
    };
    // Анализ перезапускается либо при входе на экран, либо при нажатии "Повторить".
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRetrying]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        {photo && <Image source={{ uri: photo.uri }} style={styles.photo} />}
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
