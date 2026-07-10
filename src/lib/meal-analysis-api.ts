import { supabase } from '@/lib/supabase';
import type { Ingredient, NutrientTotals } from '@/lib/nutrition';

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `ing-${Date.now()}-${idCounter}`;
}

type AnalyzeMealResponse = {
  ingredients: { nameRu: string; grams: number; per100g: NutrientTotals }[];
  error?: string;
};

type LookupIngredientResponse = {
  nameRu: string;
  grams: number;
  per100g: NutrientTotals;
  error?: string;
};

// Фото → бэкенд (Supabase Edge Function) → Gemini распознаёт ингредиенты и
// граммовку → USDA даёт нутриенты на 100г. Ключи Gemini/USDA не покидают бэкенд.
export async function analyzeMealPhoto(base64: string, mimeType: string): Promise<Ingredient[]> {
  const { data, error } = await supabase.functions.invoke<AnalyzeMealResponse>('analyze-meal', {
    body: { imageBase64: base64, mimeType },
  });

  if (error) throw error;
  if (!data || data.error) throw new Error(data?.error ?? 'Пустой ответ от сервера');

  return data.ingredients.map((item) => ({
    id: nextId(),
    nameRu: item.nameRu,
    grams: item.grams,
    per100g: item.per100g,
  }));
}

// Ручной ввод: русское название → бэкенд переводит через Gemini и ищет в USDA.
export async function lookupIngredientOnline(nameRu: string, grams: number): Promise<Ingredient> {
  const { data, error } = await supabase.functions.invoke<LookupIngredientResponse>('lookup-ingredient', {
    body: { nameRu, grams },
  });

  if (error) throw error;
  if (!data || data.error) throw new Error(data?.error ?? 'Пустой ответ от сервера');

  return {
    id: nextId(),
    nameRu: data.nameRu,
    grams: data.grams,
    per100g: data.per100g,
  };
}
