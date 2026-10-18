"use client";

import { create } from "zustand";

/**
 * Quality tiers:
 *  high     — full forest scene, birds, dense particles, dpr ≤ 1.75
 *  standard — fewer instances & particles, dpr ≤ 1.25
 *  lite     — minimal scene (mobile / weak GPUs), dpr 1
 *  poster   — no WebGL at all, static posters (no WebGL / reduced motion)
 */
export type QualityTier = "high" | "standard" | "lite" | "poster";
export type QualityChoice = "auto" | Exclude<QualityTier, "poster">;

interface SettingsState {
  hydrated: boolean;
  qualityChoice: QualityChoice;
  detectedTier: QualityTier;
  /** Decorative motion (parallax, particles, camera drift). */
  motion: boolean;
  /** Ambient sound — never on before an explicit user action. */
  soundOn: boolean;
  volume: number;
  webglFailed: boolean;
  hydrate: (detected: QualityTier, motion: boolean, choice: QualityChoice) => void;
  setQuality: (q: QualityChoice) => void;
  setMotion: (m: boolean) => void;
  setSound: (on: boolean) => void;
  setVolume: (v: number) => void;
  markWebglFailed: () => void;
}

export const useSettings = create<SettingsState>((set) => ({
  hydrated: false,
  qualityChoice: "auto",
  detectedTier: "standard",
  motion: true,
  soundOn: false,
  volume: 0.5,
  webglFailed: false,
  hydrate: (detectedTier, motion, qualityChoice) =>
    set({ hydrated: true, detectedTier, motion, qualityChoice }),
  setQuality: (qualityChoice) => {
    try {
      localStorage.setItem("amz-quality", qualityChoice);
    } catch {}
    set({ qualityChoice });
  },
  setMotion: (motion) => {
    try {
      localStorage.setItem("amz-motion", motion ? "on" : "off");
    } catch {}
    document.documentElement.dataset.motion = motion ? "on" : "off";
    set({ motion });
  },
  setSound: (soundOn) => set({ soundOn }),
  setVolume: (volume) => set({ volume }),
  markWebglFailed: () => set({ webglFailed: true }),
}));

/** Effective tier after user choice, motion preference and WebGL support. */
export function useQualityTier(): QualityTier {
  return useSettings((s) => {
    if (!s.hydrated || s.webglFailed || !s.motion) return "poster";
    if (s.detectedTier === "poster") return "poster";
    return s.qualityChoice === "auto" ? s.detectedTier : s.qualityChoice;
  });
}

export function detectTier(): QualityTier {
  if (typeof window === "undefined") return "standard";
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return "poster";
  } catch {
    return "poster";
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 8;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(window.innerWidth, window.innerHeight) < 700;
  if (coarse || small || cores <= 4 || mem <= 4) return "lite";
  if (cores >= 8 && mem >= 8 && window.devicePixelRatio <= 2.5) return "high";
  return "standard";
}
