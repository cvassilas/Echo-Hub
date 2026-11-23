/**
 * Scale for a photographed screen. A photo has no DICOM calibration, so the
 * scale comes from what the scanner draws: the depth ruler beside the 2D
 * sector (evenly spaced ticks or dots), or two points the user taps with a
 * known distance between them. Pure maths, no DOM.
 */
import type { Pt } from "./geometry";

const lumAt = (rgba: Uint8ClampedArray, w: number, x: number, y: number) => {
  const i = (y * w + x) * 4;
  return 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
};

export interface Ticks {
  /** Pixels between neighbouring ticks along the profile. */
  period: number;
  /** Positions (profile indices) of the ticks found. */
  ticks: number[];
  /** 0–1: how regular the ticks are (1 = perfectly even). */
  regularity: number;
}

/**
 * Evenly spaced bright ticks along a brightness profile. The period comes from
 * the autocorrelation, then is refined by a straight-line fit through the
 * tick peaks. Undefined when fewer than four regular ticks are found.
 */
export function findTicks(profile: number[], minPeriod = 6): Ticks | undefined {
  const n = profile.length;
  if (n < minPeriod * 4) return undefined;
  // Remove slow changes in brightness so only the ticks remain.
  const h = Math.max(3, Math.round(minPeriod * 2));
  const base = profile.map((_, i) => {
    let s = 0, c = 0;
    for (let k = Math.max(0, i - h); k <= Math.min(n - 1, i + h); k++) { s += profile[k]; c++; }
    return s / c;
  });
  const d = profile.map((v, i) => Math.max(0, v - base[i]));
  const mean = d.reduce((a, b) => a + b, 0) / n;
  const z = d.map((v) => v - mean);
  const energy = z.reduce((a, b) => a + b * b, 0);
  if (energy <= 1e-6) return undefined;
  const maxLag = Math.floor(n / 4);
  const ac: number[] = [];
  for (let lag = 0; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i + lag < n; i++) s += z[i] * z[i + lag];
    ac.push(s / energy);
  }
  // Local maxima of the autocorrelation; the shortest lag that is nearly as
  // strong as the best one is the tick spacing (not a multiple of it).
  const peaks: number[] = [];
  for (let lag = minPeriod; lag < maxLag; lag++) if (ac[lag] > ac[lag - 1] && ac[lag] >= ac[lag + 1] && ac[lag] > 0.15) peaks.push(lag);
  if (!peaks.length) return undefined;
  const best = Math.max(...peaks.map((l) => ac[l]));
  const lag0 = peaks.find((l) => ac[l] >= 0.8 * best)!;
  // Sub-pixel lag by a parabola through the peak.
  const a = ac[lag0 - 1], b = ac[lag0], c = ac[lag0 + 1] ?? b;
  const den = a - 2 * b + c;
  const period0 = lag0 + (den !== 0 ? (0.5 * (a - c)) / den : 0);

  // Tick peaks: the brightest point in each window of one period, if bright enough.
  const sorted = [...d].sort((p, q) => p - q);
  const thr = sorted[Math.floor(0.5 * n)] + 0.3 * (sorted[n - 1] - sorted[Math.floor(0.5 * n)]);
  const ticks: number[] = [];
  let i = 0;
  while (i < n) {
    let m = i;
    const end = Math.min(n, Math.round(i + period0));
    for (let k = i; k < end; k++) if (d[k] > d[m]) m = k;
    if (d[m] >= thr && (!ticks.length || m - ticks[ticks.length - 1] > 0.5 * period0)) {
      // Centre of the tick: brightness-weighted mean around the peak.
      let s = 0, w = 0;
      for (let k = Math.max(0, m - 2); k <= Math.min(n - 1, m + 2); k++) { s += k * d[k]; w += d[k]; }
      ticks.push(w ? s / w : m);
      i = Math.round(m + 0.5 * period0);
    } else i = end;
  }
  if (ticks.length < 4) return undefined;
  // Straight-line fit of tick position against tick number (missing ticks allowed).
  const idx = ticks.map((t) => Math.round((t - ticks[0]) / period0));
  const k = idx.length, mx = idx.reduce((p, q) => p + q, 0) / k, my = ticks.reduce((p, q) => p + q, 0) / k;
  let sxy = 0, sxx = 0;
  for (let j = 0; j < k; j++) { sxy += (idx[j] - mx) * (ticks[j] - my); sxx += (idx[j] - mx) ** 2; }
  if (sxx === 0) return undefined;
  const period = sxy / sxx;
  const resid = Math.sqrt(ticks.reduce((s, t, j) => s + (t - (my + period * (idx[j] - mx))) ** 2, 0) / k);
  const regularity = Math.max(0, 1 - resid / (0.25 * period));
  return regularity > 0.4 ? { period, ticks, regularity } : undefined;
}

