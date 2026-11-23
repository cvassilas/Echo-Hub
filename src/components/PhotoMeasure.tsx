/**
 * Measure from a photo or short clip of the scanner screen.
 *
 * Steps: capture (in-app camera, so nothing goes to the gallery, or a file) →
 * mark the screen corners → black out the patient banner → set the scale from
 * the depth ruler or the Doppler scale → auto-measure → drag to correct →
 * add to the report. Images stay in memory on the phone and are dropped when
 * this closes; only the numbers reach the report.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, ImagePlus, Video, X, ChevronLeft, Wand2, Check, Trash2, Ruler as RulerIcon } from "lucide-react";
import { useBackHandler } from "../lib/nav";
import { setValue } from "../lib/store";
import { isConvexQuad, maskBands, outputSize, quadAspect, warpQuad, type Pt } from "../lib/photo/geometry";
import { autoFindRuler, cmPerPxFromRuler, perPxFromPoints, rulerAlong, type Ruler } from "../lib/photo/scale";
import { lineProfile, lumenAlongLine, lvAlongLine, lvCalipers, along, samplesFor } from "../lib/photo/caliper";
import { autoDoppler, speedAtY, type AutoDopplerResult, type DopplerScale } from "../lib/photo/doppler";
import { DISTANCE_TARGETS, ENVELOPE_TARGETS, SPEED_TARGETS, envelopeValues, labelOf, toFieldText, unitOf } from "../lib/photo/targets";
import { inputCls } from "./ui";

type Step = "source" | "corners" | "mask" | "scale" | "measure";
type Mode = "2d" | "doppler";
type Aspect = "16:9" | "16:10" | "4:3" | "corners";
const ASPECTS: Record<Exclude<Aspect, "corners">, number> = { "16:9": 16 / 9, "16:10": 16 / 10, "4:3": 4 / 3 };

/** Clip settings: about 2.5 s at 12 frames a second covers two to three beats. */
const CLIP_FPS = 12, CLIP_SECONDS = 2.5;
/** Largest raw frame kept (pixels wide) before straightening. */
const RAW_MAX_W = 1600;

interface Raw { w: number; h: number; frames: Blob[]; preview: ImageBitmap }
interface Straight { w: number; h: number; frames: Uint8ClampedArray[] }

type Result =
  | { uid: number; kind: "distance"; key: string; a: Pt; b: Pt; frame: number; on: boolean }
  | { uid: number; kind: "speed"; key: string; x: number; y: number; on: boolean }
  | { uid: number; kind: "envelope"; target: string; res: AutoDopplerResult; beatsOn: boolean[]; on: boolean };

interface Handle { id: string; p: Pt; axis?: "x" | "y"; color: string; label?: string }

let uidSeq = 1;
const btn = "m3-press rounded-full px-3.5 py-2 text-[13px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-40";
const primary = `${btn} bg-[var(--c-teal)] text-[var(--c-on-primary)]`;
const outline = `${btn} border border-[var(--c-border2)] text-[var(--c-teal)]`;
const chip = (on: boolean) => `m3-press rounded-full px-3 py-1.5 text-[12.5px] font-bold border ${on ? "bg-[var(--c-tonal)] text-[var(--c-on-tonal)] border-transparent" : "border-[var(--c-border2)] text-[var(--c-text2)]"}`;

async function canvasBlob(c: HTMLCanvasElement): Promise<Blob> {
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("Could not read the camera image."))), "image/jpeg", 0.92));
}
function fit(w: number, h: number, maxW: number) { const s = Math.min(1, maxW / w); return { w: Math.round(w * s), h: Math.round(h * s) }; }
async function rgbaOf(blob: Blob, w: number, h: number): Promise<Uint8ClampedArray> {
  const bmp = await createImageBitmap(blob);
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bmp, 0, 0, w, h); bmp.close();
  return ctx.getImageData(0, 0, w, h).data;
}

