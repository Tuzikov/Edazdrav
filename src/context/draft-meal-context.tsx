import { createContext, useContext, useState, type ReactNode } from 'react';

import type { Ingredient } from '@/lib/nutrition';

type DraftMealContextValue = {
  photoUri: string | null;
  ingredients: Ingredient[];
  setPhotoUri: (uri: string | null) => void;
  setIngredients: (ingredients: Ingredient[]) => void;
  updateIngredientGrams: (id: string, grams: number) => void;
  removeIngredient: (id: string) => void;
  addIngredient: (ingredient: Ingredient) => void;
  reset: () => void;
};

const DraftMealContext = createContext<DraftMealContextValue | null>(null);

// Черновик текущего добавляемого блюда — живёт только в памяти на время
// flow "камера → анализ → проверка", не сохраняется в AsyncStorage.
export function DraftMealProvider({ children }: { children: ReactNode }) {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  function updateIngredientGrams(id: string, grams: number) {
    setIngredients((prev) => prev.map((ingredient) => (ingredient.id === id ? { ...ingredient, grams } : ingredient)));
  }

  function removeIngredient(id: string) {
    setIngredients((prev) => prev.filter((ingredient) => ingredient.id !== id));
  }

  function addIngredient(ingredient: Ingredient) {
    setIngredients((prev) => [...prev, ingredient]);
  }

  function reset() {
    setPhotoUri(null);
    setIngredients([]);
  }

  return (
    <DraftMealContext.Provider
      value={{ photoUri, ingredients, setPhotoUri, setIngredients, updateIngredientGrams, removeIngredient, addIngredient, reset }}>
      {children}
    </DraftMealContext.Provider>
  );
}

export function useDraftMeal() {
  const ctx = useContext(DraftMealContext);
  if (!ctx) throw new Error('useDraftMeal must be used within DraftMealProvider');
  return ctx;
}
