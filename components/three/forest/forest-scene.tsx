"use client";

import { useEffect, useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { clone as cloneSkinned } from "three/examples/jsm/utils/SkeletonUtils.js";
import { mulberry32 } from "@/lib/utils";
import type { QualityTier } from "@/lib/settings";
import { createBarkTexture, createGroundTexture, createLeafAtlas } from "./textures";

/* ─────────────────────────────────────────────────────────────────────────
   Atmosphere constants — tuned together with the CSS grade on top.
   ───────────────────────────────────────────────────────────────────────── */
const FOG_COLOR = new THREE.Color("#8f9670");
const FOG_DENSITY = 0.022;
const SUN_DIR = new THREE.Vector3(0.28, 0.62, -0.73).normalize();
const SUN_COLOR = new THREE.Color("#ffd9a0");

export interface ForestProps {
  tier: Exclude<QualityTier, "poster">;
  /** 0 → 1 scroll progress through the hero, written by GSAP. */
  progress: MutableRefObject<number>;
  /** Normalised pointer (-1..1), written by the hero. */
  pointer: MutableRefObject<{ x: number; y: number }>;
  animate: boolean;
  onReady?: () => void;
}

const COUNTS = {
  high: { trees: 70, palms: 26, canopy: 1500, mid: 520, under: 1000, lianas: 34, motes: 1400, birds: 3, rays: 9 },
  standard: { trees: 58, palms: 20, canopy: 1300, mid: 420, under: 700, lianas: 24, motes: 800, birds: 2, rays: 7 },
  lite: { trees: 34, palms: 10, canopy: 520, mid: 180, under: 320, lianas: 12, motes: 320, birds: 0, rays: 5 },
};

/* path the camera travels along: keep it clear of trunks */
const onPath = (x: number, z: number) => Math.abs(x) < 3.2 + Math.max(0, -z - 30) * 0.02 && z > -70;

/* ── Sky dome: warm haze glowing towards the sun ─────────────────────── */
function Sky() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        uniforms: { uSun: { value: SUN_DIR }, uFog: { value: FOG_COLOR } },
        vertexShader: /* glsl */ `
          varying vec3 vDir;
          void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uSun; uniform vec3 uFog; varying vec3 vDir;
          void main(){
            float h = vDir.y;
            vec3 top = vec3(0.10,0.16,0.10);
            vec3 col = mix(uFog, top, smoothstep(0.08, 0.8, h));
            float s = max(dot(normalize(vDir), uSun), 0.);
            col += (vec3(1.0,0.82,0.55) * pow(s, 14.) * 2.0 + vec3(1.0,0.8,0.5) * pow(s, 3.) * 0.45) * smoothstep(0.0, 0.3, h);
            gl_FragColor = vec4(col, 1.);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      }),
    [],
  );
  return (
    <mesh material={mat} renderOrder={-10}>
      <sphereGeometry args={[400, 32, 16]} />
    </mesh>
  );
}

/* ── Trunks: merged buttressed cylinders + bark texture (1 draw call) ── */
function useTrunks(count: number, palms: number, seed = 1) {
  return useMemo(() => {
    const rnd = mulberry32(seed);
    const geos: THREE.BufferGeometry[] = [];
    const tops: { x: number; y: number; z: number; r: number; palm: boolean }[] = [];
    const color = new THREE.Color();
    let placed = 0;
    let guard = 0;
    while (placed < count + palms && guard++ < 5000) {
      const palm = placed >= count;
      const x = (rnd() - 0.5) * 80;
      const z = 26 - rnd() * 120;
      if (onPath(x, z)) continue;
      const near = Math.hypot(x, z - 10) < 30;
      const h = palm ? 7 + rnd() * 9 : 18 + rnd() * 22;
      const rb = palm ? 0.12 + rnd() * 0.08 : (near ? 0.5 : 0.35) + rnd() * (near ? 0.9 : 0.6);
      const rt = palm ? rb * 0.8 : rb * (0.35 + rnd() * 0.2);
      const g = new THREE.CylinderGeometry(rt, rb, h, palm ? 7 : 16, palm ? 6 : 22, true);
      g.translate(0, h / 2, 0);
      const pos = g.attributes.position as THREE.BufferAttribute;
      const fins = 3 + Math.floor(rnd() * 4);
      const finOff = rnd() * Math.PI * 2;
      const buttress = palm ? 0 : 0.6 + rnd() * 2.2;
      const bendX = (rnd() - 0.5) * 1.6;
      const bendZ = (rnd() - 0.5) * 1.6;
      const cols: number[] = [];
      for (let i = 0; i < pos.count; i++) {
        let px = pos.getX(i);
        let pz = pos.getZ(i);
        const py = pos.getY(i);
        const a = Math.atan2(pz, px);
        const low = Math.max(0, 1 - py / 3.2);
        const fin = Math.pow(Math.max(0, Math.cos(a * fins + finOff)), 5);
        const k = 1 + buttress * fin * low * low;
        px *= k;
        pz *= k;
        const t = py / h;
        px += Math.sin(t * Math.PI) * bendX;
        pz += Math.sin(t * Math.PI) * bendZ;
        pos.setXYZ(i, px + x, py, pz + z);
        // moss towards the base, lighter bark higher up
        const moss = Math.max(0, 1 - py / 6) * (0.4 + rnd() * 0.2);
        color.setRGB(0.62 + 0.18 * t, 0.58 + 0.14 * t + moss * 0.12, 0.5 + 0.1 * t - moss * 0.05);
        if (palm) color.setRGB(0.55, 0.56, 0.44);
        cols.push(color.r, color.g, color.b);
      }
      g.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
      // tile bark along the height
      const uv = g.attributes.uv as THREE.BufferAttribute;
      for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * Math.max(1, Math.round(rb * 6)), uv.getY(i) * (h / 4));
      g.computeVertexNormals();
      geos.push(g);
      tops.push({ x: x + bendX * 0, y: h, z, r: rb, palm });
      placed++;
    }
    const merged = mergeGeometries(geos, false)!;
    geos.forEach((g) => g.dispose());
    return { geometry: merged, tops };
  }, [count, palms, seed]);
}

/* ── Lianas: hanging catenary-like tubes ─────────────────────────────── */
function useLianas(count: number, tops: { x: number; y: number; z: number; palm: boolean }[]) {
  return useMemo(() => {
    const rnd = mulberry32(21);
    const trees = tops.filter((t) => !t.palm);
    const geos: THREE.BufferGeometry[] = [];
    for (let i = 0; i < count && trees.length > 1; i++) {
      const a = trees[Math.floor(rnd() * trees.length)];
      const start = new THREE.Vector3(a.x + (rnd() - 0.5) * 3, a.y * (0.7 + rnd() * 0.25), a.z + (rnd() - 0.5) * 3);
      const drop = 2 + rnd() * (start.y - 4);
      const sway = new THREE.Vector3((rnd() - 0.5) * 4, 0, (rnd() - 0.5) * 4);
      const pts = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        pts.push(new THREE.Vector3(start.x + sway.x * Math.sin(t * Math.PI * 0.8), start.y - drop * t, start.z + sway.z * Math.sin(t * Math.PI * 0.8)));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      geos.push(new THREE.TubeGeometry(curve, 36, 0.035 + rnd() * 0.06, 5, false));
    }
    if (!geos.length) return null;
    const merged = mergeGeometries(geos, false)!;
    geos.forEach((g) => g.dispose());
    return merged;
  }, [count, tops]);
}

/* ── Foliage: one instanced mesh, atlas + wind + translucency shader ── */
const foliageVertex = /* glsl */ `
  attribute vec4 aData;   // x: atlas cell, y: phase, z: flex, w: brightness
  attribute vec3 aTint;
  uniform float uTime;
  uniform float uWind;
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vCell;
  varying float vBright;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vDepth;
  void main(){
    vUv = uv; vTint = aTint; vCell = aData.x; vBright = aData.w;
    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
    float bend = uv.y * uv.y;
    float t = uTime + aData.y;
    float gust = 0.6 + 0.4 * sin(uTime * 0.23 + world.x * 0.02);
    world.x += sin(t * 1.1 + world.y * 0.13) * 0.16 * bend * uWind * aData.z * gust;
    world.z += cos(t * 0.8 + world.x * 0.09) * 0.11 * bend * uWind * aData.z * gust;
    world.y += sin(t * 1.7) * 0.04 * bend * uWind * aData.z;
    vWorld = world.xyz;
    vNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * vec3(0.0, 0.0, 1.0));
    vec4 mv = viewMatrix * world;
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
const foliageFragment = /* glsl */ `
  uniform sampler2D uAtlas;
  uniform vec3 uSunDir;
  uniform vec3 uSunColor;
  uniform vec3 uAmbient;
  uniform vec3 uFogColor;
  uniform float uFogDensity;
  varying vec2 vUv;
  varying vec3 vTint;
  varying float vCell;
  varying float vBright;
  varying vec3 vWorld;
  varying vec3 vNormal;
  varying float vDepth;
  void main(){
    vec2 cell = vec2(mod(vCell, 2.0), floor(vCell / 2.0));
    vec4 tex = texture2D(uAtlas, (vUv * 0.996 + 0.002 + cell) * 0.5);
    if (tex.a < 0.45) discard;
    vec3 n = normalize(vNormal);
    if (!gl_FrontFacing) n = -n;
    vec3 V = normalize(cameraPosition - vWorld);
    float diff = max(dot(n, uSunDir), 0.0);
    float back = pow(max(dot(-V, uSunDir), 0.0), 3.0);
    float height = smoothstep(-1.0, 26.0, vWorld.y);
    vec3 base = tex.rgb * vTint * vBright;
    base = mix(vec3(dot(base, vec3(0.299, 0.587, 0.114))), base, 0.82);
    vec3 col = base * (uAmbient * (0.55 + 0.6 * height) + uSunColor * diff * 0.55 * height);
    // light through the leaf blade when the sun is behind it
    col += base * uSunColor * back * (0.5 + 1.6 * height) * vec3(1.05, 1.2, 0.55);
    float fog = 1.0 - exp(-uFogDensity * uFogDensity * vDepth * vDepth);
    col = mix(col, uFogColor, clamp(fog, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

function Foliage({ tops, counts, animate }: { tops: { x: number; y: number; z: number; r: number; palm: boolean }[]; counts: (typeof COUNTS)["high"]; animate: boolean }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const atlas = useMemo(() => createLeafAtlas(1024), []);
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1, 1, 4).translate(0, 0.5, 0), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.DoubleSide,
        uniforms: {
          uAtlas: { value: atlas },
          uTime: { value: 0 },
          uWind: { value: 1 },
          uSunDir: { value: SUN_DIR },
          uSunColor: { value: SUN_COLOR },
          uAmbient: { value: new THREE.Color("#7d9668") },
          uFogColor: { value: FOG_COLOR },
          uFogDensity: { value: FOG_DENSITY },
        },
        vertexShader: foliageVertex,
        fragmentShader: foliageFragment,
      }),
    [atlas],
  );

  const total = counts.canopy + counts.mid + counts.under + tops.filter((t) => t.palm).length * 11;

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rnd = mulberry32(99);
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const e = new THREE.Euler();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const data = new Float32Array(total * 4);
    const tint = new Float32Array(total * 3);
    let i = 0;
    const push = (cell: number, x: number, y: number, z: number, w: number, h: number, rx: number, ry: number, rz: number, flex: number, tintMul: [number, number, number], bright: number) => {
      if (i >= total) return;
      p.set(x, y, z);
      e.set(rx, ry, rz, "YXZ");
      q.setFromEuler(e);
      s.set(w, h, 1);
      m.compose(p, q, s);
      mesh.setMatrixAt(i, m);
      data.set([cell, rnd() * 20, flex, bright], i * 4);
      tint.set(tintMul, i * 3);
      i++;
    };
    const tints: [number, number, number][] = [
      [1, 1, 1],
      [0.92, 1.05, 0.85],
      [1.1, 1.08, 0.8],
      [0.85, 0.95, 0.9],
      [1.15, 1.0, 0.72],
    ];
    const pick = () => tints[Math.floor(rnd() * tints.length)];
    const trees = tops.filter((t) => !t.palm);

    // canopy: clusters around crowns + scattered upper layer
    for (let k = 0; k < counts.canopy; k++) {
      const t = trees[Math.floor(rnd() * trees.length)];
      const crown = rnd() < 0.75;
      const x = crown ? t.x + (rnd() - 0.5) * 12 : (rnd() - 0.5) * 90;
      const z = crown ? t.z + (rnd() - 0.5) * 12 : 26 - rnd() * 125;
      const y = crown ? t.y - 3 + rnd() * 6 : 16 + rnd() * 18;
      const sz = 3 + rnd() * 4.5;
      push(0, x, y, z, sz, sz, -Math.PI / 2 + (rnd() - 0.5) * 2.2, rnd() * Math.PI * 2, (rnd() - 0.5) * 1.2, 0.6, pick(), 0.85 + rnd() * 0.35);
    }
    // mid layer: epiphyte clusters & broadleaves along trunks
    for (let k = 0; k < counts.mid; k++) {
      const t = trees[Math.floor(rnd() * trees.length)];
      const a = rnd() * Math.PI * 2;
      const r = t.r + 0.4 + rnd() * 2.5;
      const y = 3 + rnd() * (t.y * 0.7);
      const sz = 1.2 + rnd() * 2.6;
      const cell = rnd() < 0.3 ? 2 : 0;
      push(cell, t.x + Math.cos(a) * r, y, t.z + Math.sin(a) * r, sz * (cell === 2 ? 0.7 : 1), sz, (rnd() - 0.5) * 1.6, a + Math.PI / 2, (rnd() - 0.5) * 0.8, 0.8, pick(), 0.8 + rnd() * 0.3);
    }
    // palm crowns: radiating drooping fronds
    for (const t of tops.filter((t) => t.palm)) {
      for (let f = 0; f < 11; f++) {
        const yaw = (f / 11) * Math.PI * 2 + rnd() * 0.3;
        const droop = -0.2 - rnd() * 0.9;
        const len = 3.2 + rnd() * 2.4;
        push(1, t.x, t.y - 0.2, t.z, len * 0.75, len, droop + Math.PI / 2 - 1.6, yaw, 0, 0.9, pick(), 0.9 + rnd() * 0.25);
      }
    }
    // understory: banana-leaves, ferns, saplings — denser along the path edges
    for (let k = 0; k < counts.under; k++) {
      let x = (rnd() - 0.5) * 70;
      const z = 24 - rnd() * 110;
      if (rnd() < 0.55) x = (rnd() < 0.5 ? -1 : 1) * (3.4 + rnd() * 7);
      const cell = rnd() < 0.45 ? 3 : rnd() < 0.6 ? 2 : 0;
      const sz = cell === 3 ? 1 + rnd() * 1.6 : 0.9 + rnd() * 2.2;
      const yaw = rnd() * Math.PI * 2;
      push(cell, x, -0.05, z, sz * (cell === 2 ? 0.7 : 0.8), sz, (rnd() - 0.5) * 0.9, yaw, (rnd() - 0.5) * 0.7, 1.1, pick(), 0.7 + rnd() * 0.35);
    }
    mesh.count = i;
    mesh.instanceMatrix.needsUpdate = true;
    geo.setAttribute("aData", new THREE.InstancedBufferAttribute(data, 4));
    geo.setAttribute("aTint", new THREE.InstancedBufferAttribute(tint, 3));
    mesh.computeBoundingSphere();
  }, [tops, counts, total, geo]);

  useFrame((state) => {
    if (animate) material.uniforms.uTime.value = state.clock.elapsedTime;
  });

  useEffect(() => () => {
    atlas.dispose();
    geo.dispose();
    material.dispose();
  }, [atlas, geo, material]);

  return <instancedMesh ref={ref} args={[geo, material, total]} frustumCulled={false} />;
}

/* ── God rays: crossed additive quads aligned with the sun ──────────── */
function LightShafts({ count, animate }: { count: number; animate: boolean }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color("#ffd690") } },
        vertexShader: /* glsl */ `
          varying vec2 vUv; varying float vSeed;
          attribute float aSeed;
          void main(){ vUv = uv; vSeed = aSeed; gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position,1.); }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec3 uColor; varying vec2 vUv; varying float vSeed;
          void main(){
            float edge = smoothstep(0.0, 0.5, vUv.x) * smoothstep(1.0, 0.5, vUv.x);
            float len = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
            float flicker = 0.65 + 0.35 * sin(uTime * 0.35 + vSeed * 6.28) * sin(uTime * 0.17 + vSeed * 3.1);
            float streak = 0.7 + 0.3 * sin(vUv.x * 18.0 + vSeed * 10.0);
            float a = edge * edge * len * flicker * streak * 0.32;
            gl_FragColor = vec4(uColor * a, a);
          }
        `,
      }),
    [],
  );
  const ref = useRef<THREE.InstancedMesh>(null);
  const n = count * 2;
  const geo = useMemo(() => new THREE.PlaneGeometry(1, 1).translate(0, 0.5, 0), []);
  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const rnd = mulberry32(5);
    const seeds = new Float32Array(n);
    const m = new THREE.Matrix4();
    const up = new THREE.Vector3(0, 1, 0);
    const q = new THREE.Quaternion().setFromUnitVectors(up, SUN_DIR);
    for (let i = 0; i < count; i++) {
      const base = new THREE.Vector3((rnd() - 0.5) * 26, -2, 6 - rnd() * 60);
      const w = 1.2 + rnd() * 3.5;
      const len = 46 + rnd() * 20;
      for (let k = 0; k < 2; k++) {
        const spin = new THREE.Quaternion().setFromAxisAngle(up, k * Math.PI / 2 + rnd() * 0.4);
        m.compose(base, q.clone().multiply(spin), new THREE.Vector3(w, len, 1));
        mesh.setMatrixAt(i * 2 + k, m);
        seeds[i * 2 + k] = rnd();
      }
    }
    geo.setAttribute("aSeed", new THREE.InstancedBufferAttribute(seeds, 1));
    mesh.instanceMatrix.needsUpdate = true;
  }, [count, n, geo]);
  useFrame((s) => {
    if (animate) mat.uniforms.uTime.value = s.clock.elapsedTime;
  });
  return <instancedMesh ref={ref} args={[geo, mat, n]} frustumCulled={false} renderOrder={5} />;
}

/* ── Floating spores / dust catching the light ─────────────────────── */
function Motes({ count, animate }: { count: number; animate: boolean }) {
  const { geometry, material } = useMemo(() => {
    const rnd = mulberry32(13);
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos.set([(rnd() - 0.5) * 30, rnd() * 16, 24 - rnd() * 70], i * 3);
      seed[i] = rnd();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    const m = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPx: { value: 1 } },
      vertexShader: /* glsl */ `
        attribute float aSeed; uniform float uTime; uniform float uPx; varying float vA;
        void main(){
          vec3 p = position;
          float t = uTime * (0.15 + aSeed * 0.2);
          p.x += sin(t + aSeed * 40.0) * 0.8;
          p.y += mod(t * 0.6 + aSeed * 16.0, 16.0) - aSeed * 2.0;
          p.z += cos(t * 0.7 + aSeed * 20.0) * 0.6;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          float size = (1.0 + aSeed * 2.4) * uPx;
          gl_PointSize = size * (30.0 / -mv.z);
          vA = (0.35 + 0.65 * abs(sin(uTime * (0.5 + aSeed) + aSeed * 30.0))) * smoothstep(60.0, 8.0, -mv.z) * smoothstep(0.5, 3.0, -mv.z);
        }
      `,
      fragmentShader: /* glsl */ `
        varying float vA;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          float a = smoothstep(0.5, 0.0, d) * vA * 0.75;
          gl_FragColor = vec4(vec3(1.0, 0.92, 0.7) * a, a);
        }
      `,
    });
    return { geometry: g, material: m };
  }, [count]);
  const { gl } = useThree();
  useEffect(() => {
    material.uniforms.uPx.value = gl.getPixelRatio();
  }, [gl, material]);
  useFrame((s) => {
    if (animate) material.uniforms.uTime.value = s.clock.elapsedTime;
  });
  return <points geometry={geometry} material={material} frustumCulled={false} renderOrder={6} />;
}

/* ── Ground mist: slow drifting noise sheets ───────────────────────── */
function Mist({ animate }: { animate: boolean }) {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uTime: { value: 0 }, uColor: { value: FOG_COLOR.clone().multiplyScalar(1.15) } },
        vertexShader: /* glsl */ `
          varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec3 uColor; varying vec3 vW;
          float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
          float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
            return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
          float fbm(vec2 p){ float v = 0., a = .5; for (int i=0;i<4;i++){ v += a*noise(p); p *= 2.03; a *= .5; } return v; }
          void main(){
            vec2 p = vW.xz * 0.045 + vec2(uTime * 0.012, uTime * 0.006);
            float n = fbm(p);
            float r = length(vW.xz - vec2(0.0, -10.0));
            float a = smoothstep(0.35, 0.85, n) * 0.42 * smoothstep(70.0, 25.0, r);
            gl_FragColor = vec4(uColor, a);
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
    <group>
      {[0.35, 0.9, 1.5].map((y, i) => (
        <mesh key={y} material={mat} rotation-x={-Math.PI / 2} position={[i * 7, y, -20]} renderOrder={4}>
          <planeGeometry args={[160, 160]} />
        </mesh>
      ))}
    </group>
  );
}

