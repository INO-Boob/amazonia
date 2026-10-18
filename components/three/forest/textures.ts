import * as THREE from "three";
import { mulberry32 } from "@/lib/utils";

/**
 * Procedural textures painted on <canvas> at runtime — no downloads needed.
 * Leaf atlas (2×2 cells, base of each leaf at bottom centre):
 *   0: broadleaf cluster   1: pinnate palm frond
 *   2: heliconia-like banana leaf with tears   3: fern
 */

type Ctx = CanvasRenderingContext2D;

function leafPath(ctx: Ctx, len: number, w: number, asym = 0) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(w * (1 + asym), -len * 0.22, w * 0.85, -len * 0.78, 0, -len);
  ctx.bezierCurveTo(-w * 0.85, -len * 0.78, -w * (1 - asym), -len * 0.22, 0, 0);
  ctx.closePath();
}

function shadeLeaf(ctx: Ctx, len: number, w: number, base: string, tip: string, rib: string, asym = 0, veins = 6) {
  const g = ctx.createLinearGradient(0, 0, 0, -len);
  g.addColorStop(0, base);
  g.addColorStop(1, tip);
  leafPath(ctx, len, w, asym);
  ctx.fillStyle = g;
  ctx.fill();
  // midrib
  ctx.strokeStyle = rib;
  ctx.lineWidth = Math.max(1, w * 0.06);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(w * 0.05, -len * 0.5, 0, -len * 0.97);
  ctx.stroke();
  // lateral veins
  ctx.lineWidth = Math.max(0.6, w * 0.025);
  ctx.globalAlpha = 0.45;
  for (let i = 1; i <= veins; i++) {
    const y = -len * (i / (veins + 1));
    const span = w * 0.8 * Math.sin((i / (veins + 1)) * Math.PI);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(span * 0.5, y - len * 0.04, span, y - len * 0.1);
    ctx.moveTo(0, y);
    ctx.quadraticCurveTo(-span * 0.5, y - len * 0.04, -span, y - len * 0.1);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

const GREENS = [
  ["#1e3a1c", "#4f7a32", "#6d9a45"],
  ["#22401f", "#5c8a3a", "#88b058"],
  ["#1a3320", "#3f6d38", "#5f8f4a"],
  ["#2b4a1f", "#6c9440", "#9cbb5e"],
];

function drawCluster(ctx: Ctx, S: number, rnd: () => number) {
  ctx.save();
  ctx.translate(S / 2, S * 0.98);
  // twig
  ctx.strokeStyle = "#3a2c1c";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(10, -S * 0.3, -6, -S * 0.55);
  ctx.stroke();
  for (let i = 0; i < 34; i++) {
    const t = rnd();
    const [b, m, tip] = GREENS[Math.floor(rnd() * GREENS.length)];
    ctx.save();
    const py = -S * (0.12 + t * 0.55);
    ctx.translate((rnd() - 0.5) * 30, py);
    ctx.rotate((rnd() - 0.5) * 2.6);
    const len = S * (0.22 + rnd() * 0.16);
    shadeLeaf(ctx, len, len * (0.2 + rnd() * 0.08), b, rnd() > 0.5 ? m : tip, "rgba(200,220,150,0.5)", (rnd() - 0.5) * 0.4, 5);
    ctx.restore();
  }
  ctx.restore();
}

function drawFrond(ctx: Ctx, S: number, rnd: () => number) {
  ctx.save();
  ctx.translate(S / 2, S * 0.99);
  const pts: [number, number][] = [];
  const N = 34;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    pts.push([Math.sin(t * 1.4) * S * 0.08, -t * S * 0.95]);
  }
  ctx.strokeStyle = "#5b6a2e";
  ctx.lineWidth = 5;
  ctx.beginPath();
  pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.stroke();
  for (let i = 3; i < N; i++) {
    const [x, y] = pts[i];
    const t = i / N;
    const len = S * 0.34 * Math.sin(Math.min(1, t * 1.15) * Math.PI) + 18;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(side * (0.75 + rnd() * 0.25) + (rnd() - 0.5) * 0.15);
      const [b, m] = GREENS[Math.floor(rnd() * GREENS.length)];
      shadeLeaf(ctx, len, 7 + rnd() * 3, b, m, "rgba(210,220,160,0.45)", 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}

function drawBanana(ctx: Ctx, S: number, rnd: () => number) {
  ctx.save();
  ctx.translate(S / 2, S * 0.99);
  ctx.rotate(0.06);
  const len = S * 0.95;
  const w = S * 0.27;
  const g = ctx.createLinearGradient(-w, 0, w, 0);
  g.addColorStop(0, "#2f5a26");
  g.addColorStop(0.5, "#5e9440");
  g.addColorStop(1, "#3c6c2c");
  leafPath(ctx, len, w, 0.05);
  ctx.fillStyle = g;
  ctx.fill();
  // parallel veins
  ctx.strokeStyle = "rgba(20,40,15,0.35)";
  ctx.lineWidth = 1.2;
  for (let i = 0; i < 46; i++) {
    const y = -len * (0.06 + (i / 46) * 0.9);
    const span = w * 0.92 * Math.sin((0.06 + (i / 46) * 0.9) * Math.PI);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(span, y - 22);
    ctx.moveTo(0, y);
    ctx.lineTo(-span, y - 22);
    ctx.stroke();
  }
  ctx.strokeStyle = "#a9bd74";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -len * 0.97);
  ctx.stroke();
  // wind tears (cut out)
  ctx.globalCompositeOperation = "destination-out";
  for (let i = 0; i < 4; i++) {
    const y = -len * (0.25 + rnd() * 0.6);
    const side = rnd() > 0.5 ? 1 : -1;
    ctx.beginPath();
    ctx.moveTo(side * 6, y);
    ctx.lineTo(side * w * 1.1, y - 34);
    ctx.lineTo(side * w * 1.1, y - 30);
    ctx.lineWidth = 2 + rnd() * 2;
    ctx.stroke();
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();
}

function drawFern(ctx: Ctx, S: number, rnd: () => number) {
  ctx.save();
  ctx.translate(S / 2, S * 0.99);
  const N = 40;
  ctx.strokeStyle = "#3d5a26";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const x = Math.sin(t * 2.2) * S * 0.12;
    const y = -t * S * 0.94;
    if (i) ctx.lineTo(x, y);
    else ctx.moveTo(x, y);
  }
  ctx.stroke();
  for (let i = 2; i < N; i++) {
    const t = i / N;
    const x = Math.sin(t * 2.2) * S * 0.12;
    const y = -t * S * 0.94;
    const len = S * 0.2 * (1 - t) + 10;
    for (const side of [-1, 1]) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(side * 1.15 + (rnd() - 0.5) * 0.2);
      // pinna made of small lobes
      for (let k = 0; k < 6; k++) {
        ctx.save();
        ctx.translate(0, -len * (k / 6));
        ctx.rotate(0.9);
        shadeLeaf(ctx, len * 0.22, len * 0.07 + 1, "#2f5524", "#6e9a45", "rgba(0,0,0,0)", 0, 0);
        ctx.restore();
        ctx.save();
        ctx.translate(0, -len * (k / 6));
        ctx.rotate(-0.9);
        shadeLeaf(ctx, len * 0.22, len * 0.07 + 1, "#2f5524", "#6e9a45", "rgba(0,0,0,0)", 0, 0);
        ctx.restore();
      }
      ctx.restore();
    }
  }
  ctx.restore();
}

export function createLeafAtlas(size = 1024): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const S = size / 2;
  const rnd = mulberry32(7);
  const cells = [drawCluster, drawFrond, drawBanana, drawFern];
  cells.forEach((fn, i) => {
    ctx.save();
    // atlas row 0 is at the bottom in UV space → paint cells 0,1 in the lower half
    const cx = (i % 2) * S;
    const cy = (1 - Math.floor(i / 2)) * S;
    ctx.translate(cx, cy);
    ctx.beginPath();
    ctx.rect(0, 0, S, S);
    ctx.clip();
    fn(ctx, S, rnd);
    ctx.restore();
  });
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  return tex;
}

