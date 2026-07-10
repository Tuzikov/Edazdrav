import { corsHeaders } from '../_shared/cors.ts';
import { translateIngredientName } from '../_shared/gemini.ts';
import { lookupNutrientsPer100g } from '../_shared/usda.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { nameRu, grams } = await req.json();

    if (!nameRu || typeof nameRu !== 'string') {
      return new Response(JSON.stringify({ error: 'nameRu is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;
    const geminiModel = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
    const fdcApiKey = Deno.env.get('FDC_API_KEY')!;

    const nameSearch = await translateIngredientName(nameRu, geminiApiKey, geminiModel);
    const per100g = await lookupNutrientsPer100g(nameSearch, fdcApiKey);

    return new Response(JSON.stringify({ nameRu, grams: grams ?? 100, per100g }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
