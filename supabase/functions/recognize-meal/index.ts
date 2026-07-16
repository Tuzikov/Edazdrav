import { corsHeaders } from '../_shared/cors.ts';
import { recognizeMealPhoto } from '../_shared/gemini.ts';

// Шаг 1 из 2: только распознавание фото через Gemini (name_ru + name_search +
// граммы). Отдельная функция от lookup-nutrients, чтобы клиент мог показать
// на экране, на каком именно шаге идёт запрос — это Gemini или USDA.
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

    const ingredients = await recognizeMealPhoto(imageBase64, mimeType || 'image/jpeg', geminiApiKey, geminiModel);

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
