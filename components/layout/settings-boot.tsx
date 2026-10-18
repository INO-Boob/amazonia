"use client";

import { useEffect } from "react";
import { detectTier, useSettings, type QualityChoice } from "@/lib/settings";

/** Reads device capability + stored preferences once on the client. */
export function SettingsBoot() {
  const hydrate = useSettings((s) => s.hydrate);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let motion = !reduced;
    let choice: QualityChoice = "auto";
    try {
      const m = localStorage.getItem("amz-motion");
      if (m === "on") motion = true;
      if (m === "off") motion = false;
      const q = localStorage.getItem("amz-quality");
      if (q === "high" || q === "standard" || q === "lite" || q === "auto") choice = q;
    } catch {}
    document.documentElement.dataset.motion = motion ? "on" : "off";
    hydrate(detectTier(), motion, choice);
  }, [hydrate]);

  return null;
}
