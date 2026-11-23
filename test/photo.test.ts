import { describe, expect, it } from "vitest";
import { applyH, homography, isConvexQuad, maskBands, outputSize, quadAspect, warpQuad, type Pt } from "../src/lib/photo/geometry";
import { autoFindRuler, cmPerPxFromRuler, findTicks, perPxFromPoints, rulerAlong } from "../src/lib/photo/scale";
import { lineProfile, lvAlongLine, lvCalipers, lumenAlongLine, samplesFor } from "../src/lib/photo/caliper";
import { autoDoppler, speedAtY } from "../src/lib/photo/doppler";
import { envelopeValues, ENVELOPE_TARGETS, toFieldText } from "../src/lib/photo/targets";

// A synthetic scanner screen, 800 × 450 (16:9), 40 px per cm. A PLAX-like set
// of horizontal bands crosses the sector at x = 300: RV, septum 1.0 cm, LV
// cavity 5.0 cm (diastole), posterior wall 0.9 cm, bright pericardium.
// A depth ruler of dots every 1 cm runs down x = 700. The top 30 rows hold a
// "patient banner".
const SW = 800, SH = 450, PX_PER_CM = 40;
function screen(lvidCm = 5.0, seed = 1): Uint8ClampedArray {
  const out = new Uint8ClampedArray(SW * SH * 4);
  let s = seed;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return (s % 21) - 10; };
  const rvEnd = 60, sepEnd = rvEnd + 1.0 * PX_PER_CM, cavEnd = sepEnd + lvidCm * PX_PER_CM, pwEnd = cavEnd + 0.9 * PX_PER_CM;
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) {
    let v = 0;
    if (y < 30) v = (x % 9 < 5 && y > 8 && y < 22) ? 230 : 0; // banner text
    else if (x > 120 && x < 520) {
      if (y < rvEnd) v = 120; else if (y < rvEnd + 40) v = 15; // chest wall, RV
      else if (y < sepEnd + 40) v = 140; // septum (starts at rvEnd + 40)
      else if (y < cavEnd + 40) v = 15;
      else if (y < pwEnd + 40) v = 130;
      else if (y < pwEnd + 52) v = 240;
      else v = 90;
      v = Math.max(0, v + rnd());
    }
    if (x >= 698 && x <= 702 && y >= 40 && (y - 40) % PX_PER_CM <= 2) v = 220; // ruler dot
    out.set([v, v, v, 255], (y * SW + x) * 4);
  }
  return out;
}

// A phone photo of that screen, taken at an angle: the screen corners land on a
// tilted quadrilateral inside a 1000 × 750 photo.
const PW = 1000, PH = 750;
const CORNERS: Pt[] = [{ x: 140, y: 120 }, { x: 900, y: 70 }, { x: 930, y: 640 }, { x: 110, y: 600 }];
function photo(src: Uint8ClampedArray): Uint8ClampedArray {
  // Forward-warp by sampling: for each photo pixel, find where it came from on the screen.
  const H = homography(CORNERS, [{ x: 0, y: 0 }, { x: SW - 1, y: 0 }, { x: SW - 1, y: SH - 1 }, { x: 0, y: SH - 1 }]);
  const out = new Uint8ClampedArray(PW * PH * 4);
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
    const p = applyH(H, { x, y });
    const o = (y * PW + x) * 4;
    out[o + 3] = 255;
    const sx = Math.round(p.x), sy = Math.round(p.y);
    if (sx < 0 || sy < 0 || sx >= SW || sy >= SH) { out[o] = out[o + 1] = out[o + 2] = 40; continue; }
    const i = (sy * SW + sx) * 4;
    out[o] = src[i]; out[o + 1] = src[i + 1]; out[o + 2] = src[i + 2];
  }
  return out;
}

