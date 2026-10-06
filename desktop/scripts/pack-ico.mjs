import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2];
if (!dir) throw new Error("usage: pack-ico.mjs <dir>");

const sizes = [16, 32, 48, 64, 128, 256];
const pngs = sizes.map((size) => {
  const buffer = readFileSync(join(dir, `icon-${size}.png`));
  return { size, buffer };
});

const count = pngs.length;
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(count, 4);

let offset = 6 + 16 * count;
const chunks = [header];
const bodies = [];
for (const png of pngs) {
  const entry = Buffer.alloc(16);
  const dim = png.size >= 256 ? 0 : png.size;
  entry.writeUInt8(dim, 0);
  entry.writeUInt8(dim, 1);
  entry.writeUInt32LE(0, 2);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.buffer.length, 8);
  entry.writeUInt32LE(offset, 12);
  offset += png.buffer.length;
  chunks.push(entry);
  bodies.push(png.buffer);
}

mkdirSync(dir, { recursive: true });
writeFileSync(join(dir, "icon.ico"), Buffer.concat([...chunks, ...bodies]));