/* ── Distant parrots crossing the clearing (high tier only) ─────────── */
function Birds({ count, animate }: { count: number; animate: boolean }) {
  const gltf = useGLTF("/assets/models/Parrot.glb");
  const birds = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const obj = cloneSkinned(gltf.scene);
      obj.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          const m = (mesh.material as THREE.MeshStandardMaterial).clone();
          m.color = new THREE.Color("#b84a2c");
          m.roughness = 0.8;
          mesh.material = m;
        }
      });
      const mixer = new THREE.AnimationMixer(obj);
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
      action.time = i * 0.3;
      action.timeScale = 1.1 + i * 0.12;
      return { obj, mixer, speed: 0.045 + i * 0.012, offset: i * 0.37, height: 17 + i * 3.5, depth: -38 - i * 9 };
    });
  }, [gltf, count]);
  useFrame((_, dt) => {
    if (!animate) return;
    const t = performance.now() / 1000;
    for (const b of birds) {
      b.mixer.update(Math.min(dt, 0.05));
      const u = ((t * b.speed + b.offset) % 1) * 2 - 1; // -1..1 across
      b.obj.position.set(u * 55, b.height + Math.sin(t * 0.7 + b.offset * 9) * 1.2, b.depth + Math.sin(u * 2) * 5);
      b.obj.rotation.y = Math.PI / 2 - Math.cos(u * 2) * 0.12;
    }
  });
  return (
    <group>
      {birds.map((b, i) => (
        <primitive key={i} object={b.obj} scale={0.035} />
      ))}
    </group>
  );
}

