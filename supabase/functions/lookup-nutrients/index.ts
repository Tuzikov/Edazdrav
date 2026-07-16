import { corsHeaders } from '../_shared/cors.ts';
import { lookupNutrientsPer100g } from '../_shared/usda.ts';

type RecognizedIngredient = {
  name_ru: string;
  name_search: string;
  grams: number;
};

// Шаг 2 из 2: берём уже распознанные Gemini ингредиенты (name_ru +
// name_search + граммы) и ищем нутриенты в USDA для каждого. Отдельно от
// recognize-meal — см. комментарий там.
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { ingredients } = await req.json();

    if (!Array.isArray(ingredients)) {
      return new Response(JSON.stringify({ error: 'ingredients array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const fdcApiKey = Deno.env.get('FDC_API_KEY')!;

    const result = await Promise.all(
      (ingredients as RecognizedIngredient[]).map(async (item) => ({
        nameRu: item.name_ru,
        grams: item.grams,
        per100g: await lookupNutrientsPer100g(item.name_search, fdcApiKey),
      }))
    );

    return new Response(JSON.stringify({ ingredients: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
