import type { NextConfig } from "next";

/**
 * GITHUB_PAGES=1 → fully static export for GitHub Pages:
 * pre-generated image variants instead of the optimiser, optional sub-path (/<repo>),
 * folder-style URLs (animals/index.html) that static hosts resolve.
 */
const pages = process.env.GITHUB_PAGES === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(pages && { output: "export", trailingSlash: true, basePath: basePath || undefined }),
  images: {
    ...(pages && { loader: "custom" as const, loaderFile: "./lib/image-loader.ts" }),
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75, 85],
    deviceSizes: [480, 768, 1080, 1440, 1920, 2400],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