/* ── Camera rig: scroll dolly + pointer parallax + idle breathing ──── */
function CameraRig({ progress, pointer, animate }: Pick<ForestProps, "progress" | "pointer" | "animate">) {
  const { camera, scene } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const smooth = useRef({ p: 0, x: 0, y: 0 });
  useFrame((state, dt) => {
    const s = smooth.current;
    const k = 1 - Math.exp(-dt * 3);
    s.p += (progress.current - s.p) * k;
    s.x += ((animate ? pointer.current.x : 0) - s.x) * k * 0.6;
    s.y += ((animate ? pointer.current.y : 0) - s.y) * k * 0.6;
    const p = s.p;
    const breathe = animate ? Math.sin(state.clock.elapsedTime * 0.25) * 0.12 : 0;
    camera.position.set(s.x * 0.9 + Math.sin(p * 2.2) * 0.8, 3.0 - p * 1.4 + breathe + s.y * 0.35, 21 - p * 30);
    look.set(s.x * 2.5, 7.5 + p * 4 - s.y * 1.5, camera.position.z - 30);
    camera.lookAt(look);
    const fog = scene.fog as THREE.FogExp2;
    if (fog) fog.density = FOG_DENSITY * (1 + p * 1.2);
  });
  return null;
}

function ReadySignal({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0);
  const done = useRef(false);
  useFrame(() => {
    if (done.current) return;
    if (++frames.current > 2) {
      done.current = true;
      onReady?.();
    }
  });
  return null;
}

