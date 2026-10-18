"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { SceneCanvas } from "../scene-canvas";
import { mulberry32 } from "@/lib/utils";
import type { QualityTier } from "@/lib/settings";

/**
 * Bioluminescent beetles over the night photograph. Each point has its own
 * flash rhythm (short pulse + long dark gap) and a slow wandering path.
 * Transparent canvas — composited over the image.
 */
function Fireflies({ count, animate }: { count: number; animate: boolean }) {
  const { geometry, material } = useMemo(() => {
    const rnd = mulberry32(42);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const depth = rnd();
      pos.set([(rnd() - 0.5) * (12 + depth * 18), -3.5 + rnd() * 5 + depth * 2, -depth * 14], i * 3);
      seed.set([rnd(), 0.6 + rnd() * 1.6], i * 2);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 2));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute vec2 aSeed; uniform float uTime; varying float vA;
        void main(){
          float s = aSeed.x;
          vec3 p = position;
          p.x += sin(uTime * 0.21 * aSeed.y + s * 40.0) * 0.9;
          p.y += sin(uTime * 0.17 * aSeed.y + s * 21.0) * 0.5;
          p.z += cos(uTime * 0.13 + s * 13.0) * 0.6;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float cycle = fract(uTime / (2.5 + s * 4.0) + s * 7.0);
          float flash = smoothstep(0.0, 0.06, cycle) * smoothstep(0.24, 0.08, cycle);
          vA = flash;
          gl_PointSize = (6.0 + s * 8.0) * (8.0 / -mv.z) * (0.6 + flash);
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float core = smoothstep(0.18, 0.0, d);
          float halo = smoothstep(0.5, 0.0, d) * 0.45;
          float a = (core + halo) * vA;
          gl_FragColor = vec4(vec3(0.78, 1.0, 0.45) * a, a);
        }
      `,
    });
    return { geometry: g, material: m };
  }, [count]);
  useFrame((s) => {
    if (animate) material.uniforms.uTime.value = s.clock.elapsedTime;
    else material.uniforms.uTime.value = 1.3;
  });
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

export function FirefliesCanvas({ tier, animate, className }: { tier: Exclude<QualityTier, "poster">; animate: boolean; className?: string }) {
  return (
    <SceneCanvas tier={tier} className={className} camera={{ fov: 50, position: [0, 0, 6] }} transparent>
      <Fireflies count={tier === "high" ? 140 : tier === "standard" ? 90 : 50} animate={animate} />
    </SceneCanvas>
  );
}
