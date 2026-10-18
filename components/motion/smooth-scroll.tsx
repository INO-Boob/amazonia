"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useSettings } from "@/lib/settings";

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

/**
 * Global Lenis smooth scroll synced with GSAP ScrollTrigger.
 * Native scrolling is kept (no scroll-jacking); disabled entirely when the
 * visitor turns decorative motion off or prefers reduced motion.
 */
export function SmoothScroll() {
  const motion = useSettings((s) => s.motion);
  const hydrated = useSettings((s) => s.hydrated);
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated || !motion) return;
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95, smoothWheel: true });
    lenisInstance = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [hydrated, motion]);

  // New route: start at top and let ScrollTrigger re-measure.
  useEffect(() => {
    if (window.location.hash) return;
    lenisInstance?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenisInstance) lenisInstance.scrollTo(el, { offset: 0, duration: 1.6 });
  else el.scrollIntoView({ behavior: "smooth" });
}
