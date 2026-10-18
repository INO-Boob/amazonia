// Copies MapLibre's self-contained module worker into /public so the map
// works with any bundler (Turbopack cannot resolve its import.meta.url worker).
import fs from "node:fs";
fs.mkdirSync("public/vendor", { recursive: true });
fs.copyFileSync("node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs", "public/vendor/maplibre-gl-worker.mjs");
console.log("vendor: maplibre-gl-worker.mjs copied");