export function ForestScene({ tier, progress, pointer, animate, onReady }: ForestProps) {
  const counts = COUNTS[tier];
  const { geometry: trunkGeo, tops } = useTrunks(counts.trees, counts.palms);
  const lianaGeo = useLianas(counts.lianas, tops);
  const bark = useMemo(() => createBarkTexture(), []);
  const ground = useMemo(() => createGroundTexture(), []);
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.FogExp2(FOG_COLOR, FOG_DENSITY);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  useEffect(
    () => () => {
      bark.dispose();
      ground.dispose();
      trunkGeo.dispose();
      lianaGeo?.dispose();
    },
    [bark, ground, trunkGeo, lianaGeo],
  );

  return (
    <>
      <Sky />
      <hemisphereLight args={["#d8dcae", "#3a2c1c", 1.2]} />
      {/* warm fill from the camera side so trunks are not pure silhouettes */}
      <directionalLight position={[-20, 14, 40]} intensity={0.9} color="#ffe0b0" />
      <directionalLight position={SUN_DIR.clone().multiplyScalar(60)} intensity={2.2} color={SUN_COLOR} />
      <ambientLight intensity={0.15} />

      <mesh geometry={trunkGeo}>
        <meshStandardMaterial map={bark} vertexColors roughness={0.95} metalness={0} />
      </mesh>
      {lianaGeo && (
        <mesh geometry={lianaGeo}>
          <meshStandardMaterial color="#3a3224" roughness={1} />
        </mesh>
      )}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -30]}>
        <planeGeometry args={[700, 700]} />
        <meshStandardMaterial map={ground} roughness={1} color="#9c8f78" />
      </mesh>

      <Foliage tops={tops} counts={counts} animate={animate} />
      <Mist animate={animate} />
      <LightShafts count={counts.rays} animate={animate} />
      <Motes count={counts.motes} animate={animate} />
      {counts.birds > 0 && <Birds count={counts.birds} animate={animate} />}

      <CameraRig progress={progress} pointer={pointer} animate={animate} />
      <ReadySignal onReady={onReady} />
    </>
  );
}

useGLTF.preload("/assets/models/Parrot.glb");
