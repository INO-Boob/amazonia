"use client";

import { Component, Suspense, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { useInView, usePageVisible } from "@/lib/hooks/use-in-view";
import { useSettings, type QualityTier } from "@/lib/settings";

class WebGLBoundary extends Component<{ children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const DPR: Record<Exclude<QualityTier, "poster">, [number, number]> = {
  high: [1, 1.75],
  standard: [1, 1.25],
  lite: [0.75, 1],
};

interface Props {
  tier: Exclude<QualityTier, "poster">;
  camera?: { fov: number; position: [number, number, number]; near?: number; far?: number };
  children: ReactNode;
  className?: string;
  /** Called on WebGL failure (the parent then shows its poster). */
  onFail?: () => void;
  /** Composite over the page (alpha canvas, no tone mapping of the clear colour). */
  transparent?: boolean;
}

/**
 * Shared canvas shell: lazy (client only), pauses rendering when off-screen
 * or the tab is hidden, caps DPR per quality tier, adapts DPR down if the
 * frame rate drops, and reports WebGL errors / context loss.
 */
export function SceneCanvas({ tier, camera, children, className, onFail, transparent = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, "100px");
  const visible = usePageVisible();
  const markFailed = useSettings((s) => s.markWebglFailed);
  // adaptive DPR, reset whenever the quality tier changes
  const [adaptive, setAdaptive] = useState({ tier, dpr: DPR[tier][1] });
  const dpr = adaptive.tier === tier ? adaptive.dpr : DPR[tier][1];
  const setDpr = (f: (d: number) => number) => setAdaptive({ tier, dpr: f(dpr) });

  const fail = () => {
    markFailed();
    onFail?.();
  };

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <WebGLBoundary onError={fail}>
        <Canvas
          dpr={dpr}
          frameloop={inView && visible ? "always" : "never"}
          camera={camera ?? { fov: 50, position: [0, 3, 21], near: 0.1, far: 900 }}
          gl={{ antialias: tier !== "lite", powerPreference: "high-performance", alpha: transparent, stencil: false, premultipliedAlpha: true }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
            gl.domElement.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              fail();
            });
          }}
        >
          <PerformanceMonitor
            flipflops={2}
            onDecline={() => setDpr((d) => Math.max(DPR[tier][0], d - 0.25))}
            onIncline={() => setDpr((d) => Math.min(DPR[tier][1], d + 0.25))}
          />
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      </WebGLBoundary>
    </div>
  );
}
