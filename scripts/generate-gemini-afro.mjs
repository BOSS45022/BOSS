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
const character = readFileSync(resolve(root, 'src/assets/front-man.png')).toString('base64');
const previousAfro = readFileSync(resolve(root, 'src/assets/afro-hair-magenta.png')).toString('base64');
const ai = new GoogleGenAI({ apiKey });
const interaction = await ai.interactions.create({
  model: 'gemini-3.1-flash-image',
  input: [
    { type: 'text', text: `Correct the supplied Afro reference into a compact game hair overlay for this exact bald male character. Keep the natural rounded Afro texture but substantially reduce the lower side volume. The outer hair width should be about 1.75 times the inner face opening, not 2.5 times. Make the inner face opening wider. The lower edge must stop at the TOP of the ears and must never extend toward the cheeks, jaw or neck. Perfectly symmetrical front view, clean hairline above eyebrows. Absolutely no pointed sideburns, face, skin, ears, head outline, neck, body, shadow or text. Draw HAIR PIXELS ONLY on a perfectly flat solid #ff00ff square background, including pure #ff00ff inside the face opening.` },
    { type: 'image', data: character, mime_type: 'image/png' },
    { type: 'image', data: previousAfro, mime_type: 'image/png' },
  ],
  response_modalities: ['image'],
});
const image = interaction.output_image ?? interaction.outputs?.find((output) => output.type === 'image');
if (!image?.data) throw new Error('Gemini returned no Afro image');
writeFileSync(resolve(root, 'src/assets/afro-hair-magenta.png'), Buffer.from(image.data, 'base64'));
console.log('Saved src/assets/afro-hair-magenta.png');
