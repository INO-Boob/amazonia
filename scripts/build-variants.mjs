/**
 * Pre-generates responsive JPEG variants (-640, -1080) next to every photo,
 * used by lib/image-loader.ts on static hosting (GitHub Pages) where the
 * Next.js image optimiser is not available. Run: node scripts/build-variants.mjs
 */
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const DIRS = ["public/assets/animals", "public/assets/environments", "public/assets/posters"];
const WIDTHS = [640, 1080];
let n = 0;
for (const dir of DIRS) {
  for (const f of fs.readdirSync(dir)) {
    if (!/\.jpg$/.test(f) || /-(640|1080)\.jpg$/.test(f)) continue;
    for (const w of WIDTHS) {
      const out = path.join(dir, f.replace(/\.jpg$/, `-${w}.jpg`));
      if (fs.existsSync(out)) continue;
      await sharp(path.join(dir, f)).resize({ width: w, withoutEnlargement: true }).jpeg({ quality: 76, progressive: true, mozjpeg: true }).toFile(out);
      n++;
    }
  }
}
console.log(`variants: ${n} created`);
