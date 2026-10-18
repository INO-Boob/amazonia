"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal } from "lucide-react";
import { useQualityTier, useSettings, type QualityChoice } from "@/lib/settings";
import { cn } from "@/lib/utils";

const QUALITY: { id: QualityChoice; label: string }[] = [
  { id: "auto", label: "Авто" },
  { id: "high", label: "Высокое" },
  { id: "standard", label: "Стандарт" },
  { id: "lite", label: "Облегчённое" },
];

const TIER_LABEL = { high: "высокое", standard: "стандартное", lite: "облегчённое", poster: "статичные постеры" };

export function SettingsControl() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const choice = useSettings((s) => s.qualityChoice);
  const setQuality = useSettings((s) => s.setQuality);
  const motionOn = useSettings((s) => s.motion);
  const setMotion = useSettings((s) => s.setMotion);
  const webglFailed = useSettings((s) => s.webglFailed);
  const tier = useQualityTier();

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
        aria-label="Настройки качества и анимации"
        className="grid h-10 w-10 place-items-center text-[var(--milk-80)] transition-colors hover:text-milk"
      >
        <SlidersHorizontal size={18} strokeWidth={1.4} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Настройки"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-12 w-72 border border-[var(--milk-15)] bg-forest-900 p-5"
          >
            <fieldset>
              <legend className="t-label text-gold-300">Качество 3D</legend>
              <div className="mt-3 grid grid-cols-2 gap-px bg-[var(--milk-15)]">
                {QUALITY.map((q) => (
                  <button
                    key={q.id}
                    type="button"
                    aria-pressed={choice === q.id}
                    onClick={() => setQuality(q.id)}
                    className={cn(
                      "t-label bg-forest-900 px-3 py-3 text-left transition-colors",
                      choice === q.id ? "text-gold-300" : "text-[var(--milk-60)] hover:text-milk",
                    )}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <p className="t-mono mt-3 text-[var(--milk-40)]">
              Сейчас: {TIER_LABEL[tier]}
              {webglFailed && " (WebGL недоступен)"}
            </p>
            <div className="hairline my-5" />
            <button
              type="button"
              role="switch"
              aria-checked={motionOn}
              onClick={() => setMotion(!motionOn)}
              className="flex w-full items-center justify-between text-left"
            >
              <span>
                <span className="t-label block text-milk">Декоративное движение</span>
                <span className="t-small mt-1 block">Параллакс, 3D-сцены, частицы</span>
              </span>
              <span
                className={cn(
                  "relative h-5 w-9 shrink-0 rounded-full border transition-colors",
                  motionOn ? "border-gold-400 bg-gold-500/30" : "border-[var(--milk-40)]",
                )}
              >
                <span
                  className={cn(
                    "absolute top-[3px] h-3 w-3 rounded-full transition-all",
                    motionOn ? "left-[19px] bg-gold-300" : "left-[3px] bg-[var(--milk-60)]",
                  )}
                />
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
