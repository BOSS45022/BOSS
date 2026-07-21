import sharp from 'sharp';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const input = resolve(root, 'src/assets/afro-hair-magenta.png');
const output = resolve(root, 'src/assets/afro-hair.png');
const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

// Remove the generated chroma background. The generous fringe threshold also
// clears the purple antialiasing halo around the hair.
const visible = new Uint8Array(width * height);
for (let pixel = 0; pixel < width * height; pixel += 1) {
  const offset = pixel * channels;
  const red = data[offset];
  const green = data[offset + 1];
  const blue = data[offset + 2];
  const chroma = red > 55 && blue > 55 && green < Math.max(red, blue) * 0.72;
  if (chroma) {
    data[offset + 3] = 0;
  } else if (data[offset + 3] > 24) {
    visible[pixel] = 1;
  }
}

// Gemini occasionally draws eyebrows as separate objects. Keep only the
// largest connected component, which is the Afro itself.
const visited = new Uint8Array(width * height);
let largest = [];
for (let start = 0; start < visible.length; start += 1) {
  if (!visible[start] || visited[start]) continue;
  const component = [];
  const queue = [start];
  visited[start] = 1;
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    const pixel = queue[cursor];
    component.push(pixel);
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    const neighbours = [
      x > 0 ? pixel - 1 : -1,
      x + 1 < width ? pixel + 1 : -1,
      y > 0 ? pixel - width : -1,
      y + 1 < height ? pixel + width : -1,
    ];
    for (const next of neighbours) {
      if (next >= 0 && visible[next] && !visited[next]) {
        visited[next] = 1;
        queue.push(next);
      }
    }
  }
  if (component.length > largest.length) largest = component;
}

const keep = new Uint8Array(width * height);
for (const pixel of largest) keep[pixel] = 1;
for (let pixel = 0; pixel < width * height; pixel += 1) {
  if (!keep[pixel]) data[pixel * channels + 3] = 0;
}

await sharp(data, { raw: info }).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toFile(output);
console.log('Saved src/assets/afro-hair.png');
