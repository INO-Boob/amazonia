import raw from "./photos.json";
import { asset } from "@/lib/utils";

/**
 * Every photograph on the site is a real, CC-licensed observation from
 * iNaturalist (open-data bucket), downloaded and stored locally.
 * Coordinates are rounded to 0.1° (≈11 km) on purpose.
 */
export interface Photo {
  src: string;
  width: number;
  height: number;
  blur: string;
  taxon: string;
  author: string;
  authorLogin: string;
  license: string;
  licenseUrl: string;
  photoUrl: string;
  observationUrl: string;
  lat: number;
  lon: number;
  observedOn: string;
  region: string;
}

export const photos = Object.fromEntries(
  Object.entries(raw).map(([k, p]) => [k, { ...p, src: asset(p.src) }]),
) as Record<string, Photo>;
export type PhotoKey = keyof typeof raw;

export function photo(key: PhotoKey): Photo {
  return photos[key];
}

export function credit(p: Photo) {
  return `© ${p.author} · ${p.license} · iNaturalist`;
}
