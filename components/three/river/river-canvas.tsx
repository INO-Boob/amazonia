"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { SceneCanvas } from "../scene-canvas";
import { asset, mulberry32 } from "@/lib/utils";
import type { QualityTier } from "@/lib/settings";

const WATER = new THREE.Color("#163a34");
const DEEP = new THREE.Color("#06110f");

interface Props {
  tier: Exclude<QualityTier, "poster">;
  progress: MutableRefObject<number>;
  animate: boolean;
  className?: string;
}

/** Surface seen from below: animated normals, bright Snell's window. */
function Surface({ animate }: { animate: boolean }) {
  const normals = useLoader(THREE.TextureLoader, asset("/assets/textures/waternormals.jpg"));
  normals.wrapS = normals.wrapT = THREE.RepeatWrapping;
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uN: { value: normals } },
        vertexShader: /* glsl */ `
          varying vec2 vUv; varying vec3 vW;
          void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform sampler2D uN; varying vec2 vUv; varying vec3 vW;
          void main(){
            vec2 p = vW.xz * 0.035;
            vec3 n1 = texture2D(uN, p + vec2(uTime * 0.012, uTime * 0.008)).rgb;
            vec3 n2 = texture2D(uN, p * 1.7 - vec2(uTime * 0.009, -uTime * 0.011)).rgb;
            vec3 n = normalize((n1 + n2) - 1.0);
            float r = length(vW.xz - cameraPosition.xz);
            float window = smoothstep(26.0, 2.0, r);
            float spark = pow(max(n.x * 0.5 + 0.5, 0.0), 8.0);
            vec3 col = mix(vec3(0.07, 0.2, 0.18), vec3(0.75, 0.86, 0.72), window * (0.55 + 0.45 * n.y));
            col += vec3(1.0, 0.95, 0.75) * spark * window * 0.9;
            float a = mix(0.92, 1.0, window) * smoothstep(80.0, 40.0, r);
            gl_FragColor = vec4(col, a);
            #include <colorspace_fragment>
          }
        `,
      }),
    [normals],
  );
  useFrame((s) => {
    if (animate) mat.uniforms.uTime.value = s.clock.elapsedTime;
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 7, -10]} material={mat}>
      <planeGeometry args={[200, 200]} />
    </mesh>
  );
}

