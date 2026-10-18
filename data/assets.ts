/**
 * Non-photographic external assets. Photographs are listed in photos.json
 * (generated, one record per image with author, licence and observation URL).
 */
export interface AssetRecord {
  file: string;
  kind: "audio" | "model" | "texture" | "geo" | "vendor";
  title: string;
  author: string;
  license: string;
  licenseUrl?: string;
  source: string;
  purpose: string;
}

const ESC50 = "https://github.com/karolpiczak/ESC-50";
const fs = (id: string) => `https://freesound.org/s/${id}/`;

export const assets: AssetRecord[] = [
  { file: "/assets/audio/birds-daintree-1.mp3", kind: "audio", title: "Daintree Rainforrest Birds 1", author: "digifishmusic (Freesound)", license: "CC BY", licenseUrl: "https://creativecommons.org/licenses/by/3.0/", source: fs("38559"), purpose: "Дневной слой птиц (тропический лес Дейнтри, Австралия). Клип 5 с из ESC-50." },
  { file: "/assets/audio/birds-daintree-2.mp3", kind: "audio", title: "Daintree Rainforrest Birds 2", author: "digifishmusic (Freesound)", license: "CC BY", licenseUrl: "https://creativecommons.org/licenses/by/3.0/", source: fs("38560"), purpose: "Дневной слой птиц" },
  { file: "/assets/audio/insects-chorus.mp3", kind: "audio", title: "Crickets and Other Insects", author: "kslagerman (Freesound)", license: "CC0", source: fs("155766"), purpose: "Фон насекомых" },
  { file: "/assets/audio/crickets-orchestra.mp3", kind: "audio", title: "Crickets Orchestra", author: "Znalac (Freesound)", license: "CC0", source: fs("163697"), purpose: "Ночной фон сверчков" },
  { file: "/assets/audio/frog-tropical-garden.mp3", kind: "audio", title: "frog in the tropical garden", author: "E330 (Freesound)", license: "CC BY", licenseUrl: "https://creativecommons.org/licenses/by/3.0/", source: fs("102908"), purpose: "Ночные голоса лягушек" },
  { file: "/assets/audio/tree-frog-a.mp3", kind: "audio", title: "tree frog (A)", author: "reinsamba (Freesound)", license: "CC BY", licenseUrl: "https://creativecommons.org/licenses/by/3.0/", source: fs("15689"), purpose: "Ночные голоса лягушек" },
  { file: "/assets/audio/tree-frog-b.mp3", kind: "audio", title: "tree frog (B)", author: "reinsamba (Freesound)", license: "CC BY", licenseUrl: "https://creativecommons.org/licenses/by/3.0/", source: fs("15689"), purpose: "Ночные голоса лягушек" },
  { file: "/assets/audio/rain-in-woods.mp3", kind: "audio", title: "raininwoods", author: "klangfabrik (Freesound)", license: "CC0", source: fs("157149"), purpose: "Дождь в лесу" },
  { file: "/assets/audio/wind-forest.mp3", kind: "audio", title: "Wind in small Forrest_01", author: "TheSoundcatcher (Freesound)", license: "CC BY", licenseUrl: "https://creativecommons.org/licenses/by/3.0/", source: fs("136608"), purpose: "Шелест листвы" },
  { file: "/assets/audio/water-drips.mp3", kind: "audio", title: "water dripping 1", author: "hybu (Freesound)", license: "CC0", source: fs("139748"), purpose: "Капли воды" },
  { file: "/assets/models/Parrot.glb", kind: "model", title: "Parrot (animated)", author: "Mirada / RO.ME project, via three.js examples", license: "CC BY-NC-SA 3.0 (ROME content)", licenseUrl: "https://creativecommons.org/licenses/by-nc-sa/3.0/", source: "https://github.com/mrdoob/three.js/tree/dev/examples/models/gltf", purpose: "Далёкие силуэты птиц в 3D-сцене (только высокое качество). 97 КБ, морф-анимация." },
  { file: "/assets/textures/waternormals.jpg", kind: "texture", title: "Water normal map", author: "three.js examples", license: "MIT (three.js repository)", source: "https://github.com/mrdoob/three.js/blob/dev/examples/textures/waternormals.jpg", purpose: "Поверхность воды снизу в главе «Beneath the Surface»" },
  { file: "/assets/geo/*.geojson", kind: "geo", title: "Natural Earth 1:10m / 1:50m — regions, rivers, lakes, countries", author: "Natural Earth", license: "Public domain", source: "https://github.com/nvkelso/natural-earth-vector", purpose: "Геооснова карты; поймы — схематичные буферы (scripts/build-geo.mjs)" },
  { file: "/vendor/maplibre-gl-worker.mjs", kind: "vendor", title: "MapLibre GL JS worker", author: "MapLibre contributors", license: "BSD-3-Clause", source: "https://github.com/maplibre/maplibre-gl-js", purpose: "Веб-воркер карты, копируется из node_modules при сборке" },
];

export const ESC50_URL = ESC50;
