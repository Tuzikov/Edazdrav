import { lookupNutrients } from '@/lib/mock-nutrient-lookup';
import type { Ingredient } from '@/lib/nutrition';

const PRESET_DISHES: { nameRu: string; grams: number }[][] = [
  [
    { nameRu: 'куриная грудка гриль', grams: 150 },
    { nameRu: 'рис отварной', grams: 120 },
    { nameRu: 'брокколи на пару', grams: 80 },
  ],
  [
    { nameRu: 'паста с томатным соусом', grams: 220 },
    { nameRu: 'сыр тёртый', grams: 20 },
  ],
  [
    { nameRu: 'говядина тушёная', grams: 130 },
    { nameRu: 'картофельное пюре', grams: 150 },
    { nameRu: 'салат овощной', grams: 90 },
  ],
  [
    { nameRu: 'яичница', grams: 120 },
    { nameRu: 'хлеб', grams: 40 },
    { nameRu: 'помидор', grams: 60 },
  ],
];

let idCounter = 0;
function nextId(): string {
  idCounter += 1;
  return `ing-${Date.now()}-${idCounter}`;
}

// Заглушка: пока не подключён реальный бэкенд (Gemini + USDA), имитируем
// распознавание случайным набором блюд из заранее заданного списка.
export function mockAnalyzeMeal(_photoUri: string): Promise<Ingredient[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const dish = PRESET_DISHES[Math.floor(Math.random() * PRESET_DISHES.length)];
      resolve(
        dish.map((item) => ({
          id: nextId(),
          nameRu: item.nameRu,
          grams: item.grams,
          per100g: lookupNutrients(item.nameRu),
        }))
      );
    }, 1400);
  });
}

export function createManualIngredient(nameRu: string, grams: number): Ingredient {
  return {
    id: nextId(),
    nameRu,
    grams,
    per100g: lookupNutrients(nameRu),
  };
}
