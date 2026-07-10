import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealEditor } from '@/components/meal-editor';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMeals } from '@/context/meals-context';
import type { Ingredient } from '@/lib/nutrition';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { meals, updateMeal } = useMeals();
  const meal = meals.find((item) => item.id === id);

  const [ingredients, setIngredients] = useState<Ingredient[]>(meal?.ingredients ?? []);

  if (!meal) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
          <ThemedText type="default" style={styles.notFound}>
            Приём пищи не найден — возможно, он был удалён.
          </ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const mealId = meal.id;

  function updateIngredientGrams(ingredientId: string, grams: number) {
    setIngredients((prev) => prev.map((ingredient) => (ingredient.id === ingredientId ? { ...ingredient, grams } : ingredient)));
  }

  function removeIngredient(ingredientId: string) {
    setIngredients((prev) => prev.filter((ingredient) => ingredient.id !== ingredientId));
  }

  function addIngredient(ingredient: Ingredient) {
    setIngredients((prev) => [...prev, ingredient]);
  }

  function handleSave() {
    updateMeal(mealId, ingredients);
    router.back();
  }

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: formatDateTime(meal.createdAt) }} />
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <MealEditor
          photoUri={meal.photoUri}
          ingredients={ingredients}
          onUpdateGrams={updateIngredientGrams}
          onRemoveIngredient={removeIngredient}
          onAddIngredient={addIngredient}
          footer={
            <Pressable
              style={[styles.saveButton, ingredients.length === 0 && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={ingredients.length === 0}>
              <ThemedText type="smallBold" style={styles.saveButtonText}>
                Сохранить изменения
              </ThemedText>
            </Pressable>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  notFound: { padding: Spacing.four, textAlign: 'center' },
  saveButton: {
    marginTop: Spacing.three,
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.three,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#fff' },
});
