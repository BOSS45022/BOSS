import sharp from 'sharp';
import { renameSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const assets = ['hair-overlays-refined.png', 'hair-overlays-side.png', 'hair-overlays-back.png'];

for (const asset of assets) {
  const input = resolve(root, `src/assets/${asset}`);
  const temporary = `${input}.clean.png`;
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const purpleDominance = Math.min(red, blue) - green;
    if (red > 18 && blue > 18 && purpleDominance > 10 && Math.abs(red - blue) < 65) {
      data[index + 3] = 0;
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
    }
  }
  await sharp(data, { raw: info }).png().toFile(temporary);
  renameSync(temporary, input);
  console.log(`Cleaned ${asset}`);
}
