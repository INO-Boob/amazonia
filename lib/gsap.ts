"use client";

/**
 * Central GSAP registration. Import gsap from here so plugins are
 * registered once and the house easing curves stay consistent.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 1 });
}

export const EASE = {
  out: "power3.out",
  expo: "expo.out",
  inOut: "power2.inOut",
  cinematic: "expo.inOut",
  soft: "sine.inOut",
} as const;

export { gsap, ScrollTrigger, SplitText, useGSAP };