/** Riverbed with procedural caustic light. */
function Bed({ animate }: { animate: boolean }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uDeep: { value: DEEP }, uWater: { value: WATER } },
        vertexShader: /* glsl */ `
          varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec3 uDeep; uniform vec3 uWater; varying vec3 vW;
          vec2 hash2(vec2 p){ p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3))); return fract(sin(p) * 43758.5453); }
          float voronoi(vec2 x){ vec2 n = floor(x), f = fract(x); float m = 8.0;
            for (int j=-1;j<=1;j++) for (int i=-1;i<=1;i++){ vec2 g = vec2(i,j); vec2 o = hash2(n+g); o = 0.5 + 0.5*sin(uTime*0.6 + 6.2831*o); vec2 r = g + o - f; m = min(m, dot(r,r)); }
            return sqrt(m); }
          void main(){
            vec2 p = vW.xz * 0.25;
            float c = pow(1.0 - voronoi(p), 6.0) + pow(1.0 - voronoi(p * 1.6 + 3.0), 6.0) * 0.6;
            float d = length(vW.xz - cameraPosition.xz);
            vec3 sand = vec3(0.28, 0.22, 0.14);
            vec3 col = sand * 0.35 + vec3(0.9, 0.85, 0.55) * c * 0.35;
            col = mix(col, uDeep, smoothstep(6.0, 45.0, d));
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  );
  useFrame((s) => {
    if (animate) mat.uniforms.uTime.value = s.clock.elapsedTime;
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -6, -10]} material={mat}>
      <planeGeometry args={[200, 200]} />
    </mesh>
  );
}

/** Flooded-forest trunks rising through the water column. */
function Trunks() {
  const geo = useMemo(() => {
    const rnd = mulberry32(31);
    const list: THREE.BufferGeometry[] = [];
    for (let i = 0; i < 22; i++) {
      const x = (rnd() - 0.5) * 70;
      const z = -8 - rnd() * 60;
      if (Math.abs(x) < 4 && z > -20) continue;
      const r = 0.25 + rnd() * 0.7;
      const g = new THREE.CylinderGeometry(r * 0.85, r, 16, 9, 1, true);
      g.rotateZ((rnd() - 0.5) * 0.12);
      g.translate(x, 1, z);
      list.push(g);
    }
    // a few tangled branches
    for (let i = 0; i < 10; i++) {
      const a = new THREE.Vector3((rnd() - 0.5) * 40, -6 + rnd() * 6, -6 - rnd() * 40);
      const b = a.clone().add(new THREE.Vector3((rnd() - 0.5) * 12, rnd() * 5, (rnd() - 0.5) * 8));
      const c = new THREE.QuadraticBezierCurve3(a, a.clone().lerp(b, 0.5).add(new THREE.Vector3(0, 1.5, 0)), b);
      list.push(new THREE.TubeGeometry(c, 16, 0.08 + rnd() * 0.12, 5));
    }
    return mergeGeometries(list)!;
  }, []);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color="#1d1a12" roughness={1} />
    </mesh>
  );
}

function Rays({ animate, count }: { animate: boolean; count: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 } },
        vertexShader: /* glsl */ `varying vec2 vUv; varying float vS; void main(){ vUv = uv; vS = float(gl_InstanceID); gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position,1.); }`,
        fragmentShader: /* glsl */ `
          uniform float uTime; varying vec2 vUv; varying float vS;
          void main(){
            float e = smoothstep(0.0,0.5,vUv.x) * smoothstep(1.0,0.5,vUv.x);
            float l = smoothstep(0.0, 0.9, vUv.y);
            float f = 0.5 + 0.5 * sin(uTime * 0.7 + vS * 2.3);
            float a = e * e * l * f * 0.12;
            gl_FragColor = vec4(vec3(0.7, 0.95, 0.85) * a, a);
          }
        `,
      }),
    [],
  );
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1).translate(0, -0.5, 0), []);
  useEffect(() => {
    {
      const mesh = ref.current;
      if (!mesh) return;
      const rnd = mulberry32(8);
      const m = new THREE.Matrix4();
      for (let i = 0; i < count; i++) {
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.25 + rnd() * 0.1, rnd() * Math.PI, 0.2));
        m.compose(new THREE.Vector3((rnd() - 0.5) * 30, 7, -4 - rnd() * 30), q, new THREE.Vector3(1 + rnd() * 3, 14, 1));
        mesh.setMatrixAt(i, m);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }
  }, [count]);
  useFrame((s) => {
    if (animate) mat.uniforms.uTime.value = s.clock.elapsedTime;
  });
  return <instancedMesh ref={ref} args={[geo, mat, count]} frustumCulled={false} />;
}

function Sediment({ count, animate }: { count: number; animate: boolean }) {
  const { geometry, material } = useMemo(() => {
    const rnd = mulberry32(17);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos.set([(rnd() - 0.5) * 30, -6 + rnd() * 13, 8 - rnd() * 40], i * 3);
      seed[i] = rnd();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute float aSeed; uniform float uTime; varying float vA;
        void main(){
          vec3 p = position;
          p.x += sin(uTime * 0.2 + aSeed * 30.0) * 0.6 + uTime * 0.15 * (0.5 + aSeed);
          p.x = mod(p.x + 15.0, 30.0) - 15.0;
          p.y += sin(uTime * 0.3 + aSeed * 12.0) * 0.4;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (1.0 + aSeed * 2.0) * (24.0 / -mv.z);
          vA = smoothstep(30.0, 3.0, -mv.z) * (0.3 + aSeed * 0.7);
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main(){ float d = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.0, d) * vA * 0.6; gl_FragColor = vec4(vec3(0.8, 0.85, 0.7) * a, a); }
      `,
    });
    return { geometry: g, material: m };
  }, [count]);
  useFrame((s) => {
    if (animate) material.uniforms.uTime.value = s.clock.elapsedTime;
  });
  return <points geometry={geometry} material={material} frustumCulled={false} />;
}

function Rig({ progress, animate }: { progress: MutableRefObject<number>; animate: boolean }) {
  const { camera, scene } = useThree();
  const p = useRef(0);
  useEffect(() => {
    scene.fog = new THREE.FogExp2(WATER, 0.06);
    scene.background = WATER.clone();
    return () => {
      scene.fog = null;
      scene.background = null;
    };
  }, [scene]);
  useFrame((s, dt) => {
    p.current += (progress.current - p.current) * (1 - Math.exp(-dt * 2.5));
    const t = animate ? s.clock.elapsedTime : 0;
    camera.position.set(Math.sin(t * 0.1) * 0.6, 4.5 - p.current * 8, 8 - p.current * 6);
    camera.lookAt(Math.sin(t * 0.07) * 2, 3.5 - p.current * 7.5 + Math.sin(t * 0.2) * 0.3, -20);
    if (!scene.fog || !scene.background) return;
    (scene.fog as THREE.FogExp2).density = 0.05 + p.current * 0.04;
    (scene.background as THREE.Color).copy(WATER).lerp(DEEP, p.current * 0.85);
    (scene.fog as THREE.FogExp2).color.copy(scene.background as THREE.Color);
  });
  return null;
}

export function RiverCanvas({ tier, progress, animate, className }: Props) {
  const count = tier === "high" ? 1200 : tier === "standard" ? 700 : 300;
  return (
    <SceneCanvas tier={tier} className={className} camera={{ fov: 55, position: [0, 4, 8], near: 0.1, far: 300 }}>
      <hemisphereLight args={["#bfe3d0", "#0b1612", 0.8]} />
      <Surface animate={animate} />
      <Bed animate={animate} />
      <Trunks />
      <Rays animate={animate} count={tier === "lite" ? 5 : 10} />
      <Sediment count={count} animate={animate} />
      <Rig progress={progress} animate={animate} />
    </SceneCanvas>
  );
}
