"use client";

/**
 * Code-split entry points for every WebGL scene: three.js and R3F are never
 * part of the initial bundle and never rendered on the server.
 */
import dynamic from "next/dynamic";

export const LazyForest = dynamic(() => import("./forest/forest-canvas").then((m) => m.ForestCanvas), {
  ssr: false,
  loading: () => null,
});

export const LazyRiver = dynamic(() => import("./river/river-canvas").then((m) => m.RiverCanvas), {
  ssr: false,
  loading: () => null,
});

export const LazyFireflies = dynamic(() => import("./night/fireflies-canvas").then((m) => m.FirefliesCanvas), {
  ssr: false,
  loading: () => null,
});
