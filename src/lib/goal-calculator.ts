import type { NutritionGoals } from '@/context/profile-context';

export type Sex = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';

export const ACTIVITY_LEVELS: { key: ActivityLevel; label: string; multiplier: number; proteinPerKg: number }[] = [
  { key: 'sedentary', label: 'Сидячая работа, без физической активности', multiplier: 1.2, proteinPerKg: 1.0 },
  { key: 'light', label: 'Минимальная физическая активность', multiplier: 1.375, proteinPerKg: 1.2 },
  { key: 'moderate', label: 'Регулярные тренировки', multiplier: 1.55, proteinPerKg: 1.6 },
  { key: 'active', label: 'Любительский уровень', multiplier: 1.725, proteinPerKg: 1.8 },
  { key: 'athlete', label: 'Профессиональные тренировки, спортсмен', multiplier: 1.9, proteinPerKg: 2.2 },
];

export type CalculatorInput = {
  sex: Sex;
  age: number;
  weightKg: number;
  heightCm: number;
  activity: ActivityLevel;
};

// Формула Миффлина-Сан Жеора: считает базовый обмен веществ (BMR) по полу,
// весу, росту и возрасту, затем умножает на коэффициент активности (TDEE).
function calculateBmr({ sex, age, weightKg, heightCm }: CalculatorInput): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calculateGoals(input: CalculatorInput): NutritionGoals {
  const activity = ACTIVITY_LEVELS.find((level) => level.key === input.activity) ?? ACTIVITY_LEVELS[0];
  const calories = Math.round(calculateBmr(input) * activity.multiplier);

  const protein = Math.round(input.weightKg * activity.proteinPerKg);
  const fat = Math.round((calories * 0.3) / 9);
  const remainingKcal = Math.max(calories - protein * 4 - fat * 9, 0);
  const carbs = Math.round(remainingKcal / 4);
  // Рекомендация по клетчатке: ~14г на каждые 1000 ккал рациона (USDA/IOM).
  const fiber = Math.round((calories / 1000) * 14);

  return { calories, protein, fat, carbs, fiber };
}
