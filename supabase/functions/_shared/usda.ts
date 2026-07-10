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

export async function lookupNutrientsPer100g(nameSearch: string, apiKey: string): Promise<NutrientTotals> {
  const searchUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(
    nameSearch
  )}&dataType=Foundation,SR%20Legacy&pageSize=1`;

  const res = await fetch(searchUrl);
  const data = await res.json();

  if (!data.foods || data.foods.length === 0) {
    return GENERIC_FALLBACK;
  }

  const food = data.foods[0];
  const nutrients: Partial<NutrientTotals> = {};
  for (const n of food.foodNutrients) {
    const name = n.nutrientName;
    if (name === 'Energy') nutrients.calories = n.value;
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
