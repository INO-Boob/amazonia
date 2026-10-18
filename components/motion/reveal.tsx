"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { useSettings } from "@/lib/settings";

const VARIANTS: Record<string, Variants> = {
  up: { hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  left: { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0 } },
  blur: { hidden: { opacity: 0, filter: "blur(12px)" }, show: { opacity: 1, filter: "blur(0px)" } },
};

interface Props {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof VARIANTS;
  delay?: number;
  duration?: number;
  as?: "div" | "p" | "li" | "figure" | "span";
}

/** Small UI-level reveal driven by Framer Motion (viewport-triggered once). */
export function Reveal({ children, className, variant = "up", delay = 0, duration = 1, as = "div" }: Props) {
  const motionOn = useSettings((s) => s.motion);
  const Comp = motion[as];
  if (!motionOn) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }
  return (
    <Comp
      className={className}
      variants={VARIANTS[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}
