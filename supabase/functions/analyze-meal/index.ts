import { corsHeaders } from '../_shared/cors.ts';
import { recognizeMealPhoto } from '../_shared/gemini.ts';
import { lookupNutrientsPer100g } from '../_shared/usda.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return new Response(JSON.stringify({ error: 'imageBase64 is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;
    const geminiModel = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
    const fdcApiKey = Deno.env.get('FDC_API_KEY')!;

    const recognized = await recognizeMealPhoto(imageBase64, mimeType || 'image/jpeg', geminiApiKey, geminiModel);

    const ingredients = await Promise.all(
      recognized.map(async (item) => ({
        nameRu: item.name_ru,
        grams: item.grams,
        per100g: await lookupNutrientsPer100g(item.name_search, fdcApiKey),
      }))
    );

    return new Response(JSON.stringify({ ingredients }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
