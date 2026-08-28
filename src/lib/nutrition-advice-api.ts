import { supabase } from '@/lib/supabase';
import type { NutrientTotals } from '@/lib/nutrition';

export type NutritionAdviceStats = {
  periodLabel: string;
  days: number;
  totals: NutrientTotals;
  averages: NutrientTotals;
  goals: NutrientTotals;
};

type NutritionAdviceResponse = {
  advice: string;
  error?: string;
};

// Отправляется только по нажатию кнопки на экране «История» — не автоматически.
export async function getNutritionAdvice(stats: NutritionAdviceStats): Promise<string> {
  const { data, error } = await supabase.functions.invoke<NutritionAdviceResponse>('nutrition-advice', {
    body: stats,
  });

  if (error) throw error;
  if (!data || data.error) throw new Error(data?.error ?? 'Пустой ответ от сервера');

  return data.advice;
}
