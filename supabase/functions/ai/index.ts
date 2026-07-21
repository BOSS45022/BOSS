const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
const TEXT_MODEL = 'gemini-2.5-flash';
const IMAGE_MODEL = 'gemini-2.5-flash-image';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { ...cors, 'Content-Type': 'application/json' },
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured on the Edge Function.');
    const body = await req.json();
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt || prompt.length > 4_000) throw new Error('A prompt between 1 and 4000 characters is required.');

    if (body.mode === 'fashion-rating') {
      const imageData = typeof body.imageData === 'string' ? body.imageData : '';
      const mimeType = typeof body.mimeType === 'string' ? body.mimeType : '';
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(mimeType) || !imageData || imageData.length > 8_500_000) {
        throw new Error('A valid fashion image is required for rating.');
      }
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
          body: JSON.stringify({
            contents: [{ parts: [
              { text: `${prompt}\nAct as a constructive professional fashion editor. Rate the complete visible look from 0 to 100 based on coordination, fit, color balance, originality, occasion suitability and styling details. Be encouraging but honest. Return ONLY valid JSON in this exact shape: {"score":82,"verdict":"short verdict","missing":["specific improvement","specific improvement"]}. The missing list must explain why the score is not 100 and contain no more than 4 short items.` },
              { inline_data: { mime_type: mimeType, data: imageData } },
            ] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? 'Gemini rating failed.');
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const rating = JSON.parse(raw.replace(/^```json\s*|\s*```$/g, ''));
      return json({
        score: Math.max(0, Math.min(100, Number(rating.score) || 0)),
        verdict: String(rating.verdict ?? 'Fashion review complete.'),
        missing: Array.isArray(rating.missing) ? rating.missing.slice(0, 4).map(String) : [],
      });
    }

    if (body.mode === 'image-style' || body.mode === 'fashion-character') {
      const imageData = typeof body.imageData === 'string' ? body.imageData : '';
      const mimeType = typeof body.mimeType === 'string' ? body.mimeType : '';
      const isEdit = body.mode === 'image-style';
      if (isEdit && !['image/jpeg', 'image/png', 'image/webp'].includes(mimeType)) throw new Error('Only JPEG, PNG and WebP images are supported.');
      if (isEdit && (!imageData || imageData.length > 8_500_000)) throw new Error('The uploaded image is missing or too large.');

      const parts: Array<Record<string, unknown>> = [{
        text: isEdit
          ? `${prompt}\n\nEdit the supplied image while preserving the same character. Return one polished full-body fashion image.`
          : `${prompt}\n\nGenerate one polished, hyper-realistic full-body fashion character image.`,
      }];
      if (isEdit) parts.push({ inline_data: { mime_type: mimeType, data: imageData } });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: { responseModalities: ['IMAGE'] },
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message ?? 'Gemini image generation failed.');
      const responseParts = data?.candidates?.[0]?.content?.parts ?? [];
      const image = responseParts.find((part: { inlineData?: { data?: string } }) => part.inlineData?.data)?.inlineData;
      if (!image?.data) throw new Error('Gemini returned no generated image.');
      return json({ imageData: image.data, mimeType: image.mimeType ?? 'image/png' });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${TEXT_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: body.system ? { parts: [{ text: body.system }] } : undefined,
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message ?? 'Gemini request failed.');
    return json({ text: data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '' });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : String(error) }, 400);
  }
});
