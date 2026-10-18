/**
 * Writes public/assets/manifest.json — source, author, licence and purpose
 * of every external asset. Photos come from data/photos.json; other assets
 * from data/assets.ts (parsed via a light regex to avoid a TS runtime).
 * Run: node scripts/build-manifest.mjs
 */
import fs from "node:fs";

const photos = JSON.parse(fs.readFileSync("data/photos.json", "utf8"));
const ts = fs.readFileSync("data/assets.ts", "utf8");
const other = [...ts.matchAll(/\{ file: "([^"]+)", kind: "([^"]+)", title: "([^"]+)", author: "([^"]+)", license: "([^"]+)"(?:, licenseUrl: "([^"]+)")?, source: (?:"([^"]+)"|fs\("(\d+)"\)), purpose: "([^"]+)" \}/g)].map(
  (m) => ({ file: m[1], kind: m[2], title: m[3], author: m[4], license: m[5], licenseUrl: m[6] ?? null, source: m[7] ?? `https://freesound.org/s/${m[8]}/`, purpose: m[9] }),
);

const manifest = {
  generated: new Date().toISOString().slice(0, 10),
  note: "All files are stored locally under /public. Photos: iNaturalist Open Data (CC licences, no ND).",
  photos: Object.entries(photos).map(([key, p]) => ({
    file: p.src,
    kind: "photo",
    taxon: p.taxon,
    author: p.author,
    license: p.license,
    licenseUrl: p.licenseUrl,
    source: p.photoUrl,
    observation: p.observationUrl,
    location: { lat: p.lat, lon: p.lon, region: p.region },
    observedOn: p.observedOn,
    key,
  })),
  other,
};
fs.writeFileSync("public/assets/manifest.json", JSON.stringify(manifest, null, 1));
console.log(`manifest: ${manifest.photos.length} photos, ${other.length} other assets`);
