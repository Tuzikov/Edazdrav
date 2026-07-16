export type RecognizedIngredient = {
  name_ru: string;
  name_search: string;
  grams: number;
};

const RETRY_DELAYS_MS = [2000, 5000, 10000, 20000];

async function callGemini(apiKey: string, model: string, parts: unknown[]): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const body = JSON.stringify({ contents: [{ parts }] });

  let data: any;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    data = await response.json();

    if (response.ok) break;

    const isRetryable = response.status === 503 || response.status === 429;
    if (isRetryable && attempt < RETRY_DELAYS_MS.length) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
      continue;
    }

    throw new Error(`Gemini API error: ${JSON.stringify(data)}`);
  }

  return data.candidates[0].content.parts[0].text as string;
}

function parseJsonResponse(text: string): unknown {
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

// Один проход: просим у Gemini одновременно русское название (для UI),
// английское название (для поиска в USDA) и граммовку порции.
export async function recognizeMealPhoto(
  imageBase64: string,
  mimeType: string,
  apiKey: string,
  model: string
): Promise<RecognizedIngredient[]> {
  const prompt = `Look at this photo of a meal. Identify each distinct food item/ingredient/beverage visible and estimate its weight or volume in grams based on typical portion sizes (use ~1g per ml for drinks/water). Respond ONLY with a JSON array, no explanation, no markdown formatting, in this exact format:
[{"name_ru": "название на русском", "name_search": "English USDA FoodData Central style search term", "grams": number}]

Rules for name_search:
- For solid foods (meat, vegetables, fruits, grains), include the preparation state the way USDA describes it, e.g. "chicken breast, grilled" or "banana, raw".
- For beverages and liquids (water, coffee, tea, juice, milk, soda, alcohol), do NOT add "raw" or "cooked" — use the natural beverage name the way USDA describes it, e.g. "water, tap, drinking", "coffee with milk", "orange juice".`;

  const text = await callGemini(apiKey, model, [{ text: prompt }, { inline_data: { mime_type: mimeType, data: imageBase64 } }]);
  return parseJsonResponse(text) as RecognizedIngredient[];
}

// Для ручного ввода: у нас уже есть русское название от пользователя,
// нужен только перевод для поиска в USDA.
export async function translateIngredientName(nameRu: string, apiKey: string, model: string): Promise<string> {
  const prompt = `Translate this Russian food/ingredient/beverage name to an English search term for USDA FoodData Central: "${nameRu}".
- If it's a solid food (meat, vegetables, fruits, grains), include the typical preparation state the way USDA describes it (e.g. "raw" for fresh fruit/vegetables when the Russian name doesn't imply cooking, "grilled"/"boiled"/"fried" etc. when it does) — for example "banana, raw" or "chicken breast, grilled".
- If it's a beverage or liquid (water, coffee, tea, juice, milk, soda, alcohol), do NOT add "raw"/"cooked" — use the natural beverage name the way USDA describes it, e.g. "water, tap, drinking" or "coffee with milk".
Respond with ONLY the search term (2-5 words), nothing else.`;

  const text = await callGemini(apiKey, model, [{ text: prompt }]);
  return text.trim();
}