describe("straightening a photo of the screen", () => {
  it("maps the four corners exactly", () => {
    const dst: Pt[] = [{ x: 0, y: 0 }, { x: 799, y: 0 }, { x: 799, y: 449 }, { x: 0, y: 449 }];
    const H = homography(CORNERS, dst);
    CORNERS.forEach((c, i) => { const p = applyH(H, c); expect(p.x).toBeCloseTo(dst[i].x, 6); expect(p.y).toBeCloseTo(dst[i].y, 6); });
  });
  it("rejects a crossed quadrilateral", () => {
    expect(isConvexQuad(CORNERS)).toBe(true);
    expect(isConvexQuad([CORNERS[0], CORNERS[2], CORNERS[1], CORNERS[3]])).toBe(false);
  });
  it("estimates the aspect from the corners and sizes the output", () => {
    expect(quadAspect(CORNERS)).toBeGreaterThan(1.3);
    expect(outputSize(16 / 9)).toEqual({ w: 1280, h: 720 });
    expect(outputSize(4 / 3, 1280, 720)).toEqual({ w: 960, h: 720 });
  });
  it("masks the banner rows", () => {
    const img = screen();
    maskBands(img, SW, SH, [[0, 30]]);
    let max = 0;
    for (let i = 0; i < 30 * SW * 4; i += 4) max = Math.max(max, img[i]);
    expect(max).toBe(0);
  });
});

describe("scale from the depth ruler", () => {
  it("finds evenly spaced ticks in a profile, with one missing", () => {
    const p = Array.from({ length: 400 }, (_, i) => ((i - 10) % 37.5 < 2 && i !== 160 && i !== 161 ? 200 : 10) + ((i * 7) % 5));
    const t = findTicks(p)!;
    expect(t.period).toBeCloseTo(37.5, 0);
  });
  it("finds the ruler and the LV on a straightened photo taken at an angle", () => {
    const straight = warpQuad(photo(screen()), PW, PH, CORNERS, SW, SH);
    const r = autoFindRuler(straight, SW, SH)!;
    expect(r).toBeDefined();
    expect(Math.abs(r.a.x - 700)).toBeLessThan(4);
    expect(Math.abs(r.period - PX_PER_CM)).toBeLessThan(0.5);
    const cmPerPx = cmPerPxFromRuler(r, 1);
    // LV along a vertical line at x = 300, from the RV to beyond the pericardium.
    const a = { x: 300, y: 70 }, b = { x: 300, y: 440 };
    const l = lvAlongLine(lineProfile(straight, SW, SH, a, b, samplesFor(a, b)))!;
    const len = Math.hypot(b.x - a.x, b.y - a.y) * cmPerPx;
    expect(Math.abs((l.cavityEnd - l.cavityStart) * len - 5.0)).toBeLessThan(0.12);
    expect(Math.abs((l.cavityStart - l.septumStart!) * len - 1.0)).toBeLessThan(0.12);
    expect(Math.abs((l.wallEnd! - l.cavityEnd) * len - 0.9)).toBeLessThan(0.12);
  });
  it("measures ticks along a line the user drew", () => {
    const r = rulerAlong(screen(), SW, SH, { x: 700, y: 35 }, { x: 700, y: 445 })!;
    expect(Math.abs(r.period - PX_PER_CM)).toBeLessThan(0.3);
  });
  it("gives units per pixel from two points", () => {
    expect(perPxFromPoints({ x: 0, y: 0 }, { x: 0, y: 200 }, 5)).toBeCloseTo(0.025);
    expect(() => perPxFromPoints({ x: 0, y: 0 }, { x: 1, y: 1 }, 5)).toThrow();
  });
  it("does not find a ruler in speckle", () => {
    const img = new Uint8ClampedArray(SW * SH * 4);
    for (let i = 0; i < img.length; i += 4) { const h = Math.sin(i * 12.9898) * 43758.5453; const v = Math.floor((h - Math.floor(h)) * 120); img[i] = img[i + 1] = img[i + 2] = v; img[i + 3] = 255; }
    expect(autoFindRuler(img, SW, SH)).toBeUndefined();
  });
});

