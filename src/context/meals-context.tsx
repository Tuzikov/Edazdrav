import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { sumIngredients, type Ingredient, type NutrientTotals } from '@/lib/nutrition';

export type Meal = {
  id: string;
  photoUri: string | null;
  ingredients: Ingredient[];
  totals: NutrientTotals;
  createdAt: string;
};

const STORAGE_KEY = 'edazdrav.meals';

type MealsContextValue = {
  meals: Meal[];
  isLoaded: boolean;
  addMeal: (photoUri: string | null, ingredients: Ingredient[]) => void;
};

const MealsContext = createContext<MealsContextValue | null>(null);

export function MealsProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setMeals(JSON.parse(raw));
        } catch {
          // повреждённые данные в хранилище — начинаем с пустой истории
        }
      }
      setIsLoaded(true);
    });
  }, []);

  function addMeal(photoUri: string | null, ingredients: Ingredient[]) {
    const meal: Meal = {
      id: `meal-${Date.now()}`,
      photoUri,
      ingredients,
      totals: sumIngredients(ingredients),
      createdAt: new Date().toISOString(),
    };
    const next = [meal, ...meals];
    setMeals(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return <MealsContext.Provider value={{ meals, isLoaded, addMeal }}>{children}</MealsContext.Provider>;
}

export function useMeals() {
  const ctx = useContext(MealsContext);
  if (!ctx) throw new Error('useMeals must be used within MealsProvider');
  return ctx;
}
