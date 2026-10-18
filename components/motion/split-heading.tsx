"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { useSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

interface Props {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** lines: masked line rise · chars: staggered letters · words: soft word drift */
  mode?: "lines" | "chars" | "words";
  delay?: number;
  /** Animate on mount instead of on scroll. */
  immediate?: boolean;
  id?: string;
}

/**
 * Kinetic headline: text is split with GSAP SplitText and revealed through
 * line masks. Falls back to plain static text when motion is off.
 */
export function SplitHeading({ as: Tag = "h2", children, className, mode = "lines", delay = 0, immediate, id }: Props) {
  const ref = useRef<HTMLElement>(null);
  const motion = useSettings((s) => s.motion);
  const hydrated = useSettings((s) => s.hydrated);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || !hydrated) return;
      if (!motion) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }
      let split: SplitText | null = null;
      const run = () => {
        split = SplitText.create(el, {
          type: mode === "chars" ? "lines,chars" : mode === "words" ? "lines,words" : "lines",
          mask: "lines",
          linesClass: "split-line",
          autoSplit: true,
          onSplit(self) {
            gsap.set(el, { autoAlpha: 1 });
            const targets = mode === "chars" ? self.chars : mode === "words" ? self.words : self.lines;
            return gsap.from(targets, {
              yPercent: mode === "words" ? 40 : 110,
              opacity: mode === "words" ? 0 : 1,
              rotate: mode === "chars" ? 4 : 0,
              duration: mode === "chars" ? 1.1 : 1.25,
              ease: "expo.out",
              stagger: mode === "chars" ? 0.025 : mode === "words" ? 0.04 : 0.11,
              delay,
              scrollTrigger: immediate ? undefined : { trigger: el, start: "top 88%", once: true },
            });
          },
        });
      };
      if (document.fonts?.ready) document.fonts.ready.then(run);
      else run();
      return () => split?.revert();
    },
    { dependencies: [motion, hydrated, mode], scope: ref },
  );

  return (
    <Tag ref={ref} id={id} className={cn(className, "split-pending")}>
      {children}
    </Tag>
  );
}
