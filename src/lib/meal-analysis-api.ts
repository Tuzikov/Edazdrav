import { supabase } from '@/lib/supabase';
import type { Ingredient, NutrientTotals } from '@/lib/nutrition';

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `ing-${Date.now()}-${idCounter}`;
}

type RecognizedIngredient = { name_ru: string; name_search: string; grams: number };

type RecognizeMealResponse = {
  ingredients: RecognizedIngredient[];
  error?: string;
};

type LookupNutrientsResponse = {
  ingredients: { nameRu: string; grams: number; per100g: NutrientTotals }[];
  error?: string;
};

type LookupIngredientResponse = {
  nameRu: string;
  grams: number;
  per100g: NutrientTotals;
  error?: string;
};

export type AnalysisStage = 'recognizing' | 'calculating';

// Фото → бэкенд, в два отдельных запроса, чтобы UI мог показать, на каком
// именно шаге идёт запрос (какой из них завис):
// 1) recognize-meal — Gemini распознаёт ингредиенты и граммовку
// 2) lookup-nutrients — USDA даёт нутриенты на 100г для каждого ингредиента
// Ключи Gemini/USDA не покидают бэкенд.
export async function analyzeMealPhoto(
  base64: string,
  mimeType: string,
  onStageChange?: (stage: AnalysisStage) => void
): Promise<Ingredient[]> {
  onStageChange?.('recognizing');
  const { data: recognized, error: recognizeError } = await supabase.functions.invoke<RecognizeMealResponse>('recognize-meal', {
    body: { imageBase64: base64, mimeType },
  });
  if (recognizeError) throw recognizeError;
  if (!recognized || recognized.error) throw new Error(recognized?.error ?? 'Пустой ответ от сервера');

  onStageChange?.('calculating');
  const { data: withNutrients, error: nutrientsError } = await supabase.functions.invoke<LookupNutrientsResponse>('lookup-nutrients', {
    body: { ingredients: recognized.ingredients },
  });
  if (nutrientsError) throw nutrientsError;
  if (!withNutrients || withNutrients.error) throw new Error(withNutrients?.error ?? 'Пустой ответ от сервера');

  return withNutrients.ingredients.map((item) => ({
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
