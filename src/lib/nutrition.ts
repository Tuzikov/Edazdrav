export type NutrientTotals = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
};

export type Ingredient = {
  id: string;
  nameRu: string;
  grams: number;
  per100g: NutrientTotals;
};

const EMPTY_TOTALS: NutrientTotals = { calories: 0, protein: 0, fat: 0, carbs: 0, fiber: 0 };

export function scaleIngredient(ingredient: Ingredient): NutrientTotals {
  const factor = ingredient.grams / 100;
  return {
    calories: ingredient.per100g.calories * factor,
    protein: ingredient.per100g.protein * factor,
    fat: ingredient.per100g.fat * factor,
    carbs: ingredient.per100g.carbs * factor,
    fiber: ingredient.per100g.fiber * factor,
  };
}

export function sumIngredients(ingredients: Ingredient[]): NutrientTotals {
  return ingredients.reduce((acc, ingredient) => {
    const scaled = scaleIngredient(ingredient);
    return {
      calories: acc.calories + scaled.calories,
      protein: acc.protein + scaled.protein,
      fat: acc.fat + scaled.fat,
      carbs: acc.carbs + scaled.carbs,
      fiber: acc.fiber + scaled.fiber,
    };
  }, EMPTY_TOTALS);
}
