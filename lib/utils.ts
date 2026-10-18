import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Deterministic PRNG so 3D layouts are identical between renders. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function formatCoord(lat: number, lon: number) {
  const la = `${Math.abs(lat).toFixed(2)}°${lat < 0 ? "S" : "N"}`;
  const lo = `${Math.abs(lon).toFixed(2)}°${lon < 0 ? "W" : "E"}`;
  return `${la} ${lo}`;
}

/** Russian plural form: plural(21, "вид", "вида", "видов") → "вид". */
export function plural(n: number, one: string, few: string, many: string) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

/** Base path for static hosting under a sub-path (GitHub Pages: /<repo>). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a /public file path with the base path. */
export const asset = (path: string) => `${BASE_PATH}${path}`;
