import { GoogleGenAI } from '@google/genai';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readEnvValue(file, name) {
  const line = readFileSync(file, 'utf8').split(/\r?\n/).find((entry) => entry.startsWith(`${name}=`));
  return line?.slice(name.length + 1).trim();
}

const root = resolve(import.meta.dirname, '..');
const apiKey = readEnvValue(resolve(root, '.env.local'), 'GEMINI_API_KEY');
if (!apiKey) throw new Error('GEMINI_API_KEY is missing from .env.local');

const reference = readFileSync(resolve(root, 'src/assets/front-man.png')).toString('base64');
const ai = new GoogleGenAI({ apiKey });
const prompt = `Create a polished game-asset contact sheet using the supplied character as the exact identity and head-shape reference.

Layout: exactly 5 equal columns by 4 equal rows. Show the same male character's head and upper shoulders in every occupied cell, perfectly front-facing, with identical face, skin tone, head size, position, camera, clothing and lighting. Use a perfectly flat solid #00ff00 background. No labels, text, borders, shadows, watermark-like decorations or extra objects.

There must be exactly 19 choices, ordered left-to-right and top-to-bottom:
Row 1: bald, buzz cut, crew cut, French crop, Caesar cut.
Row 2: low fade, mid fade, high fade, taper fade, 360 waves.
Row 3: short natural curls, medium natural curls, rounded afro, short twists, cornrows.
Row 4: box braids, short dreadlocks, slick back, side part, and the final fifth cell completely empty green.

Hair must look natural, detailed, masculine and professionally barbered, using realistic dark brown or black strands. Every hairstyle must fit this exact skull and hairline proportionally. Preserve the supplied face, ears, eyebrows, neck and white tank top. Change hair only.`;

const interaction = await ai.interactions.create({
  model: 'gemini-3.1-flash-image',
  input: [
    { type: 'text', text: prompt },
    { type: 'image', data: reference, mime_type: 'image/png' },
  ],
  response_modalities: ['image'],
});

const image = interaction.output_image ?? interaction.outputs?.find((output) => output.type === 'image');
if (!image?.data) throw new Error('Gemini returned no image data');

const outputPath = resolve(root, 'src/assets/hair-style-sheet-gemini.png');
writeFileSync(outputPath, Buffer.from(image.data, 'base64'));
console.log('Saved src/assets/hair-style-sheet-gemini.png');
