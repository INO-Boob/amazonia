import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  {
    // R3F scenes mutate three.js objects (uniforms, fog, buffers) imperatively
    // inside useFrame/effects — that is the intended pattern, not React state.
    files: ["components/three/**"],
    rules: { "react-hooks/immutability": "off" },
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "public/vendor/**",
    "scripts/geo-src/**",
  ]),
]);

export default eslintConfig;
