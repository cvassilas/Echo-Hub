/**
 * Edge finding along a line drawn across a structure. Ported from EchoStudy
 * (packages/core/src/auto/caliper.ts, REQ-AUTO-007): the blood–tissue
 * boundaries are found along the line on every frame. Classic image
 * processing, no AI. The results are proposals the user checks and drags.
 */
import type { Pt } from "./geometry";

/** Luminance along a line, averaged over a 5-pixel-wide band. */
export function lineProfile(rgba: Uint8ClampedArray | Uint8Array, imgW: number, imgH: number, a: Pt, b: Pt, n: number): number[] {
  const out: number[] = [];
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const nx = -(b.y - a.y) / len, ny = (b.x - a.x) / len;
  const lum = (x: number, y: number) => {
    const xi = Math.min(imgW - 1, Math.max(0, Math.round(x))), yi = Math.min(imgH - 1, Math.max(0, Math.round(y)));
    const i = (yi * imgW + xi) * 4;
    return 0.299 * rgba[i] + 0.587 * rgba[i + 1] + 0.114 * rgba[i + 2];
  };
  for (let k = 0; k < n; k++) {
    const t = k / (n - 1);
    const x = a.x + t * (b.x - a.x), y = a.y + t * (b.y - a.y);
    let v = 0;
    for (let o = -2; o <= 2; o++) v += lum(x + o * nx, y + o * ny);
    out.push(v / 5);
  }
  return out;
}

function smooth(a: number[], h = 2): number[] {
  return a.map((_, i) => { let s = 0, c = 0; for (let k = -h; k <= h; k++) { const j = i + k; if (j >= 0 && j < a.length) { s += a[j]; c++; } } return s / c; });
}

/** Otsu threshold of a set of values (0–255). */
export function otsu(values: number[]): number {
  const hist = new Array(256).fill(0);
  for (const v of values) hist[Math.max(0, Math.min(255, Math.round(v)))]++;
  const total = values.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0, wB = 0, best = 0, t = 127;
  for (let i = 0; i < 256; i++) {
    wB += hist[i];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += i * hist[i];
    const mB = sumB / wB, mF = (sum - sumB) / wF;
    const between = wB * wF * (mB - mF) ** 2;
    if (between > best) { best = between; t = i; }
  }
  return t;
}

interface Run { start: number; end: number; blood: boolean }

/** True when blood and tissue are clearly different along the line. A photo loses contrast, so the bar is lower than for DICOM. */
function hasContrast(p: number[], thr: number): boolean {
  const lo = p.filter((v) => v <= thr), hi = p.filter((v) => v > thr);
  if (!lo.length || !hi.length) return false;
  const m = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
  return m(hi) - m(lo) >= 30;
}

function runs(p: number[], thr: number): Run[] {
  const out: Run[] = [];
  for (let i = 0; i < p.length; i++) {
    const blood = p[i] <= thr;
    const last = out[out.length - 1];
    if (last && last.blood === blood) last.end = i; else out.push({ start: i, end: i, blood });
  }
  // Merge very short runs (speckle) into their neighbours.
  const min = Math.max(2, Math.round(0.02 * p.length));
  for (let k = 1; k < out.length - 1; k++) {
    if (out[k].end - out[k].start + 1 < min) { out[k - 1].end = out[k + 1].end; out.splice(k, 2); k = Math.max(0, k - 2); }
  }
  return out;
}

export interface LvLine {
  /** Fractions (0–1) along the line: anterior septum, septum/cavity, cavity/posterior wall, posterior wall/pericardium. */
  septumStart?: number;
  cavityStart: number;
  cavityEnd: number;
  wallEnd?: number;
}

/** PLAX LV along a line from the RV through the septum, LV cavity and posterior wall. */
export function lvAlongLine(profile: number[]): LvLine | undefined {
  const p = smooth(profile);
  const thr = otsu(p);
  if (!hasContrast(p, thr)) return undefined;
  const r = runs(p, thr);
  const n = p.length;
  // LV cavity: the longest blood run that does not touch either end.
  const inner = r.filter((x) => x.blood && x.start > 0 && x.end < n - 1);
  if (inner.length === 0) return undefined;
  const cav = inner.reduce((a, b) => (b.end - b.start > a.end - a.start ? b : a));
  const ci = r.indexOf(cav);
  const before = r[ci - 1], rv = r[ci - 2];
  const septumStart = before && !before.blood && rv && rv.blood ? before.start : undefined;
  // Posterior wall: from the cavity to where the bright pericardium begins.
  let wallEnd: number | undefined;
  const after = r[ci + 1];
  if (after && !after.blood) {
    const seg = p.slice(after.start, after.end + 1);
    const peak = Math.max(...seg);
    const k = seg.findIndex((v) => v >= 0.85 * peak);
    wallEnd = k > 1 ? after.start + k : after.end;
  }
  return { septumStart: septumStart === undefined ? undefined : septumStart / (n - 1), cavityStart: (cav.start - 0.5) / (n - 1), cavityEnd: (cav.end + 0.5) / (n - 1), wallEnd: wallEnd === undefined ? undefined : wallEnd / (n - 1) };
}

