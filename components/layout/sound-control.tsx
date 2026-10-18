"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSettings } from "@/lib/settings";
import { useSoundScene } from "./sound-engine";
import { cn } from "@/lib/utils";

const SCENE_LABEL = { day: "Дневной лес", water: "У воды", night: "Ночной лес" } as const;

/** Sound toggle (off by default) with an animated level meter and volume slider. */
export function SoundControl() {
  const soundOn = useSettings((s) => s.soundOn);
  const volume = useSettings((s) => s.volume);
  const setSound = useSettings((s) => s.setSound);
  const setVolume = useSettings((s) => s.setVolume);
  const scene = useSoundScene((s) => s.scene);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={soundOn ? "Звук леса включён — настроить" : "Звук леса выключен — настроить"}
        className="flex h-10 items-center gap-2.5 px-2 text-[var(--milk-80)] transition-colors hover:text-milk"
      >
        <span className="flex h-3.5 items-end gap-[2px]" aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={cn("w-[2px] origin-bottom bg-current", soundOn ? "sound-bar" : "")}
              style={{ height: soundOn ? "100%" : "25%", animationDelay: `${i * 0.13}s` }}
            />
          ))}
        </span>
        <span className="t-label hidden sm:inline">{soundOn ? "Звук" : "Без звука"}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Атмосферный звук"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-12 w-72 border border-[var(--milk-15)] bg-forest-900 p-5"
          >
            <p className="t-label text-gold-300">Звуки леса</p>
            <p className="t-small mt-2">
              Полевые записи птиц, насекомых, лягушек и дождя. Микс меняется по главам: день, вода, ночь.
            </p>
            <button
              type="button"
              onClick={() => setSound(!soundOn)}
              className={cn(
                "t-label mt-4 flex w-full items-center justify-between border px-4 py-3 transition-colors",
                soundOn ? "border-gold-400 text-gold-300" : "border-[var(--milk-15)] text-milk hover:border-[var(--milk-40)]",
              )}
              aria-pressed={soundOn}
            >
              {soundOn ? "Выключить звук" : "Включить звук"}
              <span className="t-mono">{soundOn ? "ON" : "OFF"}</span>
            </button>
            <label className="mt-5 block">
              <span className="t-mono flex justify-between text-[var(--milk-60)]">
                <span>Громкость</span>
                <span>{Math.round(volume * 100)}</span>
              </span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                disabled={!soundOn}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="range mt-3 w-full disabled:opacity-40"
              />
            </label>
            <p className="t-mono mt-4 text-[var(--milk-40)]">Сейчас: {SCENE_LABEL[scene]}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
