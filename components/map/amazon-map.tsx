"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { ExpressionSpecification, Map as MLMap } from "maplibre-gl";
import { AnimatePresence, motion } from "motion/react";
import { places, zones, type MapZone } from "@/data/zones";
import { animals, type ZoneId } from "@/data/animals";
import { photo } from "@/data/photos";
import { useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

const GEO = "/assets/geo";
maplibregl.setWorkerUrl("/vendor/maplibre-gl-worker.mjs");
const RIVER_COLOR: ExpressionSpecification = ["match", ["get", "water"], "white", "#d9c79c", "black", "#b9763f", "clear", "#5ea89d", "#4f6b5c"];
const ZONE_COLOR: ExpressionSpecification = ["match", ["get", "kind"], "white", "#cfb57c", "black", "#a8653a", "clear", "#5ea89d", "#888"];
const REGION_COLOR: ExpressionSpecification = [
  "match",
  ["get", "id"],
  "basin", "#4d6b45",
  "guiana", "#9a7f4a",
  "guiana-highlands", "#b39258",
  "andes", "#7a5a3c",
  "delta", "#5ea89d",
  "#3b4a3a",
];

const RIVER_LABELS = [
  { name: "Амазонка", lon: -56.8, lat: -2.1 },
  { name: "Солимойнс", lon: -66.5, lat: -3.3 },
  { name: "Риу-Негру", lon: -62.6, lat: -1.6 },
  { name: "Мадейра", lon: -60.6, lat: -6.4 },
  { name: "Тапажос", lon: -56.2, lat: -5.4 },
  { name: "Шингу", lon: -52.6, lat: -5.0 },
  { name: "Укаяли", lon: -74.4, lat: -8.4 },
  { name: "Пурус", lon: -66.9, lat: -7.6 },
];

function zoneFilter(z: MapZone | null): maplibregl.FilterSpecification {
  if (!z) return ["==", "id", "__none__"];
  return z.layer.filter as maplibregl.FilterSpecification;
}

export function AmazonMap() {
  const box = useRef<HTMLDivElement>(null);
  const map = useRef<MLMap | null>(null);
  // client-only component (loaded with ssr: false), so the URL can seed state directly
  const [selected, setSelected] = useState<ZoneId>(() => {
    const z = new URLSearchParams(window.location.search).get("zone");
    return zones.some((x) => x.id === z) ? (z as ZoneId) : "terra-firme";
  });
  const [loaded, setLoaded] = useState(false);
  const [layers, setLayers] = useState({ zones: true, rivers: true, regions: true });
  const motionOn = useSettings((s) => s.motion);
  const zone = zones.find((z) => z.id === selected)!;
  const species = useMemo(() => animals.filter((a) => a.zones.includes(selected)), [selected]);

  useEffect(() => {
    if (!box.current) return;
    const m = new maplibregl.Map({
      container: box.current,
      style: {
        version: 8,
        sources: {},
        layers: [{ id: "bg", type: "background", paint: { "background-color": "#081410" } }],
      },
      center: [-62, -5],
      zoom: 3.6,
      minZoom: 2.6,
      maxZoom: 9,
      maxBounds: [[-100, -40], [-25, 20]],
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      cooperativeGestures: false,
    });
    map.current = m;
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.addControl(new maplibregl.AttributionControl({ compact: true, customAttribution: "Natural Earth (public domain) · схема зон: AMAZONIA" }), "bottom-right");
    m.touchZoomRotate.disableRotation();

    m.on("load", () => {
      for (const s of ["countries", "regions", "zones", "rivers", "lakes"]) {
        m.addSource(s, { type: "geojson", data: `${GEO}/${s}.geojson` });
      }
      m.addLayer({ id: "land", type: "fill", source: "countries", paint: { "fill-color": "#0f2219" } });
      m.addLayer({ id: "borders", type: "line", source: "countries", paint: { "line-color": "rgba(239,232,216,0.16)", "line-width": 0.7, "line-dasharray": [2, 2] } });
      m.addLayer({ id: "regions", type: "fill", source: "regions", paint: { "fill-color": REGION_COLOR, "fill-opacity": 0.22 } });
      m.addLayer({ id: "regions-line", type: "line", source: "regions", paint: { "line-color": REGION_COLOR, "line-width": 1, "line-opacity": 0.6 } });
      m.addLayer({ id: "zones", type: "fill", source: "zones", paint: { "fill-color": ZONE_COLOR, "fill-opacity": 0.16 } });
      m.addLayer({ id: "lakes", type: "fill", source: "lakes", paint: { "fill-color": "#1f4a46" } });
      m.addLayer({
        id: "rivers",
        type: "line",
        source: "rivers",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": RIVER_COLOR,
          "line-width": ["interpolate", ["linear"], ["zoom"], 3, ["-", 3.2, ["*", ["get", "rank"], 0.3]], 7, ["-", 7, ["*", ["get", "rank"], 0.6]]],
          "line-opacity": 0.9,
        },
      });
      m.addLayer({ id: "rivers-hit", type: "line", source: "rivers", paint: { "line-color": "#000", "line-width": 10, "line-opacity": 0 } });
      // highlight of the selected zone (fill + glow outline)
      m.addLayer({ id: "sel-regions", type: "fill", source: "regions", paint: { "fill-color": "#e3c58b", "fill-opacity": 0.22 }, filter: ["==", "id", "__none__"] });
      m.addLayer({ id: "sel-regions-line", type: "line", source: "regions", paint: { "line-color": "#e3c58b", "line-width": 2 }, filter: ["==", "id", "__none__"] });
      m.addLayer({ id: "sel-zones", type: "fill", source: "zones", paint: { "fill-color": "#e3c58b", "fill-opacity": 0.26 }, filter: ["==", "kind", "__none__"] });

      const pop = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 8 });
      m.on("mousemove", "rivers-hit", (e) => {
        const f = e.features?.[0];
        if (!f) return;
        m.getCanvas().style.cursor = "pointer";
        const water = { white: "белая вода", black: "чёрная вода", clear: "чистая вода" }[f.properties.water as string] ?? "";
        pop.setLngLat(e.lngLat).setHTML(`<strong>${f.properties.name_ru || "Река"}</strong>${water ? `<br/><span style="opacity:.6;font-size:12px">${water}</span>` : ""}`).addTo(m);
      });
      m.on("mouseleave", "rivers-hit", () => {
        m.getCanvas().style.cursor = "";
        pop.remove();
      });

      places.forEach((p) => {
        const el = document.createElement("div");
        el.className = "map-place";
        el.innerHTML = `<span class="map-dot"></span><span class="map-label">${p.name}</span>`;
        el.title = p.note;
        new maplibregl.Marker({ element: el, anchor: "left" }).setLngLat([p.lon, p.lat]).addTo(m);
      });
      RIVER_LABELS.forEach((r) => {
        const el = document.createElement("div");
        el.className = "map-river";
        el.textContent = r.name;
        new maplibregl.Marker({ element: el }).setLngLat([r.lon, r.lat]).addTo(m);
      });
      setLoaded(true);
    });

    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  // apply selection
  useEffect(() => {
    const m = map.current;
    if (!m || !loaded) return;
    const isRegion = zone.layer.source === "regions";
    m.setFilter("sel-regions", isRegion ? zoneFilter(zone) : ["==", "id", "__none__"]);
    m.setFilter("sel-regions-line", isRegion ? zoneFilter(zone) : ["==", "id", "__none__"]);
    m.setFilter("sel-zones", !isRegion ? zoneFilter(zone) : ["==", "kind", "__none__"]);
    m.fitBounds(zone.bounds, { padding: 40, duration: motionOn ? 1600 : 0, essential: true });
    const url = new URL(window.location.href);
    url.searchParams.set("zone", zone.id);
    window.history.replaceState(null, "", url);
  }, [zone, loaded, motionOn]);

  useEffect(() => {
    const m = map.current;
    if (!m || !loaded) return;
    const vis = (on: boolean) => (on ? "visible" : "none");
    m.setLayoutProperty("zones", "visibility", vis(layers.zones));
    m.setLayoutProperty("rivers", "visibility", vis(layers.rivers));
    m.setLayoutProperty("regions", "visibility", vis(layers.regions));
    m.setLayoutProperty("regions-line", "visibility", vis(layers.regions));
  }, [layers, loaded]);

  return (
    <div className="grid lg:h-[calc(100svh-var(--header-h))] lg:grid-cols-12">
      <div className="relative h-[62svh] lg:col-span-8 lg:h-full">
        <div className="absolute inset-0">
          <div ref={box} className="h-full w-full" role="region" aria-label="Интерактивная карта бассейна Амазонки" />
        </div>
        {!loaded && <div className="t-mono absolute inset-0 grid place-items-center text-[var(--milk-40)]">Загружаем геоданные…</div>}
        <div className="absolute bottom-3 left-3 flex flex-col gap-2 bg-[rgb(7_18_12/0.85)] p-3 backdrop-blur-sm">
          <p className="t-mono text-[var(--milk-40)]">Слои</p>
          {(
            [
              ["regions", "Физико-географические регионы"],
              ["zones", "Поймы (схема)"],
              ["rivers", "Реки по цвету воды"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="t-small flex cursor-pointer items-center gap-2 text-[var(--milk-80)]">
              <input type="checkbox" checked={layers[k]} onChange={(e) => setLayers((l) => ({ ...l, [k]: e.target.checked }))} className="accent-[var(--gold-400)]" />
              {label}
            </label>
          ))}
          <div className="mt-1 flex flex-wrap gap-3">
            {[
              ["#d9c79c", "белая"],
              ["#b9763f", "чёрная"],
              ["#5ea89d", "чистая"],
            ].map(([c, l]) => (
              <span key={l} className="t-mono flex items-center gap-1.5 text-[var(--milk-60)]">
                <span className="h-0.5 w-4" style={{ background: c }} />
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>

      <aside className="border-l border-[var(--milk-08)] bg-forest-950 lg:col-span-4 lg:overflow-y-auto" data-lenis-prevent>
        <div className="gutter py-8 lg:px-8">
          <p className="t-mono text-gold-300">III — Map</p>
          <h1 className="t-h1 mt-3">Карта Амазонии</h1>
          <p className="t-small mt-3">Выберите среду обитания — карта приблизится к ней, а ниже появятся связанные виды.</p>

          <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label="Среды обитания">
            {zones.map((z) => (
              <button
                key={z.id}
                type="button"
                role="tab"
                aria-selected={z.id === selected}
                onClick={() => setSelected(z.id)}
                className={cn(
                  "t-small border px-3 py-1.5 transition-colors",
                  z.id === selected ? "border-gold-300 bg-gold-300 text-forest-950" : "border-[var(--milk-15)] text-[var(--milk-80)] hover:border-[var(--milk-40)]",
                )}
              >
                {z.name}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={zone.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} role="tabpanel">
              <h2 className="t-h2 mt-10">{zone.name}</h2>
              <p className="t-label mt-2 text-[var(--milk-60)]">{zone.short}</p>
              <p className="t-body mt-5">{zone.description}</p>
              <p className="t-mono mt-5 border-l border-gold-400 pl-3 text-[var(--milk-40)]">{zone.accuracy}</p>

              <h3 className="t-label mt-10 text-gold-300">Виды из каталога · {species.length}</h3>
              <ul className="mt-4 divide-y divide-[var(--milk-08)] border-y border-[var(--milk-08)]">
                {species.map((a) => {
                  const p = photo(a.photo);
                  return (
                    <li key={a.slug}>
                      <Link href={`/animals/${a.slug}`} className="group flex items-center gap-4 py-3">
                        <span className="relative h-14 w-14 shrink-0 overflow-hidden">
                          <Image src={p.src} alt="" fill sizes="56px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                        </span>
                        <span>
                          <span className="block text-milk transition-colors group-hover:text-gold-300">{a.nameRu}</span>
                          <span className="t-latin text-sm text-[var(--milk-60)]">{a.scientific}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </AnimatePresence>

          <h3 className="t-label mt-12 text-[var(--milk-40)]">Отмеченные места</h3>
          <ul className="mt-3 space-y-2">
            {places.map((p) => (
              <li key={p.name}>
                <button
                  type="button"
                  className="t-small text-left hover:text-milk"
                  onClick={() => map.current?.flyTo({ center: [p.lon, p.lat], zoom: 6.5, duration: motionOn ? 1600 : 0 })}
                >
                  <span className="text-milk">{p.name}</span> — {p.note}
                </button>
              </li>
            ))}
          </ul>
          <p className="t-mono mt-4 text-[var(--milk-40)]">Координаты мест приблизительные.</p>
        </div>
      </aside>
    </div>
  );
}
