// Convert images to web-friendly WebP, matching the site's card-cover settings.
//
// Usage:
//   npm run optimize:images                 # convert every raster in public/images
//   npm run optimize:images -- path/to.png  # convert specific file(s)
//   npm run optimize:images -- some/dir      # convert every raster in a dir
//
// Flags:
//   --width=1000     max width in px (default 1000; never upscales)
//   --quality=80     WebP quality 1-100 (default 80)
//   --delete         remove the original after a successful conversion
//
// Skips: existing .webp, SVGs, and og-image.png (kept as PNG for social scrapers).

import sharp from 'sharp';
import { readdir, stat, unlink } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';

const RASTER = new Set(['.png', '.jpg', '.jpeg']);
const SKIP_NAMES = new Set(['og-image.png']);
const DEFAULT_DIR = 'public/images';

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.slice(2).split('=');
    return [k, v ?? true];
  }),
);
const inputs = args.filter((a) => !a.startsWith('--'));

const width = Number(flags.width ?? 1000);
const quality = Number(flags.quality ?? 80);
const del = Boolean(flags.delete);
const kb = (b) => (b / 1024).toFixed(0) + 'K';

/** Expand the given paths (files or dirs) into a flat list of raster files. */
async function collect(paths) {
  const out = [];
  for (const p of paths) {
    const s = await stat(p);
    if (s.isDirectory()) {
      for (const name of await readdir(p)) out.push(join(p, name));
    } else {
      out.push(p);
    }
  }
  return out.filter((f) => RASTER.has(extname(f).toLowerCase()) && !SKIP_NAMES.has(basename(f)));
}

const files = await collect(inputs.length ? inputs : [DEFAULT_DIR]);

if (!files.length) {
  console.log('No PNG/JPEG images to convert.');
  process.exit(0);
}

let before = 0;
let after = 0;
for (const inPath of files) {
  const outPath = inPath.replace(/\.(png|jpe?g)$/i, '.webp');
  const oldSize = (await stat(inPath)).size;
  await sharp(inPath).resize({ width, withoutEnlargement: true }).webp({ quality }).toFile(outPath);
  const newSize = (await stat(outPath)).size;
  if (del) await unlink(inPath);
  before += oldSize;
  after += newSize;
  const pct = (100 * (1 - newSize / oldSize)).toFixed(0);
  console.log(`${basename(inPath).padEnd(28)} ${kb(oldSize).padStart(7)} -> ${kb(newSize).padStart(7)}  (-${pct}%)`);
}

console.log('-'.repeat(60));
console.log(`TOTAL${' '.repeat(23)} ${kb(before).padStart(7)} -> ${kb(after).padStart(7)}  (-${(100 * (1 - after / before)).toFixed(0)}%)`);
if (!del) console.log('\nOriginals kept. Re-run with --delete to remove them, and update any cover: refs to .webp.');
