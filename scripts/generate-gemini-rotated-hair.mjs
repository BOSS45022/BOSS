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
const styleReference = readFileSync(resolve(root, 'src/assets/hair-style-sheet-gemini.png')).toString('base64');

const jobs = [
  {
    view: 'strict side profile facing left, matching the supplied side character exactly',
    target: 'side-man-v2.png',
    output: 'hair-overlays-side-magenta.png',
  },
  {
    view: 'strict rear view, matching the supplied back character exactly',
    target: 'back-man.png',
    output: 'hair-overlays-back-magenta.png',
  },
];

const selectedJobs = process.argv.includes('--back') ? jobs.filter((job) => job.output.includes('back')) : jobs;

for (const job of selectedJobs) {
  const character = readFileSync(resolve(root, `src/assets/${job.target}`)).toString('base64');
  const prompt = `Create a WIDE LANDSCAPE HAIR-ONLY sprite sheet in ${job.view} for the supplied bald fashion-game character.

The final canvas must be landscape, approximately 4:3. Output exactly 4 equal columns by 3 equal rows and exactly 12 cells total on perfectly uniform solid #ff00ff with no grid lines. Never add more rows. Use the character image only as the skull position, proportions and view reference. Each hairstyle must naturally wrap around that skull from this camera angle.

Draw detached hair pixels only. Absolutely no head/scalp oval, face, skin, ears, eyes, neck, shoulders, body, text, border, glow, shadow, green pixels or placeholder outline. Do not draw a mannequin under the hair. Empty space inside and around hair must be pure #ff00ff. Detailed natural dark-brown/black hair with clean edges.

Exact order matching the reference styles:
Row 1: EMPTY Bald; Buzz cut; French crop; 360 waves.
Row 2: Short natural curls; Medium natural curls; Rounded afro; Short twists.
Row 3: Cornrows; Box braids; Short dreadlocks; Slick back.

Do not show any hairstyle from the front. Every cell must consistently use ${job.view}.`;
  const interaction = await ai.interactions.create({
    model: 'gemini-3.1-flash-image',
    input: [
      { type: 'text', text: prompt },
      { type: 'image', data: styleReference, mime_type: 'image/png' },
      { type: 'image', data: character, mime_type: 'image/png' },
    ],
    response_modalities: ['image'],
  });
  const image = interaction.output_image ?? interaction.outputs?.find((output) => output.type === 'image');
  if (!image?.data) throw new Error(`Gemini returned no ${job.view} image`);
  writeFileSync(resolve(root, `src/assets/${job.output}`), Buffer.from(image.data, 'base64'));
  console.log(`Saved src/assets/${job.output}`);
}