describe("LV dimensions from a short clip", () => {
  it("takes diastole as the widest cavity and systole as the narrowest", () => {
    const sizes = [5.0, 4.4, 3.6, 3.3, 3.9, 4.7];
    const a = { x: 300, y: 70 }, b = { x: 300, y: 440 };
    const lines = sizes.map((s, i) => lvAlongLine(lineProfile(screen(s, i + 1), SW, SH, a, b, samplesFor(a, b))));
    const r = lvCalipers(lines, sizes.map((_, i) => i), a, b)!;
    expect(r.edFrame).toBe(0);
    expect(r.esFrame).toBe(3);
    expect(r.calipers.map((c) => c.id)).toEqual(["ivsd", "lvidd", "lvpwd", "lvids"]);
    const lvids = r.calipers.find((c) => c.id === "lvids")!;
    expect(Math.abs(Math.hypot(lvids.b.x - lvids.a.x, lvids.b.y - lvids.a.y) / PX_PER_CM - 3.3)).toBeLessThan(0.12);
  });
  it("finds a lumen around the middle of the line", () => {
    const p = [...Array(30).fill(150), ...Array(80).fill(15), ...Array(30).fill(150)];
    const l = lumenAlongLine(p)!;
    expect((l.end - l.start) * (p.length - 1)).toBeCloseTo(80, -1);
  });
});

describe("Doppler from a photo", () => {
  // Strip 600 × 300, baseline at row 40, 1 px = 2 cm/s, 1 px = 5 ms. Three beats
  // below the baseline, each a 300 ms half-sine peaking at 4 m/s (200 px).
  const W = 600, H = 300, base = 40;
  const img = new Uint8ClampedArray(W * H * 4);
  const beatsAt = [60, 250, 440];
  for (let x = 0; x < W; x++) {
    let depth = 0;
    for (const s of beatsAt) if (x >= s && x <= s + 60) depth = 200 * Math.sin((Math.PI * (x - s)) / 60);
    for (let y = 0; y < H; y++) {
      const v = y > base && y - base <= depth ? 200 : 8;
      img.set([v, v, v, 255], (y * W + x) * 4);
    }
  }
  const scale = { x0: 0, x1: W - 1, top: 0, bottom: H - 1, baseY: base, cmsPerPx: 2, secPerPx: 0.005 };
  it("traces peak velocity, mean gradient and VTI", () => {
    const r = autoDoppler(img, W, scale);
    expect(r.side).toBe("below");
    expect(r.beats.length).toBe(3);
    expect(r.mean!.peakVelocityMs).toBeGreaterThan(3.85);
    expect(r.mean!.peakVelocityMs).toBeLessThan(4.1);
    // Half-sine: mean of 4v² = 4 · 16 / 2 = 32 mmHg; VTI = (2/π) · 4 m/s · 0.3 s = 76 cm.
    expect(Math.abs(r.mean!.meanGradientMmHg - 32)).toBeLessThan(3);
    expect(Math.abs(r.mean!.vtiCm! - 76.4)).toBeLessThan(5);
  });
  it("leaves out VTI when the time scale is not known", () => {
    const r = autoDoppler(img, W, { ...scale, secPerPx: undefined });
    expect(r.mean!.vtiCm).toBeUndefined();
    expect(Math.abs(r.mean!.meanGradientMmHg - 32)).toBeLessThan(3);
  });
  it("reads a speed at a tapped row", () => {
    expect(speedAtY(scale, base + 150)).toBeCloseTo(3);
  });
});

describe("filling the report", () => {
  it("converts to each field's unit", () => {
    expect(toFieldText("lvidd", 4.876, "distance")).toBe("4.88");
    expect(toFieldText("tapse", 2.14, "distance")).toBe("21");
    expect(toFieldText("e", 0.823, "speed")).toBe("82");
    expect(toFieldText("trv", 2.876, "speed")).toBe("2.88");
    expect(() => toFieldText("e", 1, "distance")).toThrow();
  });
  it("fills the aortic valve fields from an envelope", () => {
    const av = ENVELOPE_TARGETS.find((t) => t.id === "av")!;
    expect(envelopeValues(av, { peakVelocityMs: 4.02, meanGradientMmHg: 41.6, vtiCm: 98.24 })).toEqual({ av_vmax: "4.02", av_meanpg: "42", av_vti: "98.2" });
    expect(envelopeValues(av, { peakVelocityMs: 4.02, meanGradientMmHg: 41.6 })).toEqual({ av_vmax: "4.02", av_meanpg: "42" });
  });
});
