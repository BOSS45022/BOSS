import { GoogleGenAI } from '@google/genai';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function envValue(file, name) {
  const line = readFileSync(file, 'utf8').split(/\r?\n/).find((entry) => entry.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim();
}

const root = resolve(import.meta.dirname, '..');
const apiKey = envValue(resolve(root, '.env.local'), 'GEMINI_API_KEY');
if (!apiKey) throw new Error('GEMINI_API_KEY is missing');

const ai = new GoogleGenAI({ apiKey });
const frontSheet = readFileSync(resolve(root, 'src/assets/hair-overlays-refined.png')).toString('base64');
const afro = readFileSync(resolve(root, 'src/assets/afro-hair.png')).toString('base64');
const jobs = [
  { id: 'buzz-side', style: 'very short natural buzz cut', view: 'strict left-facing side profile', target: 'side-man-v2.png', reference: frontSheet },
  { id: 'buzz-back', style: 'very short natural buzz cut', view: 'strict rear view', target: 'back-man.png', reference: frontSheet },
  { id: 'afro-side', style: 'large rounded natural Afro, same full round volume as the reference', view: 'strict left-facing side profile', target: 'side-man-v2.png', reference: afro },
  { id: 'afro-back', style: 'large rounded natural Afro, same full round volume as the reference', view: 'strict rear view', target: 'back-man.png', reference: afro },
];

for (const job of jobs) {
  const character = readFileSync(resolve(root, `src/assets/${job.target}`)).toString('base64');
  const prompt = `Create one production-ready HAIR-ONLY overlay of a ${job.style} in ${job.view} for the exact supplied character skull.

The hairstyle must be physically attached to and naturally wrap around the supplied skull position and proportions. Preserve the same haircut identity as the supplied hair reference; change camera angle only. Hair must cover the appropriate visible scalp, including the rear of the skull. Output one centered hairstyle at generous resolution on perfectly flat solid #ff00ff.

Draw hair pixels only. No face, skin, scalp color, ears, eyes, eyebrows, neck, shoulders, clothing, body, text, border, glow, shadow, green or purple fringe. Everything inside and around the hair must be pure #ff00ff. Do not output a front-facing hairstyle.`;
  const interaction = await ai.interactions.create({
    model: 'gemini-3.1-flash-image',
    input: [
      { type: 'text', text: prompt },
      { type: 'image', data: character, mime_type: 'image/png' },
      { type: 'image', data: job.reference, mime_type: 'image/png' },
    ],
    response_modalities: ['image'],
  });
  const image = interaction.output_image ?? interaction.outputs?.find((output) => output.type === 'image');
  if (!image?.data) throw new Error(`Gemini returned no ${job.id} image`);
  writeFileSync(resolve(root, `src/assets/${job.id}-magenta.png`), Buffer.from(image.data, 'base64'));
  console.log(`Saved src/assets/${job.id}-magenta.png`);
}
