import type { NutrientTotals } from '@/lib/nutrition';

const KNOWN_FOODS: { keywords: string[]; per100g: NutrientTotals }[] = [
  { keywords: ['куриная грудка', 'курица', 'куриное филе'], per100g: { calories: 165, protein: 31, fat: 3.6, carbs: 0, fiber: 0 } },
  { keywords: ['рис'], per100g: { calories: 130, protein: 2.7, fat: 0.3, carbs: 28, fiber: 0.4 } },
  { keywords: ['гречк'], per100g: { calories: 110, protein: 3.9, fat: 1.1, carbs: 21, fiber: 2.7 } },
  { keywords: ['картоф'], per100g: { calories: 87, protein: 2, fat: 0.1, carbs: 20, fiber: 1.8 } },
  { keywords: ['яичниц', 'яйцо', 'яйца'], per100g: { calories: 155, protein: 13, fat: 11, carbs: 1.1, fiber: 0 } },
  { keywords: ['лосос', 'сёмг', 'семг'], per100g: { calories: 208, protein: 20, fat: 13, carbs: 0, fiber: 0 } },
  { keywords: ['брокколи'], per100g: { calories: 34, protein: 2.8, fat: 0.4, carbs: 7, fiber: 2.6 } },
  { keywords: ['помидор', 'томат'], per100g: { calories: 18, protein: 0.9, fat: 0.2, carbs: 3.9, fiber: 1.2 } },
  { keywords: ['огурец', 'огурц'], per100g: { calories: 15, protein: 0.7, fat: 0.1, carbs: 3.6, fiber: 0.5 } },
  { keywords: ['салат', 'зелен'], per100g: { calories: 15, protein: 1.4, fat: 0.2, carbs: 2.9, fiber: 1.3 } },
  { keywords: ['паст', 'макарон', 'спагетти'], per100g: { calories: 158, protein: 5.8, fat: 0.9, carbs: 31, fiber: 1.8 } },
  { keywords: ['хлеб'], per100g: { calories: 265, protein: 9, fat: 3.2, carbs: 49, fiber: 2.7 } },
  { keywords: ['сыр'], per100g: { calories: 350, protein: 25, fat: 27, carbs: 1.3, fiber: 0 } },
  { keywords: ['йогурт'], per100g: { calories: 59, protein: 10, fat: 0.4, carbs: 3.6, fiber: 0 } },
  { keywords: ['говядин'], per100g: { calories: 250, protein: 26, fat: 15, carbs: 0, fiber: 0 } },
  { keywords: ['свинин'], per100g: { calories: 242, protein: 27, fat: 14, carbs: 0, fiber: 0 } },
  { keywords: ['авокадо'], per100g: { calories: 160, protein: 2, fat: 15, carbs: 9, fiber: 6.7 } },
  { keywords: ['яблок'], per100g: { calories: 52, protein: 0.3, fat: 0.2, carbs: 14, fiber: 2.4 } },
  { keywords: ['банан'], per100g: { calories: 89, protein: 1.1, fat: 0.3, carbs: 23, fiber: 2.6 } },
  { keywords: ['пюре'], per100g: { calories: 105, protein: 2, fat: 4, carbs: 15, fiber: 1.5 } },
];

const GENERIC_FALLBACK: NutrientTotals = { calories: 120, protein: 6, fat: 5, carbs: 12, fiber: 1.5 };

export function lookupNutrients(nameRu: string): NutrientTotals {
  const lower = nameRu.toLowerCase();
  const match = KNOWN_FOODS.find((food) => food.keywords.some((keyword) => lower.includes(keyword)));
  return match ? match.per100g : GENERIC_FALLBACK;
}
