import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { deleteMealFromHealthConnect, syncMealToHealthConnect } from '@/lib/health-connect';
import { sumIngredients, type Ingredient, type NutrientTotals } from '@/lib/nutrition';

export type Meal = {
  id: string;
  photoUri: string | null;
  ingredients: Ingredient[];
  totals: NutrientTotals;
  createdAt: string;
  /** id записи в Health Connect, если приём пищи туда синхронизирован */
  healthRecordId?: string;
};

const STORAGE_KEY = 'edazdrav.meals';

type MealsContextValue = {
  meals: Meal[];
  isLoaded: boolean;
  addMeal: (photoUri: string | null, ingredients: Ingredient[]) => void;
  updateMeal: (id: string, ingredients: Ingredient[]) => void;
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

  function persist(next: Meal[]) {
    setMeals(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  function attachHealthRecordId(mealId: string, healthRecordId: string) {
    setMeals((prev) => {
      const next = prev.map((meal) => (meal.id === mealId ? { ...meal, healthRecordId } : meal));
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function addMeal(photoUri: string | null, ingredients: Ingredient[]) {
    const meal: Meal = {
      id: `meal-${Date.now()}`,
      photoUri,
      ingredients,
      totals: sumIngredients(ingredients),
      createdAt: new Date().toISOString(),
    };
    persist([meal, ...meals]);

    syncMealToHealthConnect(meal).then((healthRecordId) => {
      if (healthRecordId) attachHealthRecordId(meal.id, healthRecordId);
    });
  }

  function updateMeal(id: string, ingredients: Ingredient[]) {
    const existing = meals.find((meal) => meal.id === id);
    const next = meals.map((meal) => (meal.id === id ? { ...meal, ingredients, totals: sumIngredients(ingredients) } : meal));
    persist(next);

    const updated = next.find((meal) => meal.id === id);
    if (!updated) return;

    (existing?.healthRecordId ? deleteMealFromHealthConnect(existing.healthRecordId) : Promise.resolve())
      .then(() => syncMealToHealthConnect(updated))
      .then((healthRecordId) => {
        if (healthRecordId) attachHealthRecordId(id, healthRecordId);
      });
  }

  return <MealsContext.Provider value={{ meals, isLoaded, addMeal, updateMeal }}>{children}</MealsContext.Provider>;
}

export function useMeals() {
  const ctx = useContext(MealsContext);
  if (!ctx) throw new Error('useMeals must be used within MealsProvider');
  return ctx;
}
