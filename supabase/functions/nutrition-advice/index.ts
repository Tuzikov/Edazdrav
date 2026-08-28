import { corsHeaders } from '../_shared/cors.ts';
import { getNutritionAdvice, type NutritionAdviceStats } from '../_shared/gemini.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stats = (await req.json()) as NutritionAdviceStats;

    if (!stats.periodLabel || !stats.totals || !stats.averages || !stats.goals) {
      return new Response(JSON.stringify({ error: 'periodLabel, totals, averages and goals are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!;
    const geminiModel = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';

    const advice = await getNutritionAdvice(stats, geminiApiKey, geminiModel);

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
