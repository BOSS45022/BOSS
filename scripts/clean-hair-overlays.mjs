import sharp from 'sharp';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'src/assets/hair-overlays-gemini.png');
const output = resolve(root, 'src/assets/hair-overlays-gemini-clean.png');
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let index = 0; index < data.length; index += 4) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const dominance = green - Math.max(red, blue);
  if (green > 45 && dominance > 12) {
    data[index + 3] = dominance > 28 ? 0 : Math.round(data[index + 3] * (28 - dominance) / 16);
    data[index + 1] = Math.min(green, Math.max(red, blue));
  }
}

await sharp(data, { raw: info }).png().toFile(output);
console.log('Saved src/assets/hair-overlays-gemini-clean.png');
