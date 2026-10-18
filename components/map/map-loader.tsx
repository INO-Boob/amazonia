"use client";

import dynamic from "next/dynamic";

/** MapLibre touches `window` — load it on the client only, in its own chunk. */
export const MapLoader = dynamic(() => import("./amazon-map").then((m) => m.AmazonMap), {
  ssr: false,
  loading: () => <div className="t-mono grid h-[calc(100svh-var(--header-h))] place-items-center text-[var(--milk-40)]">Загружаем карту…</div>,
});
