/**
 * Straightening a photo of a scanner screen. The user marks the screen's four
 * corners; a homography maps them to a flat rectangle so that distances on the
 * screen become proportional to pixels again. Pure maths, no DOM.
 */

export interface Pt { x: number; y: number }
/** Row-major 3 × 3 matrix, last element 1. */
export type Mat3 = number[];

/** Solve A·x = b (n × n) by Gaussian elimination with partial pivoting. */
function solve(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-12) throw new Error("The corners do not form a usable shape.");
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) {
      const f = M[r][c] / M[c][c];
      for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k];
    }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) {
    let s = M[r][n];
    for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k];
    x[r] = s / M[r][r];
  }
  return x;
}

/** Homography taking each src[i] to dst[i] (four points each). */
export function homography(src: Pt[], dst: Pt[]): Mat3 {
  const A: number[][] = [], b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i], { x: u, y: v } = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]); b.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]); b.push(v);
  }
  return [...solve(A, b), 1];
}

export function applyH(H: Mat3, p: Pt): Pt {
  const w = H[6] * p.x + H[7] * p.y + H[8];
  return { x: (H[0] * p.x + H[1] * p.y + H[2]) / w, y: (H[3] * p.x + H[4] * p.y + H[5]) / w };
}

/** True when the four points (TL, TR, BR, BL) form a convex shape in that order. */
export function isConvexQuad(q: Pt[]): boolean {
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const a = q[i], b = q[(i + 1) % 4], c = q[(i + 2) % 4];
    const z = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
    if (Math.abs(z) < 1e-9) return false;
    const s = Math.sign(z);
    if (sign && s !== sign) return false;
    sign = s;
  }
  return true;
}

/**
 * Width : height of the screen from its corners when no aspect is given: the
 * mean lengths of opposite sides. Perspective shortens the far side, so this
 * is only an estimate; a known screen aspect is better.
 */
export function quadAspect(q: Pt[]): number {
  const d = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);
  const w = (d(q[0], q[1]) + d(q[3], q[2])) / 2, h = (d(q[0], q[3]) + d(q[1], q[2])) / 2;
  return w / h;
}

/**
 * Warp the quadrilateral `quad` (TL, TR, BR, BL in source pixels) of an RGBA
 * image to a dw × dh rectangle, with bilinear sampling. Outside the source is black.
 */
export function warpQuad(src: Uint8ClampedArray, sw: number, sh: number, quad: Pt[], dw: number, dh: number): Uint8ClampedArray {
  const Hinv = homography([{ x: 0, y: 0 }, { x: dw - 1, y: 0 }, { x: dw - 1, y: dh - 1 }, { x: 0, y: dh - 1 }], quad);
  const out = new Uint8ClampedArray(dw * dh * 4);
  for (let y = 0; y < dh; y++) {
    for (let x = 0; x < dw; x++) {
      const w = Hinv[6] * x + Hinv[7] * y + Hinv[8];
      const sx = (Hinv[0] * x + Hinv[1] * y + Hinv[2]) / w, sy = (Hinv[3] * x + Hinv[4] * y + Hinv[5]) / w;
      const o = (y * dw + x) * 4;
      out[o + 3] = 255;
      if (sx < 0 || sy < 0 || sx > sw - 1 || sy > sh - 1) continue;
      const x0 = Math.floor(sx), y0 = Math.floor(sy), x1 = Math.min(sw - 1, x0 + 1), y1 = Math.min(sh - 1, y0 + 1);
      const fx = sx - x0, fy = sy - y0;
      for (let c = 0; c < 3; c++) {
        const p = (xx: number, yy: number) => src[(yy * sw + xx) * 4 + c];
        out[o + c] = (1 - fy) * ((1 - fx) * p(x0, y0) + fx * p(x1, y0)) + fy * ((1 - fx) * p(x0, y1) + fx * p(x1, y1));
      }
    }
  }
  return out;
}

/** Output size for a straightened screen: `maxW` wide (or less for tall screens), keeping the aspect. */
export function outputSize(aspect: number, maxW = 1280, maxH = 960): { w: number; h: number } {
  let w = maxW, h = Math.round(maxW / aspect);
  if (h > maxH) { h = maxH; w = Math.round(maxH * aspect); }
  return { w, h };
}

/**
 * Black out horizontal bands of an RGBA image in place (the patient banner at
 * the top of the scanner screen, and anything else the user marks).
 * Bands are [fromY, toY) in pixels.
 */
export function maskBands(rgba: Uint8ClampedArray, w: number, h: number, bands: [number, number][]): void {
  for (const [a, b] of bands) {
    const y0 = Math.max(0, Math.floor(a)), y1 = Math.min(h, Math.ceil(b));
    for (let y = y0; y < y1; y++) rgba.fill(0, y * w * 4, (y + 1) * w * 4);
    for (let y = y0; y < y1; y++) for (let x = 0; x < w; x++) rgba[(y * w + x) * 4 + 3] = 255;
  }
}

/** Black out rectangles in place. */
export function maskRects(rgba: Uint8ClampedArray, w: number, h: number, rects: { x: number; y: number; w: number; h: number }[]): void {
  for (const r of rects) {
    const x0 = Math.max(0, Math.floor(Math.min(r.x, r.x + r.w))), x1 = Math.min(w, Math.ceil(Math.max(r.x, r.x + r.w)));
    const y0 = Math.max(0, Math.floor(Math.min(r.y, r.y + r.h))), y1 = Math.min(h, Math.ceil(Math.max(r.y, r.y + r.h)));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * w + x) * 4; rgba[i] = rgba[i + 1] = rgba[i + 2] = 0; rgba[i + 3] = 255; }
  }
}
