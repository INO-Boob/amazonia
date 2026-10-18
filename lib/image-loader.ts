/**
 * next/image loader for static hosting: maps the requested width to the
 * closest pre-generated variant (see scripts/build-variants.mjs).
 */
export default function imageLoader({ src, width }: { src: string; width: number; quality?: number }) {
  if (!/\/assets\/(animals|environments|posters)\/[^/]+\.jpg$/.test(src)) return src;
  if (width <= 640) return src.replace(/\.jpg$/, "-640.jpg");
  if (width <= 1080) return src.replace(/\.jpg$/, "-1080.jpg");
  return src;
}
