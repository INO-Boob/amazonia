"use client";

import type { MutableRefObject } from "react";
import { SceneCanvas } from "../scene-canvas";
import { ForestScene } from "./forest-scene";
import type { QualityTier } from "@/lib/settings";

interface Props {
  tier: Exclude<QualityTier, "poster">;
  progress: MutableRefObject<number>;
  pointer: MutableRefObject<{ x: number; y: number }>;
  animate: boolean;
  onReady: () => void;
  className?: string;
}

export function ForestCanvas({ tier, progress, pointer, animate, onReady, className }: Props) {
  return (
    <SceneCanvas tier={tier} className={className} camera={{ fov: 50, position: [0, 3, 21], near: 0.1, far: 900 }}>
      <ForestScene tier={tier} progress={progress} pointer={pointer} animate={animate} onReady={onReady} />
    </SceneCanvas>
  );
}
