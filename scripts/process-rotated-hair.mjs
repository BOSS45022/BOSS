import sharp from 'sharp';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const jobs = [
  { input: 'hair-overlays-side-magenta.png', output: 'hair-overlays-side.png', removeSkin: false },
  { input: 'hair-overlays-back-magenta.png', output: 'hair-overlays-back.png', removeSkin: true },
];

for (const job of jobs) {
  const { data, info } = await sharp(resolve(root, `src/assets/${job.input}`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const magentaDominance = Math.min(red, blue) - green;
    const isMagenta = red > 70 && blue > 70 && magentaDominance > 18;
    const isSkin = job.removeSkin && red > 68 && red > green * 1.38 && red > blue * 1.28;
    if (isMagenta || isSkin) {
      data[index + 3] = 0;
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
    }
  }
  await sharp(data, { raw: info }).png().toFile(resolve(root, `src/assets/${job.output}`));
  console.log(`Saved src/assets/${job.output}`);
}
