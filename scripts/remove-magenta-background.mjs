import sharp from 'sharp';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'src/assets/hair-overlays-refined-magenta.png');
const output = resolve(root, 'src/assets/hair-overlays-refined.png');
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let index = 0; index < data.length; index += 4) {
  const red = data[index];
  const green = data[index + 1];
  const blue = data[index + 2];
  const dominance = Math.min(red, blue) - green;
  if (red > 70 && blue > 70 && dominance > 18) {
    data[index + 3] = dominance > 45 ? 0 : Math.round(data[index + 3] * (45 - dominance) / 27);
    data[index] = green;
    data[index + 2] = green;
  }
}

await sharp(data, { raw: info }).png().toFile(output);
console.log('Saved src/assets/hair-overlays-refined.png');
