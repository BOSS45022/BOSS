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
const frontOverlays = readFileSync(resolve(root, 'src/assets/hair-overlays-refined.png')).toString('base64');
const afroReference = readFileSync(resolve(root, 'src/assets/afro-hair.png')).toString('base64');

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
  const prompt = `Rotate the EXACT hairstyles from the supplied 4-by-3 FRONT OVERLAY SHEET into ${job.view} for the supplied bald fashion-game character.

The final canvas must be landscape, approximately 4:3. Output exactly 4 equal columns by 3 equal rows and exactly 12 cells total on perfectly uniform solid #ff00ff with no grid lines. Never add more rows. Use the character image only as the skull position, proportions and view reference. Each hairstyle must naturally wrap around that skull from this camera angle.

Draw detached hair pixels only. Absolutely no head/scalp oval, face, skin, ears, eyes, neck, shoulders, body, text, border, glow, shadow, green pixels or placeholder outline. Do not draw a mannequin under the hair. Empty space inside and around hair must be pure #ff00ff. Detailed natural dark-brown/black hair with clean edges.

STYLE CONSISTENCY IS THE MAIN REQUIREMENT:
- Each output cell must be the same haircut as the cell at the same coordinates in the supplied front overlay sheet.
- Preserve the exact length, volume, hairline, curl pattern and silhouette identity while changing only the camera angle.
- Buzz cut must remain visible around the full rear and side of the skull.
- French crop must keep its textured short top and fade.
- 360 waves must stay close to the skull in every view.
- Short curls and medium curls must keep clearly different lengths.
- Rounded afro must remain a large rounded afro in profile and rear view; never turn it into a small fade, flat top or short curls. Use the separate Afro image as an additional exact volume reference.
- Braids, twists and dreadlocks must preserve their exact strand structure and length.

Exact cell order:
Row 1: EMPTY Bald; Buzz cut; French crop; 360 waves.
Row 2: Short natural curls; Medium natural curls; Rounded afro; Short twists.
Row 3: Cornrows; Box braids; Short dreadlocks; Slick back.

Do not show any hairstyle from the front. Every cell must consistently use ${job.view}.`;
  const interaction = await ai.interactions.create({
    model: 'gemini-3.1-flash-image',
    input: [
      { type: 'text', text: prompt },
      { type: 'image', data: frontOverlays, mime_type: 'image/png' },
      { type: 'image', data: afroReference, mime_type: 'image/png' },
      { type: 'image', data: character, mime_type: 'image/png' },
    ],
    response_modalities: ['image'],
  });
  const image = interaction.output_image ?? interaction.outputs?.find((output) => output.type === 'image');
  if (!image?.data) throw new Error(`Gemini returned no ${job.view} image`);
  writeFileSync(resolve(root, `src/assets/${job.output}`), Buffer.from(image.data, 'base64'));
  console.log(`Saved src/assets/${job.output}`);
}