export const PhotoMeasure: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [step, setStep] = useState<Step>("source");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [raw, setRaw] = useState<Raw | null>(null);
  const [corners, setCorners] = useState<Pt[]>([]);
  const [aspect, setAspect] = useState<Aspect>("16:9");
  const [maskTop, setMaskTop] = useState(0.1);
  const [maskBottom, setMaskBottom] = useState(0);
  const [img, setImg] = useState<Straight | null>(null);
  const [frame, setFrame] = useState(0);
  const [mode, setMode] = useState<Mode>("2d");
  // 2D scale
  const [ruler, setRuler] = useState<Ruler | null>(null);
  const [tickCm, setTickCm] = useState("1");
  const [scaleLine, setScaleLine] = useState<[Pt, Pt]>([{ x: 0, y: 0 }, { x: 0, y: 0 }]);
  const [scaleCm, setScaleCm] = useState("");
  const [scaleBy, setScaleBy] = useState<"ruler" | "points">("ruler");
  // Doppler scale
  const [baseY, setBaseY] = useState(0);
  const [refY, setRefY] = useState(0);
  const [refCms, setRefCms] = useState("100");
  const [strip, setStrip] = useState<{ x0: number; x1: number; top: number; bottom: number }>({ x0: 0, x1: 0, top: 0, bottom: 0 });
  const [timeX, setTimeX] = useState<[number, number]>([0, 0]);
  const [timeS, setTimeS] = useState("");
  // Measuring
  const [tool, setTool] = useState<"lv" | "lumen" | "caliper" | "auto" | "speed">("lv");
  const [line, setLine] = useState<[Pt, Pt]>([{ x: 0, y: 0 }, { x: 0, y: 0 }]);
  const [envTarget, setEnvTarget] = useState("av");
  const [results, setResults] = useState<Result[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  // Release memory (and the only copies of the images) when closing.
  useEffect(() => () => { raw?.preview.close(); }, [raw]);

  const back = useCallback(() => {
    if (step === "source") onClose();
    else if (step === "corners") { setRaw(null); setStep("source"); }
    else if (step === "mask") setStep("corners");
    else if (step === "scale") { setImg(null); setRaw(null); setStep("source"); }
    else setStep("scale");
  }, [step, onClose]);
  useBackHandler(true, back);

  // ---------- Capture ----------
  const takeFrames = (w: number, h: number, frames: Blob[], preview: ImageBitmap) => {
    setRaw({ w, h, frames, preview });
    setCorners([{ x: 0.08 * w, y: 0.08 * h }, { x: 0.92 * w, y: 0.08 * h }, { x: 0.92 * w, y: 0.92 * h }, { x: 0.08 * w, y: 0.92 * h }]);
    setStep("corners"); setError(null);
  };

  const onFile = async (file: File) => {
    setError(null);
    try {
      if (file.type.startsWith("video/")) { setVideoFile(URL.createObjectURL(file)); return; }
      setBusy("Opening the photo");
      const bmp = await createImageBitmap(file);
      const { w, h } = fit(bmp.width, bmp.height, RAW_MAX_W);
      const c = document.createElement("canvas"); c.width = w; c.height = h;
      c.getContext("2d")!.drawImage(bmp, 0, 0, w, h); bmp.close();
      const blob = await canvasBlob(c);
      takeFrames(w, h, [blob], await createImageBitmap(c));
    } catch (e) { setError((e as Error).message || "Could not open that file."); }
    finally { setBusy(null); }
  };

  // Video from a file: scrub to the start, then take one frame or a short clip.
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const fileVideo = useRef<HTMLVideoElement>(null);
  useEffect(() => () => { if (videoFile) URL.revokeObjectURL(videoFile); }, [videoFile]);
  const grabFromVideo = async (v: HTMLVideoElement, clip: boolean, seek: boolean) => {
    const { w, h } = fit(v.videoWidth, v.videoHeight, RAW_MAX_W);
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    const frames: Blob[] = [];
    const n = clip ? Math.round(CLIP_FPS * CLIP_SECONDS) : 1;
    const start = v.currentTime;
    for (let i = 0; i < n; i++) {
      if (seek && i > 0) {
        const t = start + i / CLIP_FPS;
        if (t > v.duration) break;
        await new Promise<void>((res) => { v.onseeked = () => res(); v.currentTime = t; });
      } else if (!seek && i > 0) await new Promise((r) => setTimeout(r, 1000 / CLIP_FPS));
      setBusy(clip ? `Recording ${i + 1} of ${n}` : "Taking the photo");
      ctx.drawImage(v, 0, 0, w, h);
      frames.push(await canvasBlob(c));
    }
    return { w, h, frames, preview: await createImageBitmap(frames[0]) };
  };

  // In-app camera: frames are kept in memory only, never written to the gallery.
  const [camOn, setCamOn] = useState(false);
  const camVideo = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const stopCam = () => { stream.current?.getTracks().forEach((t) => t.stop()); stream.current = null; setCamOn(false); };
  useEffect(() => stopCam, []);
  const startCam = async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false });
      stream.current = s; setCamOn(true);
      requestAnimationFrame(() => { if (camVideo.current) { camVideo.current.srcObject = s; camVideo.current.play().catch(() => {}); } });
    } catch {
      setError("The camera could not be opened. Allow camera access for Echo Hub, or choose a photo or video instead.");
    }
  };
  const shoot = async (clip: boolean) => {
    const v = camVideo.current; if (!v) return;
    try {
      const r = await grabFromVideo(v, clip, false);
      stopCam(); takeFrames(r.w, r.h, r.frames, r.preview);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(null); }
  };
  const fromVideoFile = async (clip: boolean) => {
    const v = fileVideo.current; if (!v) return;
    try {
      v.pause();
      const r = await grabFromVideo(v, clip, true);
      setVideoFile(null); takeFrames(r.w, r.h, r.frames, r.preview);
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(null); }
  };

  // ---------- Straighten and mask ----------
  const outAspect = aspect === "corners" ? quadAspect(corners) : ASPECTS[aspect];
  const straighten = async () => {
    if (!raw) return;
    if (!isConvexQuad(corners)) { setError("The corners cross over. Drag them to the screen's top-left, top-right, bottom-right and bottom-left."); return; }
    setError(null);
    const many = raw.frames.length > 1;
    const { w, h } = outputSize(outAspect, many ? 1024 : 1280, many ? 768 : 960);
    const frames: Uint8ClampedArray[] = [];
    for (let i = 0; i < raw.frames.length; i++) {
      setBusy(`Straightening ${i + 1} of ${raw.frames.length}`);
      await new Promise((r) => setTimeout(r, 0));
      frames.push(warpQuad(await rgbaOf(raw.frames[i], raw.w, raw.h), raw.w, raw.h, corners, w, h));
    }
    setBusy(null);
    setImg({ w, h, frames }); setFrame(0);
    setStep("mask");
  };
  const applyMask = () => {
    if (!img) return;
    for (const f of img.frames) maskBands(f, img.w, img.h, [[0, maskTop * img.h], ...(maskBottom > 0 ? [[img.h * (1 - maskBottom), img.h] as [number, number]] : [])]);
    // The unmasked originals are no longer needed: drop them.
    raw?.preview.close(); setRaw(null);
    const { w, h } = img;
    setScaleLine([{ x: 0.9 * w, y: 0.2 * h }, { x: 0.9 * w, y: 0.6 * h }]);
    setBaseY(0.45 * h); setRefY(0.75 * h);
    setStrip({ x0: Math.round(0.05 * w), x1: Math.round(0.95 * w), top: Math.round(Math.max(maskTop + 0.02, 0.3) * h), bottom: Math.round(0.95 * h) });
    setTimeX([0.3 * w, 0.6 * w]);
    setLine([{ x: 0.45 * w, y: 0.2 * h }, { x: 0.45 * w, y: 0.8 * h }]);
    const r = autoFindRuler(img.frames[0], w, h, maskTop + 0.01);
    setRuler(r ?? null); setScaleBy(r ? "ruler" : "points");
    setStep("scale");
  };

  // ---------- Scale ----------
  const cmPerPx = useMemo(() => {
    const t = Number(tickCm.replace(",", "."));
    if (scaleBy === "ruler") return ruler && t > 0 ? cmPerPxFromRuler(ruler, t) : undefined;
    const d = Number(scaleCm.replace(",", "."));
    try { return d > 0 ? perPxFromPoints(scaleLine[0], scaleLine[1], d) : undefined; } catch { return undefined; }
  }, [scaleBy, ruler, tickCm, scaleCm, scaleLine]);
  const dScale: DopplerScale | undefined = useMemo(() => {
    const v = Number(refCms.replace(",", "."));
    if (!(Math.abs(v) > 0) || Math.abs(refY - baseY) < 10) return undefined;
    const s = Number(timeS.replace(",", "."));
    const sec = s > 0 && Math.abs(timeX[1] - timeX[0]) > 10 ? s / Math.abs(timeX[1] - timeX[0]) : undefined;
    return { ...strip, baseY, cmsPerPx: Math.abs(v) / Math.abs(refY - baseY), secPerPx: sec };
  }, [refCms, refY, baseY, strip, timeX, timeS]);
  const scaleOk = mode === "2d" ? !!cmPerPx : !!dScale && strip.top < baseY && baseY < strip.bottom;

  const findRulerAlong = () => {
    if (!img) return;
    const r = rulerAlong(img.frames[frame], img.w, img.h, scaleLine[0], scaleLine[1]);
    if (r) { setRuler(r); setScaleBy("ruler"); setError(null); }
    else setError("No even ticks were found along that line. Drag it over the depth ruler, or enter a known distance instead.");
  };

  // ---------- Measure ----------
  const run = () => {
    if (!img) return;
    setError(null); setWarnings([]);
    const [a, b] = line;
    if (tool === "lv") {
      const frames = img.frames.map((_, i) => i);
      const lines = img.frames.map((f) => lvAlongLine(lineProfile(f, img.w, img.h, a, b, samplesFor(a, b))));
      const r = lvCalipers(lines, frames, a, b);
      if (!r) { setError("The walls were not found along the line. Start it in the RV, cross the septum, LV and posterior wall, and end past the pericardium."); return; }
      setResults((rs) => [...rs.filter((x) => !(x.kind === "distance" && ["ivsd", "lvidd", "lvpwd", "lvids"].includes(x.key))), ...r.calipers.map((c) => ({ uid: uidSeq++, kind: "distance" as const, key: c.id, a: c.a, b: c.b, frame: c.frame, on: true }))]);
      setWarnings(r.warnings); setFrame(r.edFrame);
    } else if (tool === "lumen") {
      const l = lumenAlongLine(lineProfile(img.frames[frame], img.w, img.h, a, b, samplesFor(a, b)));
      if (!l) { setError("No clear lumen along the line. Make the line a little wider than the vessel, centred on it."); return; }
      setResults((rs) => [...rs, { uid: uidSeq++, kind: "distance", key: "lvot_d", a: along(a, b, l.start), b: along(a, b, l.end), frame, on: true }]);
    } else if (tool === "caliper") {
      setResults((rs) => [...rs, { uid: uidSeq++, kind: "distance", key: "lvidd", a: { ...a }, b: { ...b }, frame, on: true }]);
    } else if (tool === "auto" && dScale) {
      const res = autoDoppler(img.frames[frame], img.w, dScale);
      setWarnings(res.warnings);
      if (!res.beats.length) { setError("No complete beats were found. Check the strip covers whole beats and the baseline is on the zero line."); return; }
      setResults((rs) => [...rs.filter((x) => x.kind !== "envelope"), { uid: uidSeq++, kind: "envelope", target: envTarget, res, beatsOn: res.beats.map(() => true), on: true }]);
    } else if (tool === "speed" && dScale) {
      setResults((rs) => [...rs, { uid: uidSeq++, kind: "speed", key: "e", x: (strip.x0 + strip.x1) / 2, y: baseY + (refY - baseY) * 0.6, on: true }]);
    }
  };

  const value = (r: Result): string => {
    if (r.kind === "distance") return cmPerPx ? `${(Math.hypot(r.b.x - r.a.x, r.b.y - r.a.y) * cmPerPx).toFixed(2)} cm` : "–";
    if (r.kind === "speed") return dScale ? `${speedAtY(dScale, r.y).toFixed(2)} m/s` : "–";
    const m = envMean(r);
    return m ? `Vmax ${m.peakVelocityMs.toFixed(2)} m/s · mean PG ${Math.round(m.meanGradientMmHg)} mmHg${m.vtiCm !== undefined ? ` · VTI ${m.vtiCm.toFixed(1)} cm` : ""}` : "No beats chosen";
  };
  const envMean = (r: Extract<Result, { kind: "envelope" }>) => {
    const bs = r.res.beats.filter((_, i) => r.beatsOn[i]);
    if (!bs.length) return undefined;
    const avg = (f: (b: typeof bs[number]) => number) => bs.reduce((s, b) => s + f(b), 0) / bs.length;
    return { peakVelocityMs: avg((b) => b.peakVelocityMs), meanGradientMmHg: avg((b) => b.meanGradientMmHg), vtiCm: bs[0].vtiCm === undefined ? undefined : avg((b) => b.vtiCm!) };
  };
  const toReport = (): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const r of results) {
      if (!r.on) continue;
      if (r.kind === "distance" && cmPerPx) out[r.key] = toFieldText(r.key, Math.hypot(r.b.x - r.a.x, r.b.y - r.a.y) * cmPerPx, "distance");
      if (r.kind === "speed" && dScale) out[r.key] = toFieldText(r.key, speedAtY(dScale, r.y), "speed");
      if (r.kind === "envelope") { const m = envMean(r); const t = ENVELOPE_TARGETS.find((x) => x.id === r.target); if (m && t) Object.assign(out, envelopeValues(t, m)); }
    }
    return out;
  };
  const pending = toReport();
  const addToReport = () => { Object.entries(pending).forEach(([k, v]) => setValue(k, v)); setAdded(true); };

  // ---------- Canvas ----------
  const canvas = useRef<HTMLCanvasElement>(null);
  const work = useRef<HTMLCanvasElement | null>(null);
  const [drag, setDrag] = useState<{ id: string; p: Pt } | null>(null);
  const W = step === "corners" ? raw?.w ?? 1 : img?.w ?? 1, H = step === "corners" ? raw?.h ?? 1 : img?.h ?? 1;

  const handles: Handle[] = useMemo(() => {
    if (step === "corners") return corners.map((p, i) => ({ id: `c${i}`, p, color: "#F4BD6F", label: ["TL", "TR", "BR", "BL"][i] }));
    if (step === "mask" && img) return [
      { id: "mtop", p: { x: img.w / 2, y: maskTop * img.h }, axis: "y", color: "#E05A4F" },
      { id: "mbot", p: { x: img.w / 2, y: (1 - maskBottom) * img.h }, axis: "y", color: "#E05A4F" },
    ];
    if (step === "scale" && mode === "2d") return [{ id: "s0", p: scaleLine[0], color: "#82D3DE" }, { id: "s1", p: scaleLine[1], color: "#82D3DE" }];
    if (step === "scale" && mode === "doppler") return [
      { id: "base", p: { x: (strip.x0 + strip.x1) / 2, y: baseY }, axis: "y", color: "#82D3DE", label: "0" },
      { id: "ref", p: { x: (strip.x0 + strip.x1) / 2 + 40, y: refY }, axis: "y", color: "#F4BD6F", label: refCms },
      { id: "top", p: { x: strip.x0 + 30, y: strip.top }, axis: "y", color: "#7D8E97" },
      { id: "bottom", p: { x: strip.x0 + 30, y: strip.bottom }, axis: "y", color: "#7D8E97" },
      { id: "x0", p: { x: strip.x0, y: (strip.top + strip.bottom) / 2 }, axis: "x", color: "#7D8E97" },
      { id: "x1", p: { x: strip.x1, y: (strip.top + strip.bottom) / 2 }, axis: "x", color: "#7D8E97" },
      { id: "t0", p: { x: timeX[0], y: strip.bottom - 20 }, axis: "x", color: "#A6C8FF" },
      { id: "t1", p: { x: timeX[1], y: strip.bottom - 20 }, axis: "x", color: "#A6C8FF" },
    ];
    if (step === "measure") {
      const hs: Handle[] = [];
      if (mode === "2d" && tool !== "auto" && tool !== "speed") hs.push({ id: "l0", p: line[0], color: "#82D3DE" }, { id: "l1", p: line[1], color: "#82D3DE" });
      for (const r of results) {
        if (r.kind === "distance" && (r.frame === frame || img?.frames.length === 1)) hs.push({ id: `r${r.uid}a`, p: r.a, color: "#F4BD6F" }, { id: `r${r.uid}b`, p: r.b, color: "#F4BD6F" });
        if (r.kind === "speed") hs.push({ id: `r${r.uid}y`, p: { x: r.x, y: r.y }, color: "#F4BD6F" });
      }
      return hs;
    }
    return [];
  }, [step, corners, img, maskTop, maskBottom, mode, scaleLine, strip, baseY, refY, refCms, timeX, line, results, tool, frame]);

  const moveHandle = (id: string, p: Pt) => {
    const cl = (v: number, max: number) => Math.max(0, Math.min(max - 1, v));
    p = { x: cl(p.x, W), y: cl(p.y, H) };
    if (id[0] === "c" && id.length === 2) { const i = Number(id[1]); setCorners((c) => c.map((q, k) => (k === i ? p : q))); return; }
    if (id === "mtop") setMaskTop(Math.min(0.5, p.y / H));
    else if (id === "mbot") setMaskBottom(Math.min(0.5, 1 - p.y / H));
    else if (id === "s0" || id === "s1") setScaleLine((s) => (id === "s0" ? [p, s[1]] : [s[0], p]));
    else if (id === "base") setBaseY(p.y);
    else if (id === "ref") setRefY(p.y);
    else if (id === "top" || id === "bottom") setStrip((s) => ({ ...s, [id]: Math.round(p.y) }));
    else if (id === "x0" || id === "x1") setStrip((s) => ({ ...s, [id]: Math.round(p.x) }));
    else if (id === "t0") setTimeX((t) => [p.x, t[1]]);
    else if (id === "t1") setTimeX((t) => [t[0], p.x]);
    else if (id === "l0" || id === "l1") setLine((l) => (id === "l0" ? [p, l[1]] : [l[0], p]));
    else if (id[0] === "r") {
      const uid = Number(id.slice(1, -1)), end = id.slice(-1);
      setResults((rs) => rs.map((r) => {
        if (r.uid !== uid) return r;
        if (r.kind === "distance") return end === "a" ? { ...r, a: p } : { ...r, b: p };
        if (r.kind === "speed") return { ...r, x: p.x, y: p.y };
        return r;
      }));
    }
  };

  // Draw the image, overlays and (while dragging) a magnifier.
  useEffect(() => {
    const c = canvas.current; if (!c) return;
    if (step === "source") return;
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    if (step === "corners" && raw) ctx.drawImage(raw.preview, 0, 0);
    else if (img) {
      if (!work.current) work.current = document.createElement("canvas");
      const wc = work.current; wc.width = img.w; wc.height = img.h;
      wc.getContext("2d")!.putImageData(new ImageData(new Uint8ClampedArray(img.frames[Math.min(frame, img.frames.length - 1)]), img.w, img.h), 0, 0);
      ctx.drawImage(wc, 0, 0);
    }
    const lw = Math.max(2, W / 400), r = Math.max(8, W / 90);
    ctx.lineWidth = lw; ctx.font = `bold ${Math.round(r * 1.4)}px sans-serif`;
    const seg = (a: Pt, b: Pt, col: string, dash = false) => { ctx.strokeStyle = col; ctx.setLineDash(dash ? [lw * 4, lw * 3] : []); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); ctx.setLineDash([]); };
    const text = (s: string, x: number, y: number, col: string) => { ctx.fillStyle = "rgba(0,0,0,0.6)"; const m = ctx.measureText(s); ctx.fillRect(x - 3, y - r * 1.4, m.width + 6, r * 1.8); ctx.fillStyle = col; ctx.fillText(s, x, y); };

    if (step === "corners") { ctx.strokeStyle = "#F4BD6F"; ctx.beginPath(); corners.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.stroke(); }
    if (step === "mask") {
      ctx.fillStyle = "rgba(224,90,79,0.55)";
      ctx.fillRect(0, 0, W, maskTop * H); ctx.fillRect(0, (1 - maskBottom) * H, W, maskBottom * H);
      text("Blacked out", 8, maskTop * H - 6 > r ? maskTop * H - 6 : maskTop * H + r * 1.6, "#fff");
    }
    if (step === "scale" && mode === "2d") {
      if (ruler && scaleBy === "ruler") { ctx.fillStyle = "#2FA37A"; ruler.ticks.forEach((t) => { ctx.beginPath(); ctx.arc(t.x, t.y, r * 0.6, 0, 7); ctx.fill(); }); }
      seg(scaleLine[0], scaleLine[1], "#82D3DE", true);
    }
    if (step === "scale" && mode === "doppler") {
      ctx.strokeStyle = "#7D8E97"; ctx.strokeRect(strip.x0, strip.top, strip.x1 - strip.x0, strip.bottom - strip.top);
      seg({ x: strip.x0, y: baseY }, { x: strip.x1, y: baseY }, "#82D3DE"); text("0", strip.x0 + 4, baseY - 4, "#82D3DE");
      seg({ x: strip.x0, y: refY }, { x: strip.x1, y: refY }, "#F4BD6F", true); text(`${refCms} cm/s`, strip.x0 + 4, refY - 4, "#F4BD6F");
      seg({ x: timeX[0], y: strip.top }, { x: timeX[0], y: strip.bottom }, "#A6C8FF", true); seg({ x: timeX[1], y: strip.top }, { x: timeX[1], y: strip.bottom }, "#A6C8FF", true);
    }
    if (step === "measure") {
      if (mode === "2d" && tool !== "auto" && tool !== "speed") seg(line[0], line[1], "#82D3DE", true);
      for (const res of results) {
        if (res.kind === "distance" && (res.frame === frame || img?.frames.length === 1)) { seg(res.a, res.b, res.on ? "#F4BD6F" : "#7D8E97"); text(labelOf(res.key).split(" ")[0], (res.a.x + res.b.x) / 2 + r, (res.a.y + res.b.y) / 2, "#F4BD6F"); }
        if (res.kind === "speed" && dScale) { seg({ x: dScale.x0, y: res.y }, { x: dScale.x1, y: res.y }, "#F4BD6F", true); text(`${speedAtY(dScale, res.y).toFixed(2)} m/s`, res.x + r * 1.5, res.y - 4, "#F4BD6F"); }
        if (res.kind === "envelope") {
          ctx.strokeStyle = "#2FA37A"; ctx.beginPath(); res.res.envelope.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.stroke();
          res.res.beats.forEach((bt, i) => {
            const col = res.beatsOn[i] ? "#F4BD6F" : "#7D8E97";
            seg({ x: bt.startX, y: baseY }, { x: bt.startX, y: res.res.envelope[bt.peakX - res.res.envelope[0].x].y }, col, true);
            const pk = res.res.envelope[bt.peakX - res.res.envelope[0].x]; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(pk.x, pk.y, r * 0.6, 0, 7); ctx.fill();
            text(String(i + 1), pk.x + r, pk.y, col);
          });
        }
      }
    }
    for (const h of handles) {
      ctx.fillStyle = h.color; ctx.strokeStyle = "#000"; ctx.lineWidth = lw;
      ctx.beginPath(); ctx.arc(h.p.x, h.p.y, r, 0, 7); ctx.globalAlpha = 0.85; ctx.fill(); ctx.globalAlpha = 1; ctx.stroke();
      if (h.label && step === "corners") text(h.label, h.p.x + r * 1.3, h.p.y + r * 0.5, h.color);
    }
    // Magnifier while dragging: 3× the area under the finger, in the far corner.
    if (drag) {
      const z = 3, size = Math.round(Math.min(W, H) * 0.32), src = size / z;
      const left = drag.p.x > W / 2 ? 8 : W - size - 8, top = 8;
      ctx.save(); ctx.beginPath(); ctx.rect(left, top, size, size); ctx.clip();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(c, drag.p.x - src / 2, drag.p.y - src / 2, src, src, left, top, size, size);
      ctx.restore();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = lw; ctx.strokeRect(left, top, size, size);
      seg({ x: left + size / 2 - 12, y: top + size / 2 }, { x: left + size / 2 + 12, y: top + size / 2 }, "#fff"); seg({ x: left + size / 2, y: top + size / 2 - 12 }, { x: left + size / 2, y: top + size / 2 + 12 }, "#fff");
    }
  }, [step, raw, img, frame, W, H, handles, drag, corners, maskTop, maskBottom, ruler, scaleBy, scaleLine, strip, baseY, refY, refCms, timeX, line, results, tool, mode, dScale]);

  const toImage = (e: React.PointerEvent): Pt => {
    const rc = canvas.current!.getBoundingClientRect();
    return { x: ((e.clientX - rc.left) / rc.width) * W, y: ((e.clientY - rc.top) / rc.height) * H };
  };
  const onDown = (e: React.PointerEvent) => {
    const p = toImage(e);
    const rc = canvas.current!.getBoundingClientRect();
    const tol = (28 / rc.width) * W;
    let best: Handle | undefined, bd = Infinity;
    for (const h of handles) {
      const d = h.axis === "y" ? Math.abs(p.y - h.p.y) * (Math.abs(p.x - h.p.x) < W / 3 ? 0.8 : 1.2) : h.axis === "x" ? Math.abs(p.x - h.p.x) * (Math.abs(p.y - h.p.y) < H / 3 ? 0.8 : 1.2) : Math.hypot(p.x - h.p.x, p.y - h.p.y);
      if (d < bd) { bd = d; best = h; }
    }
    if (!best || bd > tol) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    setDrag({ id: best.id, p });
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag) return;
    const p = toImage(e);
    const h = handles.find((x) => x.id === drag.id);
    const q = h?.axis === "y" ? { x: h.p.x, y: p.y } : h?.axis === "x" ? { x: p.x, y: h.p.y } : p;
    moveHandle(drag.id, q); setDrag({ id: drag.id, p: q });
  };
  const onUp = () => setDrag(null);

  // ---------- Render ----------
  const titles: Record<Step, string> = { source: "Measure from the screen", corners: "1. Mark the screen corners", mask: "2. Hide the patient details", scale: "3. Set the scale", measure: "4. Measure and check" };
  const canvasEl = step !== "source" && (
    <canvas ref={canvas} onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
      className="w-full h-auto rounded-xl bg-black touch-none select-none" style={{ aspectRatio: `${W} / ${H}` }} />
  );

  return (
    <div className="fixed inset-0 z-[70] bg-[var(--c-bg)] overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto px-3 pt-3 pb-24 space-y-3">
        <div className="flex items-center gap-2">
          <button type="button" onClick={back} aria-label="Back" className="m3-press w-10 h-10 rounded-full text-[var(--c-text2)] flex items-center justify-center"><ChevronLeft className="w-6 h-6" /></button>
          <h2 className="flex-1 text-[19px] leading-6 text-[var(--c-text)]">{titles[step]}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="m3-press w-10 h-10 rounded-full text-[var(--c-text2)] flex items-center justify-center"><X className="w-5 h-5" /></button>
        </div>

        {error && <div className="rounded-2xl p-3 text-[13px] bg-[color-mix(in_srgb,#E05A4F_16%,transparent)] text-[var(--c-text)]">{error}</div>}
        {busy && <div className="rounded-2xl p-3 text-[13px] bg-[var(--c-surface2)] text-[var(--c-text2)]">{busy}…</div>}

        {step === "source" && !camOn && !videoFile && (
          <div className="space-y-3">
            <p className="text-[13.5px] leading-snug text-[var(--c-text2)]">
              Photograph the scanner screen (a frozen frame, or a short clip for LV diastole and systole), then mark its corners, hide the patient banner, set the scale from the depth ruler or Doppler scale, and let Echo Hub find the edges. Every value is a proposal: drag to correct it before it goes in the report.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={startCam} className={`${primary} py-3`}><Camera className="w-5 h-5" /> Camera</button>
              <label className={`${outline} py-3 cursor-pointer`}><ImagePlus className="w-5 h-5" /> Photo or video
                <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) onFile(f); }} />
              </label>
            </div>
            <ul className="text-[12.5px] leading-snug text-[var(--c-muted)] space-y-1 list-disc pl-4">
              <li>Hold the phone square to the screen and fill the frame with it. Tilt slightly to move reflections off the image.</li>
              <li>The in-app camera keeps images in memory only: nothing is saved to your gallery, and the images are gone when you close this.</li>
              <li>A photo or video chosen from your gallery stays there; delete it yourself if it shows patient details.</li>
              <li>Check every value against the scanner before relying on it. Accuracy depends on the corners and the scale you set.</li>
            </ul>
          </div>
        )}

        {step === "source" && camOn && (
          <div className="space-y-2">
            <video ref={camVideo} playsInline muted className="w-full rounded-xl bg-black" />
            <div className="grid grid-cols-3 gap-2">
              <button type="button" disabled={!!busy} onClick={() => shoot(false)} className={primary}><Camera className="w-4 h-4" /> Photo</button>
              <button type="button" disabled={!!busy} onClick={() => shoot(true)} className={outline}><Video className="w-4 h-4" /> Clip {CLIP_SECONDS} s</button>
              <button type="button" onClick={stopCam} className={outline}>Cancel</button>
            </div>
          </div>
        )}

        {step === "source" && videoFile && (
          <div className="space-y-2">
            <p className="text-[13px] text-[var(--c-text2)]">Scrub to the frame you want (or the start of {CLIP_SECONDS} s with whole beats), then choose.</p>
            <video ref={fileVideo} src={videoFile} controls playsInline muted className="w-full rounded-xl bg-black" />
            <div className="grid grid-cols-3 gap-2">
              <button type="button" disabled={!!busy} onClick={() => fromVideoFile(false)} className={primary}>This frame</button>
              <button type="button" disabled={!!busy} onClick={() => fromVideoFile(true)} className={outline}>{CLIP_SECONDS} s from here</button>
              <button type="button" onClick={() => setVideoFile(null)} className={outline}>Cancel</button>
            </div>
          </div>
        )}

        {canvasEl}

        {step === "corners" && (
          <div className="space-y-2.5">
            <p className="text-[13px] text-[var(--c-text2)]">Drag the four dots onto the corners of the scanner's screen (the whole display, not just the image). A magnifier shows while you drag.</p>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[12px] text-[var(--c-muted)] mr-1">Screen shape</span>
              {(["16:9", "16:10", "4:3", "corners"] as Aspect[]).map((a) => <button key={a} type="button" onClick={() => setAspect(a)} className={chip(aspect === a)}>{a === "corners" ? "From corners" : a}</button>)}
            </div>
            <p className="text-[11.5px] text-[var(--c-muted)]">Pick the scanner screen's real shape so sideways and up-down distances match (most widescreen scanner monitors are 16:9 or 16:10). "From corners" guesses it and is less accurate.</p>
            <button type="button" onClick={straighten} disabled={!!busy} className={`${primary} w-full py-3`}>Straighten</button>
          </div>
        )}

        {step === "mask" && (
          <div className="space-y-2.5">
            <p className="text-[13px] text-[var(--c-text2)]">Drag the red line down until the patient name, ID and date at the top are covered. Drag the lower line up if anything identifying is at the bottom. Covered areas are blacked out before measuring and the unmasked photo is then discarded.</p>
            <button type="button" onClick={applyMask} className={`${primary} w-full py-3`}>Black out and continue</button>
          </div>
        )}

        {step === "scale" && (
          <div className="space-y-3">
            <div className="flex gap-1.5">
              <button type="button" onClick={() => setMode("2d")} className={chip(mode === "2d")}>2D or M-mode</button>
              <button type="button" onClick={() => setMode("doppler")} className={chip(mode === "doppler")}>Doppler</button>
            </div>
            {mode === "2d" ? (
              <div className="space-y-2.5">
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setScaleBy("ruler")} className={chip(scaleBy === "ruler")}>Depth ruler</button>
                  <button type="button" onClick={() => setScaleBy("points")} className={chip(scaleBy === "points")}>Known distance</button>
                </div>
                {scaleBy === "ruler" ? (
                  <>
                    <p className="text-[13px] text-[var(--c-text2)]">{ruler ? `Found ${ruler.ticks.length} ruler ticks (green dots), ${ruler.period.toFixed(1)} pixels apart.` : "No ruler found automatically."} Check the green dots sit on the depth ruler's marks. If not, drag the dashed line along the ruler and press Find ticks.</p>
                    <div className="flex gap-2 items-end">
                      <label className="flex-1"><span className="block text-[11px] font-semibold text-[var(--c-muted)] mb-1">Distance between ticks (cm)</span>
                        <input inputMode="decimal" value={tickCm} onChange={(e) => setTickCm(e.target.value)} className={inputCls} /></label>
                      <button type="button" onClick={findRulerAlong} className={outline}><RulerIcon className="w-4 h-4" /> Find ticks</button>
                    </div>
                    <p className="text-[11.5px] text-[var(--c-muted)]">Usually 1 cm. If the ruler shows only large marks every 5 cm, enter 5.</p>
                  </>
                ) : (
                  <>
                    <p className="text-[13px] text-[var(--c-text2)]">Drag the two ends of the dashed line onto two depth labels (for example 5 and 15 cm) and enter the distance between them.</p>
                    <label className="block"><span className="block text-[11px] font-semibold text-[var(--c-muted)] mb-1">Distance between the ends (cm)</span>
                      <input inputMode="decimal" value={scaleCm} onChange={(e) => setScaleCm(e.target.value)} placeholder="e.g. 10" className={inputCls} /></label>
                  </>
                )}
                {cmPerPx && <p className="text-[12.5px] font-bold text-[var(--c-teal)]">Scale: {(1 / cmPerPx).toFixed(1)} pixels per cm</p>}
              </div>
            ) : (
              <div className="space-y-2.5">
                <p className="text-[13px] text-[var(--c-text2)]">Drag the blue line onto the zero baseline and the amber line onto a labelled velocity on the scale, and enter that velocity. Drag the grey edges to frame the spectral strip with whole beats inside.</p>
                <label className="block"><span className="block text-[11px] font-semibold text-[var(--c-muted)] mb-1">Velocity at the amber line (cm/s; 1 m/s = 100)</span>
                  <input inputMode="decimal" value={refCms} onChange={(e) => setRefCms(e.target.value)} className={inputCls} /></label>
                <label className="block"><span className="block text-[11px] font-semibold text-[var(--c-muted)] mb-1">Optional, for VTI: seconds between the two dashed blue time lines</span>
                  <input inputMode="decimal" value={timeS} onChange={(e) => setTimeS(e.target.value)} placeholder="e.g. 1 (two time-scale marks)" className={inputCls} /></label>
                {!dScale?.secPerPx && <p className="text-[11.5px] text-[var(--c-muted)]">Without the time scale you still get peak velocity and mean gradient, but not VTI.</p>}
              </div>
            )}
            <button type="button" disabled={!scaleOk} onClick={() => { setTool(mode === "2d" ? "lv" : "auto"); setResults([]); setWarnings([]); setAdded(false); setStep("measure"); }} className={`${primary} w-full py-3`}>Next: measure</button>
          </div>
        )}

        {step === "measure" && img && (
          <div className="space-y-3">
            {img.frames.length > 1 && (
              <label className="block"><span className="block text-[11px] font-semibold text-[var(--c-muted)] mb-1">Frame {frame + 1} of {img.frames.length}</span>
                <input type="range" min={0} max={img.frames.length - 1} value={frame} onChange={(e) => setFrame(Number(e.target.value))} className="w-full" /></label>
            )}
            <div className="flex flex-wrap gap-1.5">
              {mode === "2d" ? (<>
                <button type="button" onClick={() => setTool("lv")} className={chip(tool === "lv")}>LV walls (PLAX)</button>
                <button type="button" onClick={() => setTool("lumen")} className={chip(tool === "lumen")}>Diameter (auto)</button>
                <button type="button" onClick={() => setTool("caliper")} className={chip(tool === "caliper")}>Caliper</button>
              </>) : (<>
                <button type="button" onClick={() => setTool("auto")} className={chip(tool === "auto")}>Trace envelope</button>
                <button type="button" onClick={() => setTool("speed")} className={chip(tool === "speed")}>Single velocity</button>
              </>)}
            </div>
            <p className="text-[13px] text-[var(--c-text2)]">
              {tool === "lv" && `Drag the dashed line from the RV, across the septum, LV and posterior wall, to just past the pericardium, at the mitral leaflet tips and square to the walls.${img.frames.length > 1 ? " Edges are found on every frame: widest cavity = diastole, narrowest = systole." : " One frame gives IVSd, LVIDd and LVPWd; use a clip for LVIDs."}`}
              {tool === "lumen" && "Drag the dashed line across the vessel (LVOT, aortic root, IVC), a little wider than it. The inner edges are found."}
              {tool === "caliper" && "Drag the dashed line where you want a caliper, then press Add. Drag its ends to adjust."}
              {tool === "auto" && "The outer edge of the spectrum is traced and split into beats. Choose what it is:"}
              {tool === "speed" && "Adds a marker; drag it to the peak you want (for example E, A, e′ or S′)."}
            </p>
            {tool === "auto" && (
              <div className="flex flex-wrap gap-1.5">{ENVELOPE_TARGETS.map((t) => <button key={t.id} type="button" onClick={() => setEnvTarget(t.id)} className={chip(envTarget === t.id)}>{t.label}</button>)}</div>
            )}
            <button type="button" onClick={run} className={`${primary} w-full py-3`}><Wand2 className="w-4 h-4" /> {tool === "caliper" || tool === "speed" ? "Add" : "Find automatically"}</button>
            {warnings.map((w) => <div key={w} className="rounded-xl p-2.5 text-[12.5px] bg-[color-mix(in_srgb,#D9A441_16%,transparent)] text-[var(--c-text)]">{w}</div>)}

            {results.length > 0 && (
              <div className="bg-[var(--c-surface)] rounded-[20px] p-3 space-y-2.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--c-muted)]">Proposed values (drag the amber ends on the image to correct)</p>
                {results.map((r) => (
                  <div key={r.uid} className="flex items-start gap-2">
                    <input type="checkbox" checked={r.on} onChange={(e) => setResults((rs) => rs.map((x) => (x.uid === r.uid ? { ...x, on: e.target.checked } : x)))} className="mt-2.5 w-4 h-4 accent-[var(--c-teal)]" aria-label="Include" />
                    <div className="flex-1 min-w-0 space-y-1">
                      {r.kind === "envelope" ? (
                        <select value={r.target} onChange={(e) => setResults((rs) => rs.map((x) => (x.uid === r.uid ? { ...x, target: e.target.value } : x)))} className={`${inputCls} py-1.5 text-[13.5px]`}>
                          {ENVELOPE_TARGETS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                        </select>
                      ) : (
                        <select value={r.key} onChange={(e) => setResults((rs) => rs.map((x) => (x.uid === r.uid ? { ...x, key: e.target.value } as Result : x)))} className={`${inputCls} py-1.5 text-[13.5px]`}>
                          {(r.kind === "distance" ? DISTANCE_TARGETS : SPEED_TARGETS).map((t) => <option key={t.key} value={t.key}>{labelOf(t.key)} ({unitOf(t.key)})</option>)}
                        </select>
                      )}
                      <div className="flex items-center gap-2 text-[13px]">
                        <span className="font-bold text-[var(--c-text)]">{value(r)}</span>
                        {r.kind === "distance" && img.frames.length > 1 && <button type="button" onClick={() => setFrame(r.frame)} className="text-[12px] font-bold text-[var(--c-teal)] underline">frame {r.frame + 1}</button>}
                      </div>
                      {r.kind === "envelope" && (
                        <div className="flex flex-wrap gap-1">{r.res.beats.map((b, i) => (
                          <button key={i} type="button" onClick={() => setResults((rs) => rs.map((x) => (x.uid === r.uid && x.kind === "envelope" ? { ...x, beatsOn: x.beatsOn.map((on, k) => (k === i ? !on : on)) } : x)))} className={chip(r.beatsOn[i])}>
                            Beat {i + 1}: {b.peakVelocityMs.toFixed(2)} m/s
                          </button>
                        ))}</div>
                      )}
                    </div>
                    <button type="button" aria-label="Remove" onClick={() => setResults((rs) => rs.filter((x) => x.uid !== r.uid))} className="p-2 text-[var(--c-muted)]"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
                {Object.keys(pending).length > 0 && (
                  <div className="text-[12px] text-[var(--c-muted)]">
                    Goes to the report: {Object.entries(pending).map(([k, v]) => `${labelOf(k)} ${v}${unitOf(k) ? ` ${unitOf(k)}` : ""}`).join(" · ")}
                  </div>
                )}
                <button type="button" disabled={!Object.keys(pending).length} onClick={addToReport} className={`${primary} w-full py-3`}>
                  {added ? <><Check className="w-4 h-4" /> Added. Add again after changes</> : `I've checked these: add ${Object.keys(pending).length} to the report`}
                </button>
                {added && <button type="button" onClick={onClose} className={`${outline} w-full`}>Done</button>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
