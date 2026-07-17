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
const reference = readFileSync(resolve(root, 'src/assets/hair-style-sheet-gemini.png')).toString('base64');
const ai = new GoogleGenAI({ apiKey });

const prompt = `Generate a production-ready HAIR-ONLY sprite sheet for the supplied bald fashion-game character.

Create exactly 4 equal columns by 3 equal rows on a perfectly uniform solid #ff00ff chroma background with no grid lines. Every occupied cell must contain one isolated floating hairstyle viewed perfectly from the front and sized to fit the exact supplied skull.

CRITICAL MASK RULES:
- Draw hair pixels only.
- Absolutely no head silhouette, oval outline, scalp outline, forehead line outside the natural hairline, face, skin, ears, eyebrows, eyes, neck, shoulders, shirt or body.
- Do not draw a placeholder head under or inside the hair.
- The inside opening beneath each hairstyle must be pure #ff00ff.
- No green pixels, glow, colored outline, border, shadow, text or watermark.
- Natural clean edges and detailed dark-brown/black strands.

Exact order:
Row 1: EMPTY cell for Bald; Buzz cut; French crop with fringe stopping well above eyebrows; 360 waves.
Row 2: Short natural curls; Medium natural curls; Rounded afro; Short twists.
Row 3: Cornrows; Box braids; Short dreadlocks; Slick back.

Use the second supplied image only as hairstyle inspiration. Correct its defects: remove every oval head outline and keep all fringes above the eyebrows.`;

const interaction = await ai.interactions.create({
  model: 'gemini-3.1-flash-image',
  input: [
    { type: 'text', text: prompt },
    { type: 'image', data: character, mime_type: 'image/png' },
    { type: 'image', data: reference, mime_type: 'image/png' },
  ],
  response_modalities: ['image'],
});

const image = interaction.output_image ?? interaction.outputs?.find((output) => output.type === 'image');
if (!image?.data) throw new Error('Gemini returned no image');
writeFileSync(resolve(root, 'src/assets/hair-overlays-refined-magenta.png'), Buffer.from(image.data, 'base64'));
console.log('Saved src/assets/hair-overlays-refined-magenta.png');
