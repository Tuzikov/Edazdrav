import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { lookupIngredientOnline } from '@/lib/meal-analysis-api';
import { sumIngredients, type Ingredient } from '@/lib/nutrition';

type Props = {
  photoUri?: string | null;
  ingredients: Ingredient[];
  onUpdateGrams: (id: string, grams: number) => void;
  onRemoveIngredient: (id: string) => void;
  onAddIngredient: (ingredient: Ingredient) => void;
  footer: ReactNode;
};

export function MealEditor({ photoUri, ingredients, onUpdateGrams, onRemoveIngredient, onAddIngredient, footer }: Props) {
  const theme = useTheme();
  const [newName, setNewName] = useState('');
  const [newGrams, setNewGrams] = useState('100');
  const [isAdding, setIsAdding] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);

  const totals = useMemo(() => sumIngredients(ingredients), [ingredients]);

  async function handleAddIngredient() {
    const name = newName.trim();
    if (!name || isLookingUp) return;
    const grams = Number(newGrams);

    setIsLookingUp(true);
    try {
      const ingredient = await lookupIngredientOnline(name, Number.isNaN(grams) || grams <= 0 ? 100 : grams);
      onAddIngredient(ingredient);
      setNewName('');
      setNewGrams('100');
      setIsAdding(false);
    } catch {
      Alert.alert('Не получилось найти продукт', 'Проверьте подключение к интернету и попробуйте ещё раз.');
    } finally {
      setIsLookingUp(false);
    }
  }

  return (
    <FlatList
      data={ingredients}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      ListHeaderComponent={
        <>
          {photoUri ? <Image source={{ uri: photoUri }} style={styles.photo} /> : null}
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Ингредиенты
          </ThemedText>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.ingredientRow}>
          <ThemedText type="default" style={styles.ingredientName} numberOfLines={1}>
            {item.nameRu}
          </ThemedText>
          <TextInput
            style={[styles.gramsInput, { color: theme.text, borderColor: theme.textSecondary }]}
            keyboardType="numeric"
            value={String(item.grams)}
            onChangeText={(text) => {
              const parsed = Number(text);
              onUpdateGrams(item.id, Number.isNaN(parsed) ? 0 : parsed);
            }}
          />
          <ThemedText type="small" themeColor="textSecondary">
            г
          </ThemedText>
          <Pressable onPress={() => onRemoveIngredient(item.id)} hitSlop={8}>
            <Ionicons name="close-circle-outline" size={22} color="#999" />
          </Pressable>
        </View>
      )}
      ListFooterComponent={
        <View>
          {isAdding ? (
            <View style={styles.addRow}>
              <TextInput
                style={[styles.addInput, { color: theme.text, borderColor: theme.textSecondary }]}
                placeholder="Название продукта"
                placeholderTextColor={theme.textSecondary}
                value={newName}
                onChangeText={setNewName}
                autoFocus
                editable={!isLookingUp}
                onSubmitEditing={handleAddIngredient}
              />
              <TextInput
                style={[styles.addGramsInput, { color: theme.text, borderColor: theme.textSecondary }]}
                keyboardType="numeric"
                placeholder="г"
                placeholderTextColor={theme.textSecondary}
                value={newGrams}
                onChangeText={setNewGrams}
                editable={!isLookingUp}
                onSubmitEditing={handleAddIngredient}
              />
              <Pressable onPress={handleAddIngredient} style={styles.addConfirm} disabled={isLookingUp}>
                {isLookingUp ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText type="smallBold" style={styles.addConfirmText}>
                    Добавить
                  </ThemedText>
                )}
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.addIngredientButton} onPress={() => setIsAdding(true)}>
              <Ionicons name="add-circle-outline" size={20} color="#3c87f7" />
              <ThemedText type="smallBold">Добавить ингредиент</ThemedText>
            </Pressable>
          )}

          <ThemedView type="backgroundElement" style={styles.totalsCard}>
            <View style={styles.totalsRow}>
              <ThemedText type="smallBold">Калории</ThemedText>
              <ThemedText type="smallBold">{Math.round(totals.calories)} ккал</ThemedText>
            </View>
            <View style={styles.totalsRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Белки
              </ThemedText>
              <ThemedText type="small">{totals.protein.toFixed(1)} г</ThemedText>
            </View>
            <View style={styles.totalsRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Жиры
              </ThemedText>
              <ThemedText type="small">{totals.fat.toFixed(1)} г</ThemedText>
            </View>
            <View style={styles.totalsRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Углеводы
              </ThemedText>
              <ThemedText type="small">{totals.carbs.toFixed(1)} г</ThemedText>
            </View>
            <View style={styles.totalsRow}>
              <ThemedText type="small" themeColor="textSecondary">
                Клетчатка
              </ThemedText>
              <ThemedText type="small">{totals.fiber.toFixed(1)} г</ThemedText>
            </View>
          </ThemedView>

          {footer}
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  listContent: { paddingHorizontal: Spacing.three, paddingBottom: Spacing.four },
  photo: { width: '100%', height: 200, borderRadius: Spacing.three, marginTop: Spacing.two },
  sectionTitle: { marginTop: Spacing.three, marginBottom: Spacing.two },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(120,120,128,0.15)',
  },
  ingredientName: { flex: 1 },
  gramsInput: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: 4,
    width: 60,
    textAlign: 'right',
  },
  addIngredientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  addInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  addGramsInput: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    width: 56,
    textAlign: 'right',
  },
  addConfirm: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  addConfirmText: { color: '#fff' },
  totalsCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    marginTop: Spacing.three,
    gap: Spacing.one,
  },
  totalsRow: { flexDirection: 'row', justifyContent: 'space-between' },
});
