export type NutrientTotals = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
};

// Используется, когда USDA не находит совпадение — чтобы ингредиент не
// исчезал молча из списка, а пользователь видел его и мог поправить/удалить.
const GENERIC_FALLBACK: NutrientTotals = { calories: 120, protein: 6, fat: 5, carbs: 12, fiber: 1.5 };

// Foundation/SR Legacy — это в основном сырые/базовые продукты, там почти нет
// готовых блюд и напитков (типа "кофе с молоком" или "манговый десерт").
// Survey (FNDDS) как раз про еду "как её едят" — с ней совпадения для
// составных блюд намного точнее.
const DATA_TYPES = 'Foundation,SR Legacy,Survey (FNDDS)';

async function searchFoods(nameSearch: string, apiKey: string): Promise<any> {
  const url = new URL('https://api.nal.usda.gov/fdc/v1/foods/search');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('query', nameSearch);
  url.searchParams.set('dataType', DATA_TYPES);
  url.searchParams.set('pageSize', '1');

  // USDA-эндпоинт периодически отдаёт 400 сам по себе, без видимой причины
  // на нашей стороне (не связано с частотой запросов) — лечится ретраем.
  // 2 попытки было мало и иногда всё равно уходило в общий фолбэк.
  const retryDelaysMs = [500, 1000, 2000, 4000];
  for (let attempt = 0; attempt <= retryDelaysMs.length; attempt++) {
    const res = await fetch(url.toString());
    if (res.ok) return res.json();
    if (attempt < retryDelaysMs.length) {
      await new Promise((resolve) => setTimeout(resolve, retryDelaysMs[attempt]));
      continue;
    }
  }
  return null;
}

export async function lookupNutrientsPer100g(nameSearch: string, apiKey: string): Promise<NutrientTotals> {
  const data = await searchFoods(nameSearch, apiKey);

  if (!data || !data.foods || data.foods.length === 0) {
    return GENERIC_FALLBACK;
  }

  const food = data.foods[0];
  const nutrients: Partial<NutrientTotals> = {};
  for (const n of food.foodNutrients) {
    const name = n.nutrientName;
    // USDA обычно отдаёт "Energy" дважды — в ккал и в кДж (unitName различается).
    // Берём только ккал, иначе калории завышаются примерно в 4.18 раза.
    if (name === 'Energy' && (n.unitName ?? '').toUpperCase() === 'KCAL') nutrients.calories = n.value;
    if (name === 'Protein') nutrients.protein = n.value;
    if (name === 'Total lipid (fat)') nutrients.fat = n.value;
    if (name === 'Carbohydrate, by difference') nutrients.carbs = n.value;
    if (name === 'Fiber, total dietary') nutrients.fiber = n.value;
  }

  return {
    calories: nutrients.calories ?? GENERIC_FALLBACK.calories,
    protein: nutrients.protein ?? GENERIC_FALLBACK.protein,
    fat: nutrients.fat ?? GENERIC_FALLBACK.fat,
    carbs: nutrients.carbs ?? GENERIC_FALLBACK.carbs,
    fiber: nutrients.fiber ?? GENERIC_FALLBACK.fiber,
  };
}