export function createBarkTexture(): THREE.CanvasTexture {
  const w = 256;
  const h = 512;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const rnd = mulberry32(11);
  ctx.fillStyle = "#6b5f4c";
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 900; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const l = 20 + rnd() * 90;
    const v = Math.floor(70 + rnd() * 70);
    ctx.strokeStyle = `rgba(${v},${v - 8},${v - 22},${0.15 + rnd() * 0.35})`;
    ctx.lineWidth = 1 + rnd() * 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + (rnd() - 0.5) * 6, y + l * 0.3, x + (rnd() - 0.5) * 6, y + l * 0.6, x + (rnd() - 0.5) * 4, y + l);
    ctx.stroke();
  }
  // lichen & moss patches
  for (let i = 0; i < 70; i++) {
    const x = rnd() * w;
    const y = rnd() * h;
    const r = 4 + rnd() * 22;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const moss = rnd() > 0.4;
    g.addColorStop(0, moss ? "rgba(92,120,58,0.55)" : "rgba(190,190,170,0.35)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

export function createGroundTexture(): THREE.CanvasTexture {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;
  const rnd = mulberry32(3);
  ctx.fillStyle = "#2a2116";
  ctx.fillRect(0, 0, s, s);
  const cols = ["#4a3620", "#5d4526", "#3a2a18", "#6b5530", "#2f3a1c", "#7a5a2c"];
  for (let i = 0; i < 2600; i++) {
    ctx.save();
    ctx.translate(rnd() * s, rnd() * s);
    ctx.rotate(rnd() * Math.PI * 2);
    ctx.fillStyle = cols[Math.floor(rnd() * cols.length)];
    ctx.globalAlpha = 0.5 + rnd() * 0.5;
    const l = 4 + rnd() * 14;
    leafPath(ctx, l, l * 0.35);
    ctx.fill();
    ctx.restore();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(26, 26);
  tex.anisotropy = 8;
  return tex;
}
