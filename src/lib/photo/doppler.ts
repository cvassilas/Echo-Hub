/**
 * Spectral Doppler envelope and beats on a photographed screen. Ported from
 * EchoStudy (packages/core/src/auto/doppler.ts, REQ-AUTO-002), with the scale
 * coming from the user's taps instead of DICOM: for each column, walk out from
 * the baseline and stop at the first dark gap. Classic image processing, no AI.
 */
import type { Pt } from "./geometry";

/** The spectral strip on the straightened screen and its scale. */
export interface DopplerScale {
  /** Strip bounds in image pixels (inclusive). */
  x0: number;
  x1: number;
  top: number;
  bottom: number;
  /** Row of the zero-velocity baseline. */
  baseY: number;
  /** Speed per pixel, cm/s (always positive). */
  cmsPerPx: number;
  /** Time per pixel, seconds. Without it, VTI and beat timing are not given. */
  secPerPx?: number;
}

export interface DopplerBeat {
  startX: number;
  endX: number;
  peakX: number;
  peakVelocityMs: number;
  /** Only when the time scale is known. */
  vtiCm?: number;
  meanGradientMmHg: number;
  durationMs?: number;
}

export interface AutoDopplerResult {
  side: "above" | "below";
  envelope: Pt[];
  beats: DopplerBeat[];
  mean: { peakVelocityMs: number; vtiCm?: number; meanGradientMmHg: number } | undefined;
  warnings: string[];
}

function percentile(values: number[], p: number): number {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
}

function median(arr: number[], i: number, half: number): number {
  const w = arr.slice(Math.max(0, i - half), i + half + 1).sort((a, b) => a - b);
  return w[w.length >> 1];
}

const SG11 = [-36, 9, 44, 69, 84, 89, 84, 69, 44, 9, -36].map((c) => c / 429);

/** Savitzky–Golay smoothing (quadratic, 11-point window); ends use a shrinking mean. */
export function savitzkyGolay(a: number[]): number[] {
  const h = 5;
  return a.map((_, i) => {
    if (i < h || i >= a.length - h) {
      const w = a.slice(Math.max(0, i - 2), i + 3);
      return w.reduce((p, q) => p + q, 0) / w.length;
    }
    let v = 0;
    for (let k = -h; k <= h; k++) v += SG11[k + h] * a[i + k];
    return v;
  });
}

/** Envelope depth from the baseline (pixels) on each side, per column. */
export function spectralEnvelopes(rgba: Uint8ClampedArray, imgW: number, s: DopplerScale): { above: number[]; below: number[]; warnings: string[] } {
  const warnings: string[] = [];
  const { x0, x1, top, bottom } = s;
  const base = Math.round(s.baseY);
  const H = bottom - top + 1, W = x1 - x0 + 1;
  // Overlays (ECG in green, cyan or blue) count as background; spectra are grey or amber.
  const lum = new Float32Array(W * H);
  for (let y = top; y <= bottom; y++) for (let x = x0; x <= x1; x++) {
    const i = (y * imgW + x) * 4;
    const r = rgba[i], gr = rgba[i + 1], b = rgba[i + 2];
    const coloured = r < 0.7 * gr || b > Math.max(r, gr) + 30;
    lum[(y - top) * W + (x - x0)] = coloured ? 0 : 0.299 * r + 0.587 * gr + 0.114 * b;
  }
  const sm = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let a = 0, n = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const yy = y + dy, xx = x + dx;
      if (yy >= 0 && yy < H && xx >= 0 && xx < W) { a += lum[yy * W + xx]; n++; }
    }
    sm[y * W + x] = a / n;
  }
  const g = (x: number, y: number) => sm[(y - top) * W + (x - x0)];
  const sample: number[] = [];
  for (let i = 0; i < sm.length; i += 7) sample.push(sm[i]);
  const noise = percentile(sample, 0.6), bright = percentile(sample, 0.995);
  const T = noise + 0.4 * (bright - noise);
  if (bright - noise < 20) warnings.push("Very low contrast in the Doppler strip: retake the photo with less glare.");
  const gap = Math.max(6, Math.round(0.04 * H));
  const skip = 3;
  const trace = (dir: 1 | -1): number[] => {
    const out: number[] = [];
    const limit = dir === 1 ? bottom - base : base - top;
    for (let x = x0; x <= x1; x++) {
      let last = 0, dark = 0;
      for (let d = skip; d <= limit; d++) {
        if (g(x, base + dir * d) > T) { last = d; dark = 0; }
        else if (++dark > gap && (last > 0 || d > skip + Math.max(gap, 0.25 * limit))) break;
      }
      out.push(last);
    }
    return out;
  };
  const filt = (a: number[]) => savitzkyGolay(a.map((_, i) => median(a, i, 2))).map((v) => Math.max(0, v));
  return { above: filt(trace(-1)), below: filt(trace(1)), warnings };
}