/** Brightness along a line, taking the brightest of 3 pixels across it (thin ticks are not missed). */
export function lineMaxProfile(rgba: Uint8ClampedArray, w: number, h: number, a: Pt, b: Pt): number[] {
  const len = Math.max(2, Math.round(Math.hypot(b.x - a.x, b.y - a.y)));
  const nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len;
  const out: number[] = [];
  for (let k = 0; k <= len; k++) {
    const t = k / len;
    let m = 0;
    for (let o = -1; o <= 1; o++) {
      const x = Math.round(a.x + t * (b.x - a.x) + o * nx), y = Math.round(a.y + t * (b.y - a.y) + o * ny);
      if (x >= 0 && y >= 0 && x < w && y < h) m = Math.max(m, lumAt(rgba, w, x, y));
    }
    out.push(m);
  }
  return out;
}

export interface Ruler {
  /** Ends of the ruler line in image pixels. */
  a: Pt;
  b: Pt;
  /** Pixels between ticks. */
  period: number;
  /** Tick centres in image pixels. */
  ticks: Pt[];
  regularity: number;
}

/** Ticks along a line the user drew over the ruler. */
export function rulerAlong(rgba: Uint8ClampedArray, w: number, h: number, a: Pt, b: Pt): Ruler | undefined {
  const p = lineMaxProfile(rgba, w, h, a, b);
  const t = findTicks(p);
  if (!t) return undefined;
  const len = p.length - 1;
  const at = (s: number): Pt => ({ x: a.x + (s / len) * (b.x - a.x), y: a.y + (s / len) * (b.y - a.y) });
  return { a, b, period: (t.period / len) * Math.hypot(b.x - a.x, b.y - a.y), ticks: t.ticks.map(at), regularity: t.regularity };
}

/**
 * Looks for a vertical depth ruler anywhere on the straightened screen: the
 * column (between `top` and `bottom`) whose brightness has the most regular
 * row of ticks. Ultrasound speckle and text are irregular, so they score low.
 * The scanner's ECG, Doppler time marks and menus can also be periodic, so the
 * result is always shown for the user to confirm.
 */
export function autoFindRuler(rgba: Uint8ClampedArray, w: number, h: number, top = 0.08, bottom = 0.97): Ruler | undefined {
  const y0 = Math.round(top * h), y1 = Math.round(bottom * h);
  let best: { x: number; t: Ticks; score: number } | undefined;
  for (let x = 2; x < w - 2; x += 2) {
    const p: number[] = [];
    for (let y = y0; y <= y1; y++) p.push(Math.max(lumAt(rgba, w, x - 1, y), lumAt(rgba, w, x, y), lumAt(rgba, w, x + 1, y)));
    // A ruler column is mostly dark between its ticks.
    const dark = p.filter((v) => v < 60).length / p.length;
    if (dark < 0.6) continue;
    const t = findTicks(p);
    if (!t || t.ticks.length < 5 || t.regularity < 0.75) continue;
    // Ticks stand out clearly from the dark column, and few are missing between the first and last.
    const sorted = [...p].sort((q, r) => q - r), med = sorted[p.length >> 1];
    const tickLum = t.ticks.reduce((s, k) => s + p[Math.round(k)], 0) / t.ticks.length;
    if (tickLum < med + 60) continue;
    const span = (t.ticks[t.ticks.length - 1] - t.ticks[0]) / t.period + 1;
    if (t.ticks.length < 0.75 * span) continue;
    const score = t.regularity * Math.min(t.ticks.length, 25);
    if (!best || score > best.score) best = { x, t, score };
  }
  if (!best) return undefined;
  const { x, t } = best;
  const first = t.ticks[0], last = t.ticks[t.ticks.length - 1];
  return {
    a: { x, y: y0 + first }, b: { x, y: y0 + last }, period: t.period,
    ticks: t.ticks.map((s) => ({ x, y: y0 + s })), regularity: t.regularity,
  };
}

/** Centimetres per pixel from a ruler and the distance between its ticks (cm). */
export const cmPerPxFromRuler = (r: Ruler, tickCm: number) => tickCm / r.period;

/** Units per pixel from two tapped points and the known distance between them. */
export function perPxFromPoints(a: Pt, b: Pt, distance: number): number {
  const px = Math.hypot(b.x - a.x, b.y - a.y);
  if (px < 5) throw new Error("The two points are too close together.");
  return distance / px;
}
