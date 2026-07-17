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

const character = readFileSync(resolve(root, 'src/assets/front-man.png')).toString('base64');
const styleSheet = readFileSync(resolve(root, 'src/assets/hair-style-sheet-gemini.png')).toString('base64');
const ai = new GoogleGenAI({ apiKey });

const prompt = `Create a production sprite sheet of HAIR ONLY for the supplied fashion-game character.

Use the first image for the exact skull size, front-facing position and illustration style. Use the second image as the exact hairstyle reference and exact ordering. Output exactly the same 5-column by 4-row grid geometry as the second image.

IMPORTANT: every occupied cell must contain ONLY the hairstyle as a standalone floating hair overlay. Do not draw any head, forehead, face, eyes, eyebrows, ears, neck, skin, shoulders, shirt, body, labels, borders, shadows or text. The hair must retain the empty inner shape where the skull/face will appear underneath. Keep each hairstyle at the same size and placement it had on the character in the reference sheet so it can be composited over the original bald head.

Ordering left-to-right, top-to-bottom:
Row 1: EMPTY for bald, buzz cut, crew cut, French crop, Caesar cut.
Row 2: low fade, mid fade, high fade, taper fade, 360 waves.
Row 3: short natural curls, medium natural curls, rounded afro, short twists, cornrows.
Row 4: box braids, short dreadlocks, slick back, side part, final cell EMPTY.

Use detailed natural black/dark-brown strands and clean barber-quality edges. Background must be perfectly flat uniform #00ff00 in every cell, including through the empty face/skull areas. No grid lines or cell borders. No #00ff00 in the hair.`;

const interaction = await ai.interactions.create({
  model: 'gemini-3.1-flash-image',
  input: [
    { type: 'text', text: prompt },
    { type: 'image', data: character, mime_type: 'image/png' },
    { type: 'image', data: styleSheet, mime_type: 'image/png' },
  ],
  response_modalities: ['image'],
});

const image = interaction.output_image ?? interaction.outputs?.find((output) => output.type === 'image');
if (!image?.data) throw new Error('Gemini returned no image data');

writeFileSync(resolve(root, 'src/assets/hair-overlays-gemini-green.png'), Buffer.from(image.data, 'base64'));
console.log('Saved src/assets/hair-overlays-gemini-green.png');