export function autoDoppler(rgba: Uint8ClampedArray, imgW: number, s: DopplerScale, side?: "above" | "below"): AutoDopplerResult {
  const env = spectralEnvelopes(rgba, imgW, s);
  const warnings = [...env.warnings];
  const reach = (a: number[]) => percentile(a, 0.95);
  const sd = side ?? (reach(env.above) > reach(env.below) ? "above" : "below");
  const dist = sd === "below" ? env.below : env.above;
  const base = Math.round(s.baseY);
  const maxDepth = sd === "below" ? s.bottom - base : base - s.top;
  const vel = dist.map((d) => (d * s.cmsPerPx) / 100); // m/s
  const envelope: Pt[] = dist.map((d, i) => ({ x: s.x0 + i, y: sd === "below" ? base + d : base - d }));
  const vmax = Math.max(...vel);
  const beats: DopplerBeat[] = [];
  if (!(vmax > 0)) return { side: sd, envelope, beats, mean: undefined, warnings: [...warnings, "No Doppler signal found."] };
  const dt = s.secPerPx;
  let i = 0;
  while (i < vel.length) {
    if (vel[i] < 0.2 * vmax) { i++; continue; }
    let a = i, b = i;
    while (b + 1 < vel.length && vel[b + 1] >= 0.2 * vmax) b++;
    i = b + 1;
    while (a > 0 && vel[a - 1] >= 0.05 * vmax) a--;
    while (b + 1 < vel.length && vel[b + 1] >= 0.05 * vmax) b++;
    if (a === 0 || b === vel.length - 1) continue; // partial beat at the edge
    if (b - a < 4) continue;
    const durationMs = dt ? (b - a) * dt * 1000 : undefined;
    if (durationMs !== undefined && durationMs < 60) continue;
    if (durationMs !== undefined && durationMs > 900) { warnings.push("A signal longer than 900 ms was ignored (probably not one beat)."); continue; }
    // Mean gradient is a time average, so it needs no time scale: mean of 4v² over the beat.
    let peak = a, vti = 0, grad = 0;
    for (let k = a; k <= b; k++) {
      if (vel[k] > vel[peak]) peak = k;
      if (k > a) {
        const v0 = vel[k - 1], v1 = vel[k];
        vti += (v0 + v1) / 2;
        grad += (4 * (v0 * v0 + v0 * v1 + v1 * v1)) / 3;
      }
    }
    beats.push({ startX: s.x0 + a, endX: s.x0 + b, peakX: s.x0 + peak, peakVelocityMs: vel[peak], vtiCm: dt ? vti * dt * 100 : undefined, meanGradientMmHg: grad / (b - a), durationMs });
  }
  if (beats.length === 0) warnings.push("No complete beats found: include at least one whole beat inside the strip.");
  if (dist.some((d) => d >= maxDepth - 2)) warnings.push("The envelope reaches the edge of the scale: possible aliasing or a clipped signal. Check the peaks.");
  if (beats.length > 1) {
    const pk = beats.map((b) => b.peakVelocityMs);
    const m = pk.reduce((a, b) => a + b, 0) / pk.length;
    const sdv = Math.sqrt(pk.reduce((a, b) => a + (b - m) ** 2, 0) / pk.length);
    if (sdv / m > 0.2) warnings.push("Peak velocity varies more than 20% between beats: check each beat.");
  }
  const avg = (f: (b: DopplerBeat) => number) => beats.reduce((acc, bt) => acc + f(bt), 0) / beats.length;
  const mean = beats.length ? { peakVelocityMs: avg((b) => b.peakVelocityMs), vtiCm: dt ? avg((b) => b.vtiCm!) : undefined, meanGradientMmHg: avg((b) => b.meanGradientMmHg) } : undefined;
  return { side: sd, envelope, beats, mean, warnings };
}

/** Speed in m/s at a row, from the baseline (always positive). */
export const speedAtY = (s: DopplerScale, y: number) => (Math.abs(y - s.baseY) * s.cmsPerPx) / 100;
