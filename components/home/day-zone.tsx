"use client";

import { useRef, type ReactNode } from "react";
import { useSoundZone } from "@/components/layout/sound-engine";

/** Marks a run of chapters as "daytime forest" for the ambient mix. */
export function DayZone({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useSoundZone(ref, "day");
  return <div ref={ref}>{children}</div>;
}
