import sharp from 'sharp';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const jobs = [
  { id: 'buzz-side' },
  { id: 'buzz-back', crop: { left: 0, top: 0, width: 672, height: 245 }, removeSkin: true },
  { id: 'afro-side' },
  { id: 'afro-back' },
];

for (const job of jobs) {
  let pipeline = sharp(resolve(root, `src/assets/${job.id}-magenta.png`));
  if (job.crop) pipeline = pipeline.extract(job.crop);
  const { data, info } = await pipeline.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const chroma = red > 55 && blue > 55 && green < Math.max(red, blue) * .76;
    const skin = job.removeSkin && red > 65 && red > green * 1.25 && red > blue * 1.18;
    if (chroma || skin) {
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
      data[index + 3] = 0;
    }
  }

  await sharp(data, { raw: info })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(resolve(root, `src/assets/${job.id}.png`));
  console.log(`Saved src/assets/${job.id}.png`);
}
