import sharp from 'sharp';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'src/assets/hair-overlays-gemini-green.png');
const output = resolve(root, 'src/assets/hair-overlays-gemini.png');
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let index = 0; index < data.length; index += 4) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const greenDominance = green - Math.max(red, blue);

  if (green > 145 && greenDominance > 55) {
    data[index + 3] = greenDominance > 125 ? 0 : Math.max(0, 255 - (greenDominance - 55) * 3.65);
    data[index + 1] = Math.min(green, Math.round(Math.max(red, blue) * 1.08));
  }
}

await sharp(data, { raw: info }).png().toFile(output);
console.log('Saved src/assets/hair-overlays-gemini.png');
