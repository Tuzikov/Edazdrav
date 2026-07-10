import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealEditor } from '@/components/meal-editor';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useDraftMeal } from '@/context/draft-meal-context';
import { useMeals } from '@/context/meals-context';

export default function ReviewScreen() {
  const { photoUri, ingredients, updateIngredientGrams, removeIngredient, addIngredient, reset } = useDraftMeal();
  const { addMeal } = useMeals();

  function handleSave() {
    addMeal(photoUri, ingredients);
    reset();
    router.dismissTo('/');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <MealEditor
          photoUri={photoUri}
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
                Сохранить приём пищи
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
