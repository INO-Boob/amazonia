"use client";

import { useEffect, useRef } from "react";
import { create } from "zustand";
import { useSettings } from "@/lib/settings";

export type SoundScene = "day" | "water" | "night";

export const useSoundScene = create<{ scene: SoundScene; setScene: (s: SoundScene) => void }>((set) => ({
  scene: "day",
  setScene: (scene) => set({ scene }),
}));

/**
 * Field recordings (CC0 / CC BY, via the ESC-50 dataset — see /sources).
 * Short clips are layered generatively: "beds" loop with crossfades,
 * "scatter" layers fire one-shots at random intervals and positions,
 * so the soundscape never audibly repeats.
 */
type LayerDef = { id: string; files: string[]; mode: "bed" | "scatter"; every?: [number, number] };

const LAYERS: LayerDef[] = [
  { id: "birds", files: ["birds-daintree-1", "birds-daintree-2"], mode: "scatter", every: [2.5, 7] },
  { id: "wind", files: ["wind-forest"], mode: "bed" },
  { id: "insects", files: ["insects-chorus"], mode: "bed" },
  { id: "crickets", files: ["crickets-orchestra"], mode: "bed" },
  { id: "rain", files: ["rain-in-woods"], mode: "bed" },
  { id: "drips", files: ["water-drips"], mode: "scatter", every: [3, 9] },
  { id: "frogs", files: ["frog-tropical-garden", "tree-frog-a", "tree-frog-b"], mode: "scatter", every: [2, 6] },
];

const MIX: Record<SoundScene, Record<string, number>> = {
  day: { birds: 0.9, wind: 0.32, insects: 0.22, crickets: 0, rain: 0, drips: 0.25, frogs: 0.08 },
  water: { birds: 0.25, wind: 0.15, insects: 0.15, crickets: 0, rain: 0.3, drips: 0.65, frogs: 0.35 },
  night: { birds: 0, wind: 0.1, insects: 0.35, crickets: 0.55, rain: 0.12, drips: 0.2, frogs: 0.85 },
};

export function SoundEngine() {
  const soundOn = useSettings((s) => s.soundOn);
  const volume = useSettings((s) => s.volume);
  const scene = useSoundScene((s) => s.scene);

  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const layerGains = useRef<Record<string, GainNode>>({});
  const buffers = useRef<Record<string, AudioBuffer[]>>({});
  const timers = useRef<number[]>([]);
  const started = useRef(false);

  // Build the graph lazily on the first explicit "sound on".
  useEffect(() => {
    if (!soundOn) return;
    let cancelled = false;

    async function start() {
      if (!ctxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new Ctx();
        const master = ctx.createGain();
        master.gain.value = 0;
        const comp = ctx.createDynamicsCompressor();
        master.connect(comp).connect(ctx.destination);
        ctxRef.current = ctx;
        masterRef.current = master;
        for (const l of LAYERS) {
          const g = ctx.createGain();
          g.gain.value = 0;
          g.connect(master);
          layerGains.current[l.id] = g;
        }
      }
      const ctx = ctxRef.current!;
      await ctx.resume();
      if (!started.current) {
        started.current = true;
        await Promise.all(
          LAYERS.map(async (l) => {
            buffers.current[l.id] = await Promise.all(
              l.files.map(async (f) => {
                const res = await fetch(`/assets/audio/${f}.mp3`);
                return ctx.decodeAudioData(await res.arrayBuffer());
              }),
            );
          }),
        );
        if (cancelled) return;
        LAYERS.forEach((l) => (l.mode === "bed" ? runBed(l) : runScatter(l)));
      }
    }

    function runBed(l: LayerDef) {
      const ctx = ctxRef.current!;
      const buf = buffers.current[l.id][0];
      const fade = 1.2;
      const play = (when: number): void => {
        if (ctx.state !== "running") {
          timers.current.push(window.setTimeout(() => play(ctx.currentTime + 0.05), 800));
          return;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.playbackRate.value = 0.96 + Math.random() * 0.08;
        const g = ctx.createGain();
        const dur = buf.duration / src.playbackRate.value;
        g.gain.setValueAtTime(0, when);
        g.gain.linearRampToValueAtTime(1, when + fade);
        g.gain.setValueAtTime(1, when + dur - fade);
        g.gain.linearRampToValueAtTime(0, when + dur);
        src.connect(g).connect(layerGains.current[l.id]);
        src.start(when);
        const next = when + dur - fade;
        const t = window.setTimeout(() => play(next), Math.max(0, (next - ctx.currentTime - 0.5) * 1000));
        timers.current.push(t);
      };
      play(ctx.currentTime + 0.05);
    }

    function runScatter(l: LayerDef) {
      const ctx = ctxRef.current!;
      const [a, b] = l.every ?? [3, 8];
      const fire = () => {
        const gain = layerGains.current[l.id].gain.value;
        if (gain > 0.01 && ctx.state === "running") {
          const list = buffers.current[l.id];
          const src = ctx.createBufferSource();
          src.buffer = list[Math.floor(Math.random() * list.length)];
          src.playbackRate.value = 0.92 + Math.random() * 0.16;
          const pan = ctx.createStereoPanner();
          pan.pan.value = Math.random() * 1.6 - 0.8;
          const g = ctx.createGain();
          g.gain.value = 0.55 + Math.random() * 0.45;
          src.connect(g).connect(pan).connect(layerGains.current[l.id]);
          src.start();
        }
        const t = window.setTimeout(fire, (a + Math.random() * (b - a)) * 1000);
        timers.current.push(t);
      };
      fire();
    }

    start().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [soundOn]);

  // Master volume / mute with smooth ramps; suspend the context when off.
  useEffect(() => {
    const ctx = ctxRef.current;
    const master = masterRef.current;
    if (!ctx || !master) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    if (soundOn) {
      master.gain.linearRampToValueAtTime(volume * 0.9, now + 1.2);
    } else {
      master.gain.linearRampToValueAtTime(0, now + 0.5);
      const t = window.setTimeout(() => ctx.state === "running" && !useSettings.getState().soundOn && ctx.suspend(), 600);
      return () => window.clearTimeout(t);
    }
  }, [soundOn, volume]);

  // Scene crossfade.
  useEffect(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const mix = MIX[scene];
    for (const [id, g] of Object.entries(layerGains.current)) {
      g.gain.cancelScheduledValues(ctx.currentTime);
      g.gain.setTargetAtTime(mix[id] ?? 0, ctx.currentTime, 1.4);
    }
  }, [scene, soundOn]);

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t));
      ctxRef.current?.close();
    },
    [],
  );

  return null;
}

/** Sections register which ambience should play while they are on screen. */
export function useSoundZone(ref: React.RefObject<Element | null>, scene: SoundScene) {
  const setScene = useSoundScene((s) => s.setScene);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setScene(scene), { rootMargin: "-45% 0px -45% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, scene, setScene]);
}