/** Vessel or chamber lumen (aorta, LVOT, IVC): the blood run containing the middle of the line. */
export function lumenAlongLine(profile: number[]): { start: number; end: number } | undefined {
  const p = smooth(profile);
  const thr = otsu(p);
  if (!hasContrast(p, thr)) return undefined;
  const r = runs(p, thr);
  const n = p.length, mid = (n - 1) / 2;
  const lumen = r.find((x) => x.blood && x.start <= mid && x.end >= mid && x.start > 0 && x.end < n - 1)
    ?? r.filter((x) => x.blood && x.start > 0 && x.end < n - 1).sort((a, b) => (b.end - b.start) - (a.end - a.start))[0];
  return lumen ? { start: (lumen.start - 0.5) / (n - 1), end: (lumen.end + 0.5) / (n - 1) } : undefined;
}

export const along = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });

export interface Caliper {
  /** What the caliper proposes, e.g. ivsd (an Echo Hub report field key). */
  id: string;
  frame: number;
  a: Pt;
  b: Pt;
}

export interface LvCalipers {
  calipers: Caliper[];
  edFrame: number;
  esFrame: number;
  warnings: string[];
}

/**
 * PLAX LV dimensions from the edges found on each frame. Diastole is the frame
 * with the widest cavity and systole the narrowest (no ECG), so the frames are
 * shown for the user to check.
 */
export function lvCalipers(lines: (LvLine | undefined)[], frames: number[], a: Pt, b: Pt): LvCalipers | undefined {
  const found = lines.map((l, i) => ({ l, f: frames[i] })).filter((x): x is { l: LvLine; f: number } => !!x.l);
  if (found.length === 0) return undefined;
  const width = (l: LvLine) => l.cavityEnd - l.cavityStart;
  const ed = found.reduce((p, q) => (width(q.l) > width(p.l) ? q : p));
  const es = found.reduce((p, q) => (width(q.l) < width(p.l) ? q : p));
  const warnings: string[] = [];
  if (found.length < lines.length / 2) warnings.push("The walls were found on fewer than half the frames: check the line crosses the septum, cavity and posterior wall.");
  if (frames.length > 1 && width(es.l) > 0.9 * width(ed.l)) warnings.push("The cavity hardly changes size through the clip: check the diastolic and systolic frames.");
  if (ed.l.septumStart === undefined) warnings.push("The front of the septum was not found: start the line in the RV cavity to get IVSd.");
  if (ed.l.wallEnd === undefined) warnings.push("The back of the posterior wall was not found: end the line beyond the pericardium to get LVPWd.");
  const at = (t: number) => along(a, b, t);
  const calipers: Caliper[] = [];
  if (ed.l.septumStart !== undefined) calipers.push({ id: "ivsd", frame: ed.f, a: at(ed.l.septumStart), b: at(ed.l.cavityStart) });
  calipers.push({ id: "lvidd", frame: ed.f, a: at(ed.l.cavityStart), b: at(ed.l.cavityEnd) });
  if (ed.l.wallEnd !== undefined) calipers.push({ id: "lvpwd", frame: ed.f, a: at(ed.l.cavityEnd), b: at(ed.l.wallEnd) });
  if (frames.length > 1 && es.f !== ed.f) calipers.push({ id: "lvids", frame: es.f, a: at(es.l.cavityStart), b: at(es.l.cavityEnd) });
  return { calipers, edFrame: ed.f, esFrame: es.f, warnings };
}

/** Samples along the line: one per pixel, between 64 and 600. */
export const samplesFor = (a: Pt, b: Pt) => Math.max(64, Math.min(600, Math.round(Math.hypot(b.x - a.x, b.y - a.y))));
