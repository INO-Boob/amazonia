/**
 * Builds the compact GeoJSON layers used by the /map page from Natural Earth
 * (public domain). Run:  node scripts/build-geo.mjs
 *
 * Sources are cached in scripts/geo-src/ (git-ignored); missing files are
 * downloaded from the nvkelso/natural-earth-vector repository on GitHub.
 *
 * Floodplain zones (várzea / igapó / clear water) are *schematic* buffers
 * around the main rivers, labelled as such in the UI — they are not survey
 * maps of flooded forest.
 */
import fs from "node:fs";
import path from "node:path";
import buffer from "@turf/buffer";
import simplify from "@turf/simplify";
import bboxClip from "@turf/bbox-clip";
import { featureCollection } from "@turf/helpers";

const SRC = path.resolve("scripts/geo-src");
const OUT = path.resolve("public/assets/geo");
const BASE = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson";
const BBOX = [-82, -22, -43, 12];

async function load(name) {
  const file = path.join(SRC, `${name}.geojson`);
  if (!fs.existsSync(file)) {
    fs.mkdirSync(SRC, { recursive: true });
    const res = await fetch(`${BASE}/${name}.geojson`);
    if (!res.ok) throw new Error(`Download failed: ${name} ${res.status}`);
    fs.writeFileSync(file, await res.text());
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const round = (geom, d = 3) => {
  const f = 10 ** d;
  const r = (c) => (typeof c[0] === "number" ? [Math.round(c[0] * f) / f, Math.round(c[1] * f) / f] : c.map(r));
  return { ...geom, coordinates: r(geom.coordinates) };
};

function inBox(geom) {
  const pts = [];
  const walk = (c) => (typeof c[0] === "number" ? pts.push(c) : c.forEach(walk));
  walk(geom.coordinates);
  return pts.some(([x, y]) => x > BBOX[0] && x < BBOX[2] && y > BBOX[1] && y < BBOX[3]);
}

function write(name, fc) {
  const json = JSON.stringify(fc);
  fs.writeFileSync(path.join(OUT, `${name}.geojson`), json);
  console.log(name, fc.features.length, `${(json.length / 1024).toFixed(0)} KB`);
}

// Water colour classes of the main rivers (Sioli's classification).
const WATER = {
  Amazonas: "white", Ucayali: "white", "Marañón": "white", Madeira: "white", "Purús": "white",
  "Juruá": "white", "Japurá": "white", "Caquetá": "white", Putumayo: "white", Napo: "white",
  "Mamoré": "white", Beni: "white", "Madre de Dios": "white", Huallaga: "white", Javari: "white",
  Negro: "black", "Uaupés": "black", Unini: "black", Casiquiare: "black", "Guainía": "black",
  "Tapajós": "clear", Xingu: "clear", Juruena: "clear", "Teles Pires": "clear", Iriri: "clear",
  Trombetas: "clear", Tocantins: "clear", Araguaia: "clear", Branco: "white", Jari: "clear",
};

const RU = {
  Amazonas: "Амазонка", Ucayali: "Укаяли", "Marañón": "Мараньон", Madeira: "Мадейра", "Purús": "Пурус",
  "Juruá": "Журуа", "Japurá": "Жапура", "Caquetá": "Какета", Putumayo: "Путумайо", Napo: "Напо",
  "Mamoré": "Маморе", Beni: "Бени", "Madre de Dios": "Мадре-де-Дьос", Huallaga: "Уальяга",
  Negro: "Риу-Негру", "Tapajós": "Тапажос", Xingu: "Шингу", Tocantins: "Токантинс", Araguaia: "Арагуая",
  Trombetas: "Тромбетас", Branco: "Риу-Бранку", Guaporé: "Гуапоре", Orinoco: "Ориноко", Juruena: "Журуэна",
  Iriri: "Ирири", Javari: "Жавари", Jari: "Жари", "Teles Pires": "Телис-Пирис", "Uaupés": "Ваупес",
};

const regionsSrc = await load("ne_10m_geography_regions_polys");
const riversSrc = await load("ne_10m_rivers_lake_centerlines");
const countriesSrc = await load("ne_50m_admin_0_countries");
const lakesSrc = await load("ne_10m_lakes");

fs.mkdirSync(OUT, { recursive: true });

// Countries (context only)
const countries = featureCollection(
  countriesSrc.features
    .filter((f) => f.properties.CONTINENT === "South America" || ["Panama", "France"].includes(f.properties.ADMIN))
    .map((f) => {
      const isFr = f.properties.ADMIN === "France";
      const s = simplify(isFr ? bboxClip(f, [-55, 1.5, -51, 6.5]) : f, { tolerance: 0.03, highQuality: false });
      const name = isFr ? "Французская Гвиана" : f.properties.NAME_RU || f.properties.NAME;
      return { type: "Feature", properties: { name, iso: isFr ? "GUF" : f.properties.ISO_A3 }, geometry: round(s.geometry, 3) };
    }),
);
write("countries", countries);

// Rivers in the region
const rivers = featureCollection(
  riversSrc.features
    .filter((f) => f.geometry && f.properties.featurecla?.startsWith("River") && inBox(f.geometry) && f.properties.scalerank <= 9)
    .map((f) => {
      const n = f.properties.name;
      return {
        type: "Feature",
        properties: { name: n, name_ru: RU[n] ?? n ?? "", rank: f.properties.scalerank, water: WATER[n] ?? "other" },
        geometry: round(simplify(f, { tolerance: 0.01 }).geometry, 3),
      };
    }),
);
write("rivers", rivers);

const lakes = featureCollection(
  lakesSrc.features.filter((f) => f.geometry && inBox(f.geometry)).map((f) => ({ type: "Feature", properties: { name: f.properties.name }, geometry: round(simplify(f, { tolerance: 0.01 }).geometry, 3) })),
);
write("lakes", lakes);

// Physical regions from Natural Earth
const WANT = {
  "AMAZON BASIN": { id: "basin", ru: "Амазонская низменность" },
  "GUIANA SHIELD": { id: "guiana", ru: "Гвианский щит" },
  "GUIANA HIGHLANDS": { id: "guiana-highlands", ru: "Гвианское нагорье" },
  ANDES: { id: "andes", ru: "Анды" },
  "Amazon Delta": { id: "delta", ru: "Дельта Амазонки" },
  PANTANAL: { id: "pantanal", ru: "Пантанал" },
  "PLANALTO DO MATO GROSSO": { id: "mato-grosso", ru: "Плато Мату-Гросу" },
  LLANOS: { id: "llanos", ru: "Льянос" },
};
const regions = featureCollection(
  regionsSrc.features
    .filter((f) => WANT[f.properties.NAME])
    .map((f) => {
      const w = WANT[f.properties.NAME];
      let g = f;
      if (w.id === "andes") g = bboxClip(f, [-81, -20, -60, 11]);
      g = simplify(g, { tolerance: 0.02 });
      return { type: "Feature", properties: { id: w.id, name: w.ru, source: f.properties.NAME }, geometry: round(g.geometry, 3) };
    }),
);
write("regions", regions);

// Schematic floodplain zones — buffers around main rivers by water type.
function zone(kind, km, label) {
  const lines = rivers.features.filter((f) => f.properties.water === kind && f.properties.rank <= 7);
  const polys = lines.map((l) => {
    const b = buffer(l, km, { units: "kilometers", steps: 4 });
    return { type: "Feature", properties: { kind, label, river: l.properties.name_ru }, geometry: round(simplify(b, { tolerance: 0.02 }).geometry, 3) };
  });
  return polys;
}
const zones = featureCollection([
  ...zone("white", 28, "Варзеа — пойменные леса белых вод"),
  ...zone("black", 22, "Игапо — затопляемые леса чёрных вод"),
  ...zone("clear", 14, "Реки чистых вод"),
]);
write("zones", zones);
