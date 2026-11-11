import React, { useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Grade, Level, bsaMosteller, rapFromIvc, fmt, GRADERS, DERIVED_GRADERS, vexus, hvLevel, irvLevel, pvLevel, HV_OPTS, IRV_OPTS } from "../lib/echo";
import { card, inputCls, GradeBadge, InfoButton, Sheet, CaveatList } from "./ui";

interface In { k: string; label: string; unit: string; options?: string[] }
interface Out { label: string; value?: number; unit: string; dp: number; grade?: Grade | null; note?: string }
interface Calc { id: string; title: string; group?: string; inputs: In[]; caveats?: string[]; run: (n: Record<string, number | undefined>, s: Record<string, string>) => Out[] }

const area = (d?: number) => (d ? Math.PI * (d / 2) ** 2 : undefined);
const gr = (level: Level, text: string): Grade => ({ level, text });

/** Chen et al. JACC 2001: single-beat end-systolic elastance. Times in ms, EF as a fraction. */
function eesSingleBeat(sbp: number, dbp: number, sv: number, ef: number, pep: number, et: number) {
  const tNd = pep / (pep + et);
  const a = [0.35695, -7.2266, 74.249, -307.39, 684.54, -856.92, 571.95, -159.1];
  const endAvg = a.reduce((sum, c, i) => sum + c * tNd ** i, 0);
  const endEst = 0.0275 - 0.165 * ef + 0.3656 * (dbp / sbp) + 0.515 * endAvg;
  return (dbp - endEst * 0.9 * sbp) / (endEst * sv);
}
const vacGrade = (r: number) => r <= 1 ? gr("normal", "Coupled (≤ 1.0)") : r <= 1.36 ? gr("mild", "Mildly uncoupled (1.0–1.36)") : gr("moderate", "Uncoupled (> 1.36)");
const LUS_ZONES = ["R anterior upper", "R anterior lower", "R lateral upper", "R lateral lower", "R posterior upper", "R posterior lower", "L anterior upper", "L anterior lower", "L lateral upper", "L lateral lower", "L posterior upper", "L posterior lower"];
const LUS_OPTS = ["", "0", "1", "2", "3"];

const ADVANCED: Calc[] = [
  { id: "rvpa", group: "Haemodynamics and coupling", title: "RV–PA coupling (TAPSE/sPAP)", caveats: ["rvpa", "trv", "tapse"],
    inputs: [{ k: "tapse", label: "TAPSE", unit: "mm" }, { k: "trv", label: "TR Vmax", unit: "m/s" }, { k: "rap", label: "RAP (or CVP)", unit: "mmHg" }, { k: "spap", label: "or sPAP (override)", unit: "mmHg" }],
    run: ({ tapse, trv, rap, spap }) => { const sp = spap ?? (trv ? 4 * trv * trv + (rap ?? 8) : undefined); const r = tapse && sp ? tapse / sp : undefined; return [
      { label: "sPAP", value: sp, unit: "mmHg", dp: 0, note: spap === undefined && trv && rap === undefined ? "Using RAP 8 mmHg." : undefined },
      { label: "TAPSE/sPAP", value: r, unit: "mm/mmHg", dp: 2, grade: r === undefined ? null : r >= 0.55 ? gr("normal", "Coupled (≥ 0.55)") : r >= 0.31 ? gr("moderate", "Reduced (< 0.55)") : gr("severe", "Uncoupled range (< 0.31)") },
    ]; } },
  { id: "vac", group: "Haemodynamics and coupling", title: "LV–arterial coupling (Ea/Ees)", caveats: ["vac", "simpson"],
    inputs: [{ k: "sbp", label: "Systolic BP", unit: "mmHg" }, { k: "dbp", label: "Diastolic BP", unit: "mmHg" }, { k: "edv", label: "LV EDV", unit: "ml" }, { k: "esv", label: "LV ESV", unit: "ml" }, { k: "pep", label: "Pre-ejection time (Q to LVOT flow)", unit: "ms" }, { k: "et", label: "LVOT ejection time", unit: "ms" }],
    run: ({ sbp, dbp, edv, esv, pep, et }) => {
      const sv = edv && esv !== undefined ? edv - esv : undefined; const ef = sv && edv ? sv / edv : undefined; const esp = sbp ? 0.9 * sbp : undefined;
      const ea = esp && sv ? esp / sv : undefined; const eesS = esp && esv ? esp / esv : undefined;
      const eesC = sbp && dbp && sv && ef && pep && et ? eesSingleBeat(sbp, dbp, sv, ef, pep, et) : undefined;
      const rC = ea && eesC && eesC > 0 ? ea / eesC : undefined; const rS = sv && esv !== undefined ? esv / sv : undefined;
      return [
        { label: "Stroke volume", value: sv, unit: "ml", dp: 0 }, { label: "EF", value: ef !== undefined ? ef * 100 : undefined, unit: "%", dp: 0 },
        { label: "End-systolic pressure (0.9 × SBP)", value: esp, unit: "mmHg", dp: 0 },
        { label: "Ea (arterial elastance)", value: ea, unit: "mmHg/ml", dp: 2 },
        { label: "Ees, single beat (Chen)", value: eesC, unit: "mmHg/ml", dp: 2, note: eesC === undefined ? "Add BP, volumes and both Doppler times." : undefined },
        { label: "Ea/Ees, single beat", value: rC, unit: "", dp: 2, grade: rC ? vacGrade(rC) : null },
        { label: "Ea/Ees, simplified (ESV/SV)", value: rS, unit: "", dp: 2, grade: rS ? vacGrade(rS) : null, note: rS ? `Simplified Ees (ESP/ESV) ${fmt(eesS, 2)} mmHg/ml. Trend only.` : undefined },
      ]; } },
  { id: "pvr", group: "Haemodynamics and coupling", title: "Pulmonary vascular resistance", caveats: ["pvr", "trv"],
    inputs: [{ k: "trv", label: "TR Vmax", unit: "m/s" }, { k: "vti", label: "RVOT VTI", unit: "cm" }],
    run: ({ trv, vti }) => { const p = trv && vti ? (10 * trv) / vti + 0.16 : undefined; return [{ label: "TRV / RVOT VTI", value: trv && vti ? trv / vti : undefined, unit: "", dp: 3 }, { label: "PVR (Abbas)", value: p, unit: "WU", dp: 1, grade: p === undefined ? null : p <= 2 ? gr("normal", "≤ 2 WU") : p <= 5 ? gr("moderate", "Raised (> 2 WU)") : gr("severe", "Markedly raised (> 5 WU)"), note: "Underestimates when PVR is very high (> 8 WU)." }]; } },
  { id: "svr", group: "Haemodynamics and coupling", title: "Systemic vascular resistance", caveats: ["svr", "lvot_d"],
    inputs: [{ k: "map", label: "MAP", unit: "mmHg" }, { k: "rap", label: "RAP / CVP", unit: "mmHg" }, { k: "co", label: "Cardiac output", unit: "L/min" }, { k: "bsa", label: "BSA (optional)", unit: "m²" }],
    run: ({ map, rap, co, bsa }) => { const v = map && co ? (80 * (map - (rap ?? 0))) / co : undefined; return [
      { label: "SVR", value: v, unit: "dyn·s/cm⁵", dp: 0, grade: v === undefined ? null : v < 800 ? gr("moderate", "Low (vasodilated)") : v > 1200 ? gr("moderate", "High (vasoconstricted)") : gr("normal", "800–1200") },
      { label: "SVR index", value: v && bsa ? v * bsa : undefined, unit: "dyn·s/cm⁵/m²", dp: 0, note: "Normal about 1970–2390." },
    ]; } },
  { id: "resp", group: "Haemodynamics and coupling", title: "Respiratory variation (ventilated)", caveats: ["fluid_resp", "ivc_vent"],
    inputs: [{ k: "vmax", label: "Aortic / LVOT Vpeak max", unit: "cm/s" }, { k: "vmin", label: "Vpeak min", unit: "cm/s" }, { k: "dmax", label: "IVC max diameter", unit: "mm" }, { k: "dmin", label: "IVC min diameter", unit: "mm" }],
    run: ({ vmax, vmin, dmax, dmin }) => { const dv = vmax && vmin ? ((vmax - vmin) / ((vmax + vmin) / 2)) * 100 : undefined; const di = dmax && dmin ? ((dmax - dmin) / dmin) * 100 : undefined; const ci = dmax && dmin !== undefined ? ((dmax - dmin) / dmax) * 100 : undefined; return [
      { label: "ΔVpeak", value: dv, unit: "%", dp: 0, grade: dv === undefined ? null : dv > 12 ? gr("info", "> 12%: likely fluid responsive") : gr("info", "≤ 12%: unlikely") },
      { label: "IVC distensibility (ventilated)", value: di, unit: "%", dp: 0, grade: di === undefined ? null : di > 18 ? gr("info", "> 18%: likely fluid responsive") : gr("info", "≤ 18%: unlikely") },
      { label: "IVC collapsibility (spontaneous)", value: ci, unit: "%", dp: 0, note: "Weak predictor when breathing spontaneously; prefer a passive leg raise." },
    ]; } },
  { id: "lap", group: "Haemodynamics and coupling", title: "Estimated LA pressure (Nagueh)", caveats: ["eprime", "diast_invalid"],
    inputs: [{ k: "e", label: "Mitral E", unit: "cm/s" }, { k: "es", label: "Septal e′", unit: "cm/s" }, { k: "el", label: "Lateral e′", unit: "cm/s" }],
    run: ({ e, es, el }) => { const avg = es && el ? (es + el) / 2 : es ?? el; const r = e && avg ? e / avg : undefined; return [{ label: "E/e′", value: r, unit: "", dp: 1 }, { label: "PCWP estimate", value: r ? 1.24 * r + 1.9 : undefined, unit: "mmHg", dp: 0, note: "Rough estimate: use the ASE 2025 algorithm in the report to grade filling pressure." }]; } },
  { id: "dpdt", group: "LV and RV function", title: "LV and RV dP/dt", caveats: ["dpdt"],
    inputs: [{ k: "lv", label: "MR: time 1 → 3 m/s", unit: "ms" }, { k: "rv", label: "TR: time 0.5 → 2 m/s", unit: "ms" }],
    run: ({ lv, rv }) => { const l = lv ? 32000 / lv : undefined; const r = rv ? 15000 / rv : undefined; return [
      { label: "LV dP/dt", value: l, unit: "mmHg/s", dp: 0, grade: l === undefined ? null : l > 1200 ? gr("normal", "Normal (> 1200)") : l >= 1000 ? gr("borderline", "Borderline (1000–1200)") : l >= 800 ? gr("moderate", "Reduced (< 1000)") : gr("severe", "Severely reduced (< 800)") },
      { label: "RV dP/dt", value: r, unit: "mmHg/s", dp: 0, grade: r === undefined ? null : r >= 400 ? gr("normal", "≥ 400") : gr("moderate", "Reduced (< 400)") },
    ]; } },
  { id: "tei", group: "LV and RV function", title: "Myocardial performance (Tei) index", caveats: ["tei"],
    inputs: [{ k: "ivct", label: "IVCT", unit: "ms" }, { k: "ivrt", label: "IVRT", unit: "ms" }, { k: "et", label: "Ejection time", unit: "ms" }, { k: "side", label: "Ventricle / method", unit: "", options: ["", "LV", "RV (PW)", "RV (tissue Doppler)"] }],
    run: ({ ivct, ivrt, et }, s) => { const m = ivct !== undefined && ivrt !== undefined && et ? (ivct + ivrt) / et : undefined; const cut = s.side === "RV (PW)" ? 0.43 : s.side === "RV (tissue Doppler)" ? 0.54 : undefined; return [
      { label: "MPI", value: m, unit: "", dp: 2, grade: m === undefined || cut === undefined ? null : m > cut ? gr("moderate", `Abnormal (> ${cut})`) : gr("normal", `Normal (≤ ${cut})`), note: s.side === "LV" ? "LV normal about 0.39 ± 0.05; higher = worse global function." : undefined },
    ]; } },
  { id: "epss", group: "LV and RV function", title: "E-point septal separation", caveats: ["epss"],
    inputs: [{ k: "epss", label: "EPSS", unit: "mm" }],
    run: ({ epss }) => [{ label: "EPSS", value: epss, unit: "mm", dp: 0, grade: epss === undefined ? null : epss > 7 ? gr("moderate", "> 7 mm: suggests reduced EF") : gr("normal", "≤ 7 mm") }] },
  { id: "vexus", group: "VExUS", title: "VExUS grade", caveats: ["vexus"],
    inputs: [{ k: "ivc", label: "IVC max diameter", unit: "cm" }, { k: "hv", label: "Hepatic vein", unit: "", options: ["", ...HV_OPTS] }, { k: "pvmax", label: "Portal Vmax", unit: "cm/s" }, { k: "pvmin", label: "Portal Vmin", unit: "cm/s" }, { k: "pf", label: "or pulsatility fraction", unit: "%" }, { k: "irv", label: "Intrarenal vein", unit: "", options: ["", ...IRV_OPTS] }],
    run: ({ ivc, pvmax, pvmin, pf }, s) => { const p = pf ?? (pvmax && pvmin !== undefined ? ((pvmax - pvmin) / pvmax) * 100 : undefined); const r = vexus(ivc, hvLevel(s.hv), pvLevel(p), irvLevel(s.irv)); const lv: Level[] = ["normal", "mild", "moderate", "severe"]; return [
      { label: "Portal pulsatility fraction", value: p, unit: "%", dp: 0, grade: p === undefined ? null : p >= 50 ? gr("severe", "Severe (≥ 50%)") : p >= 30 ? gr("mild", "Mild (30–49%)") : gr("normal", "Normal (< 30%)") },
      { label: "VExUS", value: r.grade, unit: "", dp: 0, grade: gr(r.grade === undefined ? "info" : lv[r.grade], r.text) },
    ]; } },
  { id: "tcd", group: "Brain and eye", title: "Transcranial Doppler indices", caveats: ["tcd"],
    inputs: [{ k: "psv", label: "MCA PSV", unit: "cm/s" }, { k: "edv", label: "MCA EDV", unit: "cm/s" }, { k: "mfv", label: "MCA mean (if measured)", unit: "cm/s" }, { k: "ica", label: "Extracranial ICA mean", unit: "cm/s" }],
    run: ({ psv, edv, mfv, ica }) => { const m = mfv ?? (psv && edv !== undefined ? (psv + 2 * edv) / 3 : undefined); const pi = m && psv && edv !== undefined ? (psv - edv) / m : undefined; const lr = m && ica ? m / ica : undefined;
      const vs = m === undefined ? null : m > 200 && (lr === undefined || lr > 6) ? gr("severe", "Severe vasospasm range (> 200)") : m >= 120 ? (lr !== undefined && lr < 3 ? gr("mild", "High velocity, LR < 3: hyperaemia") : gr("moderate", "Vasospasm range (120–200)")) : gr("normal", "< 120 cm/s");
      return [
        { label: "MCA mean velocity", value: m, unit: "cm/s", dp: 0, grade: vs, note: mfv === undefined && m ? "Estimated as (PSV + 2 × EDV) / 3." : undefined },
        { label: "Pulsatility index", value: pi, unit: "", dp: 2, grade: pi === undefined ? null : pi > 1.2 ? gr("moderate", "Raised (> 1.2)") : pi < 0.6 ? gr("mild", "Low (< 0.6)") : gr("normal", "0.6–1.2") },
        { label: "Resistive index", value: psv && edv !== undefined ? (psv - edv) / psv : undefined, unit: "", dp: 2 },
        { label: "Lindegaard ratio", value: lr, unit: "", dp: 1, grade: lr === undefined ? null : lr > 6 ? gr("severe", "> 6: severe vasospasm") : lr >= 3 ? gr("moderate", "3–6: vasospasm") : gr("normal", "< 3") },
        { label: "EDV", value: edv, unit: "cm/s", dp: 0, grade: edv === undefined ? null : edv < 20 ? gr("moderate", "< 20 cm/s: low diastolic flow") : null },
      ]; } },
  { id: "onsd", group: "Brain and eye", title: "Optic nerve sheath diameter", caveats: ["onsd"],
    inputs: [{ k: "rt", label: "Right, transverse", unit: "mm" }, { k: "rs", label: "Right, sagittal", unit: "mm" }, { k: "lt", label: "Left, transverse", unit: "mm" }, { k: "ls", label: "Left, sagittal", unit: "mm" }, { k: "age", label: "Patient", unit: "", options: ["", "Adult", "Child > 1 year", "Infant < 1 year"] }],
    run: ({ rt, rs, lt, ls }, s) => { const xs = [rt, rs, lt, ls].filter((x): x is number => x !== undefined); const m = xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : undefined; const cut = s.age === "Infant < 1 year" ? 4.0 : s.age === "Child > 1 year" ? 4.5 : 5.7;
      const avg = (a?: number, b?: number) => (a !== undefined && b !== undefined ? (a + b) / 2 : a ?? b);
      return [
        { label: "Right eye", value: avg(rt, rs), unit: "mm", dp: 1 }, { label: "Left eye", value: avg(lt, ls), unit: "mm", dp: 1 },
        { label: "Mean ONSD", value: m, unit: "mm", dp: 1, grade: m === undefined ? null : m > cut ? gr("moderate", `Suggests raised ICP (> ${cut} mm)`) : cut === 5.7 && m > 5.0 ? gr("borderline", "Borderline (5.0–5.7 mm)") : gr("normal", `≤ ${cut === 5.7 ? 5.0 : cut} mm`), note: xs.length < 4 && m !== undefined ? `Based on ${xs.length} of 4 measurements.` : undefined },
      ]; } },
  { id: "lus", group: "Lung and diaphragm", title: "Lung ultrasound (LUS) score", caveats: ["lus_score", "lus"],
    inputs: LUS_ZONES.map((z, i) => ({ k: `z${i}`, label: z, unit: "", options: LUS_OPTS })),
    run: (_n, s) => { const sc = LUS_ZONES.map((_, i) => s[`z${i}`]).filter((x) => x !== undefined && x !== ""); const tot = sc.reduce((a, b) => a + Number(b), 0); return [
      { label: `Total (${sc.length} of 12 zones)`, value: sc.length ? tot : undefined, unit: "/ 36", dp: 0, grade: sc.length < 12 ? null : tot > 17 ? gr("severe", "> 17: post-extubation distress likely") : tot >= 13 ? gr("borderline", "13–17: intermediate") : gr("normal", "< 13: extubation success likely"), note: "0 = A-lines; 1 = ≥ 3 separate B-lines; 2 = coalescent B-lines; 3 = consolidation." },
    ]; } },
  { id: "effusion", group: "Lung and diaphragm", title: "Pleural effusion volume (Balik)", caveats: ["effusion_vol"],
    inputs: [{ k: "sep", label: "Max pleural separation", unit: "mm" }],
    run: ({ sep }) => [{ label: "Estimated volume", value: sep ? 20 * sep : undefined, unit: "ml", dp: 0, note: "Supine, end-expiration, at the lung base, posterior axillary line." }] },
  { id: "diaphragm", group: "Lung and diaphragm", title: "Diaphragm excursion and thickening", caveats: ["diaphragm"],
    inputs: [{ k: "exc", label: "Excursion (quiet breathing)", unit: "mm" }, { k: "ti", label: "Thickness, end-inspiration", unit: "mm" }, { k: "te", label: "Thickness, end-expiration", unit: "mm" }],
    run: ({ exc, ti, te }) => { const dtf = ti && te ? ((ti - te) / te) * 100 : undefined; return [
      { label: "Excursion", value: exc, unit: "mm", dp: 0, grade: exc === undefined ? null : exc < 10 ? gr("moderate", "< 10 mm: dysfunction") : gr("normal", "≥ 10 mm") },
      { label: "Thickening fraction", value: dtf, unit: "%", dp: 0, grade: dtf === undefined ? null : dtf >= 30 ? gr("normal", "≥ 30%") : gr("moderate", "< 30%: weaning failure more likely") },
    ]; } },
];

const BASIC: Calc[] = [
  { id: "bsa", title: "Body surface area", caveats: ["bsa"], inputs: [{ k: "h", label: "Height", unit: "cm" }, { k: "w", label: "Weight", unit: "kg" }],
    run: ({ h, w }) => [{ label: "BSA (Mosteller)", value: bsaMosteller(h, w), unit: "m²", dp: 2 }, { label: "BSA (DuBois)", value: h && w ? 0.007184 * w ** 0.425 * h ** 0.725 : undefined, unit: "m²", dp: 2 }] },
  { id: "sv", title: "Stroke volume and cardiac output", caveats: ["lvot_d", "lvot_vti"],
    inputs: [{ k: "d", label: "LVOT diameter", unit: "cm" }, { k: "vti", label: "LVOT VTI", unit: "cm" }, { k: "hr", label: "Heart rate", unit: "bpm" }, { k: "bsa", label: "BSA (optional)", unit: "m²" }],
    run: ({ d, vti, hr, bsa }) => { const sv = area(d) && vti ? area(d)! * vti : undefined; const co = sv && hr ? (sv * hr) / 1000 : undefined; return [
      { label: "LVOT area", value: area(d), unit: "cm²", dp: 2 }, { label: "Stroke volume", value: sv, unit: "ml", dp: 0 },
      { label: "SV index", value: sv && bsa ? sv / bsa : undefined, unit: "ml/m²", dp: 0, grade: sv && bsa ? DERIVED_GRADERS.svi!(sv / bsa, {}) : null },
      { label: "Cardiac output", value: co, unit: "L/min", dp: 1 }, { label: "Cardiac index", value: co && bsa ? co / bsa : undefined, unit: "L/min/m²", dp: 1, grade: co && bsa ? DERIVED_GRADERS.ci!(co / bsa, {}) : null },
    ]; } },
  { id: "fluid", title: "Fluid responsiveness (VTI change)", caveats: ["lvot_vti"],
    inputs: [{ k: "pre", label: "VTI before", unit: "cm" }, { k: "post", label: "VTI after challenge / PLR", unit: "cm" }],
    run: ({ pre, post }) => { const ch = pre && post ? ((post - pre) / pre) * 100 : undefined; return [{ label: "Change", value: ch, unit: "%", dp: 0, note: ch === undefined ? undefined : ch >= 10 ? "≥ 10–15% suggests fluid responsiveness (same probe position, same beat selection)." : "< 10%: not fluid responsive by this test." }]; } },
  { id: "rvsp", title: "RVSP and mean PAP", caveats: ["trv", "ivc_vent"],
    inputs: [{ k: "trv", label: "TR Vmax", unit: "m/s" }, { k: "ivc", label: "IVC diameter", unit: "cm" }, { k: "col", label: "Collapse with sniff", unit: "", options: ["", "> 50%", "< 50%"] }, { k: "rap", label: "or RAP (override)", unit: "mmHg" }, { k: "tapse", label: "TAPSE (optional)", unit: "mm" }],
    run: ({ trv, ivc, rap, tapse }, s) => { const r = rap ?? rapFromIvc(ivc, s.col); const rvsp = trv ? 4 * trv * trv + (r ?? 8) : undefined; return [
      { label: "Estimated RAP", value: r, unit: "mmHg", dp: 0, note: r === undefined ? "Using 8 mmHg if not given." : undefined },
      { label: "Peak TR gradient", value: trv ? 4 * trv * trv : undefined, unit: "mmHg", dp: 0 },
      { label: "RVSP", value: rvsp, unit: "mmHg", dp: 0, grade: rvsp ? DERIVED_GRADERS.rvsp!(rvsp, {}) : null },
      { label: "Mean PAP (Chemla)", value: rvsp ? 0.61 * rvsp + 2 : undefined, unit: "mmHg", dp: 0 },
      { label: "TAPSE/sPAP", value: tapse && rvsp ? tapse / rvsp : undefined, unit: "mm/mmHg", dp: 2, grade: tapse && rvsp ? DERIVED_GRADERS.tapse_spap!(tapse / rvsp, {}) : null },
    ]; } },
  { id: "ava", title: "Aortic valve area (continuity)", caveats: ["as_grade", "lvot_d"],
    inputs: [{ k: "d", label: "LVOT diameter", unit: "cm" }, { k: "lvti", label: "LVOT VTI", unit: "cm" }, { k: "avti", label: "AV VTI", unit: "cm" }, { k: "vmax", label: "AV Vmax (optional)", unit: "m/s" }, { k: "bsa", label: "BSA (optional)", unit: "m²" }],
    run: ({ d, lvti, avti, vmax, bsa }) => { const a = area(d) && lvti && avti ? (area(d)! * lvti) / avti : undefined; const dvi = lvti && avti ? lvti / avti : undefined; return [
      { label: "AVA", value: a, unit: "cm²", dp: 2, grade: a ? DERIVED_GRADERS.ava!(a, {}) : null },
      { label: "AVA index", value: a && bsa ? a / bsa : undefined, unit: "cm²/m²", dp: 2, grade: a && bsa ? DERIVED_GRADERS.avai!(a / bsa, {}) : null },
      { label: "Dimensionless index", value: dvi, unit: "", dp: 2, grade: dvi ? DERIVED_GRADERS.dvi!(dvi, {}) : null },
      { label: "Peak gradient", value: vmax ? 4 * vmax * vmax : undefined, unit: "mmHg", dp: 0, grade: vmax ? GRADERS.av_vmax(vmax, {}, {}) : null },
    ]; } },
  { id: "pisa", title: "PISA: EROA and regurgitant volume", caveats: ["pisa", "regurg"],
    inputs: [{ k: "r", label: "PISA radius", unit: "cm" }, { k: "va", label: "Aliasing velocity", unit: "cm/s" }, { k: "vmax", label: "Regurgitant jet Vmax", unit: "cm/s" }, { k: "vti", label: "Regurgitant jet VTI", unit: "cm" }],
    run: ({ r, va, vmax, vti }) => { const flow = r && va ? 2 * Math.PI * r * r * va : undefined; const eroa = flow && vmax ? flow / vmax : undefined; const rvol = eroa && vti ? eroa * vti : undefined; return [
      { label: "Flow rate", value: flow, unit: "ml/s", dp: 0 },
      { label: "EROA", value: eroa, unit: "cm²", dp: 2, grade: eroa ? GRADERS.mr_eroa(eroa, {}, {}) : null, note: "Grades shown for MR. Check jet Vmax is in cm/s (e.g. 5 m/s = 500)." },
      { label: "Regurgitant volume", value: rvol, unit: "ml", dp: 0 },
    ]; } },
  { id: "ms", title: "Mitral valve area (pressure half-time)", caveats: ["ms_grade"],
    inputs: [{ k: "pht", label: "Pressure half-time", unit: "ms" }],
    run: ({ pht }) => [{ label: "MVA", value: pht ? 220 / pht : undefined, unit: "cm²", dp: 1, grade: pht ? DERIVED_GRADERS.mva_pht!(220 / pht, {}) : null }] },
  { id: "bern", title: "Pressure gradient (Bernoulli)", caveats: ["bernoulli"], inputs: [{ k: "v", label: "Peak velocity", unit: "m/s" }, { k: "v1", label: "Proximal velocity (optional)", unit: "m/s" }],
    run: ({ v, v1 }) => [{ label: "Simplified 4V²", value: v ? 4 * v * v : undefined, unit: "mmHg", dp: 0 }, { label: "Modified 4(V2² − V1²)", value: v && v1 ? 4 * (v * v - v1 * v1) : undefined, unit: "mmHg", dp: 0, note: "Use when the proximal velocity is > 1.5 m/s." }] },
  { id: "lvmass", title: "LV mass and geometry", caveats: ["linear_lv"],
    inputs: [{ k: "ivs", label: "IVSd", unit: "cm" }, { k: "lvid", label: "LVIDd", unit: "cm" }, { k: "pw", label: "LVPWd", unit: "cm" }, { k: "bsa", label: "BSA", unit: "m²" }, { k: "sex", label: "Sex", unit: "", options: ["", "M", "F"] }],
    run: ({ ivs, lvid, pw, bsa }, s) => { const m = ivs && lvid && pw ? 0.8 * 1.04 * ((ivs + lvid + pw) ** 3 - lvid ** 3) + 0.6 : undefined; const rwt = lvid && pw ? (2 * pw) / lvid : undefined; const lvmi = m && bsa ? m / bsa : undefined;
      const geo = lvmi && rwt && s.sex ? ((lvmi > (s.sex === "F" ? 95 : 115)) ? (rwt > 0.42 ? "Concentric hypertrophy" : "Eccentric hypertrophy") : (rwt > 0.42 ? "Concentric remodelling" : "Normal geometry")) : undefined;
      return [{ label: "LV mass", value: m, unit: "g", dp: 0 }, { label: "LV mass index", value: lvmi, unit: "g/m²", dp: 0, grade: lvmi ? DERIVED_GRADERS.lvmi!(lvmi, { sex: s.sex }) : null }, { label: "RWT", value: rwt, unit: "", dp: 2, grade: rwt ? DERIVED_GRADERS.rwt!(rwt, {}) : null, note: geo }]; } },
  { id: "ef", title: "EF and FAC from volumes / areas", caveats: ["simpson", "fac"],
    inputs: [{ k: "edv", label: "EDV", unit: "ml" }, { k: "esv", label: "ESV", unit: "ml" }, { k: "eda", label: "RV EDA", unit: "cm²" }, { k: "esa", label: "RV ESA", unit: "cm²" }],
    run: ({ edv, esv, eda, esa }) => { const ef = edv && esv !== undefined ? ((edv - esv) / edv) * 100 : undefined; const fac = eda && esa !== undefined ? ((eda - esa) / eda) * 100 : undefined; return [
      { label: "LVEF", value: ef, unit: "%", dp: 0, grade: ef !== undefined ? GRADERS.ef(ef, {}, {}) : null }, { label: "RV FAC", value: fac, unit: "%", dp: 0, grade: fac !== undefined ? DERIVED_GRADERS.fac!(fac, {}) : null },
    ]; } },
  { id: "la", title: "LA volume (area-length)", caveats: ["la_vol"],
    inputs: [{ k: "a1", label: "A4C LA area", unit: "cm²" }, { k: "a2", label: "A2C LA area", unit: "cm²" }, { k: "l", label: "Shorter LA length", unit: "cm" }, { k: "bsa", label: "BSA", unit: "m²" }],
    run: ({ a1, a2, l, bsa }) => { const vol = a1 && a2 && l ? (0.85 * a1 * a2) / l : undefined; return [{ label: "LA volume", value: vol, unit: "ml", dp: 0 }, { label: "LAVI", value: vol && bsa ? vol / bsa : undefined, unit: "ml/m²", dp: 0, grade: vol && bsa ? DERIVED_GRADERS.lavi!(vol / bsa, {}) : null }]; } },
  { id: "qpqs", title: "Shunt ratio (Qp:Qs)", caveats: ["qpqs", "lvot_d"],
    inputs: [{ k: "rd", label: "RVOT diameter", unit: "cm" }, { k: "rvti", label: "RVOT VTI", unit: "cm" }, { k: "ld", label: "LVOT diameter", unit: "cm" }, { k: "lvti", label: "LVOT VTI", unit: "cm" }],
    run: ({ rd, rvti, ld, lvti }) => { const qp = area(rd) && rvti ? area(rd)! * rvti : undefined; const qs = area(ld) && lvti ? area(ld)! * lvti : undefined; return [{ label: "Qp:Qs", value: qp && qs ? qp / qs : undefined, unit: "", dp: 2, note: "> 1.5 suggests a significant left-to-right shunt." }]; } },
  { id: "ee", title: "E/e′ and E/A", caveats: ["diast_invalid", "eprime"],
    inputs: [{ k: "e", label: "E", unit: "cm/s" }, { k: "a", label: "A", unit: "cm/s" }, { k: "es", label: "Septal e′", unit: "cm/s" }, { k: "el", label: "Lateral e′", unit: "cm/s" }],
    run: ({ e, a, es, el }) => { const avg = es && el ? (es + el) / 2 : es ?? el; const r = e && avg ? e / avg : undefined; return [{ label: "E/A", value: e && a ? e / a : undefined, unit: "", dp: 1 }, { label: "E/e′ (average)", value: r, unit: "", dp: 1, grade: r ? DERIVED_GRADERS.e_eprime!(r, {}) : null }, { label: "E/septal e′", value: e && es ? e / es : undefined, unit: "", dp: 1, note: "In AF, ≥ 11 supports raised filling pressure." }]; } },
];
const HAEMO_IDS = new Set(["sv", "fluid", "rvsp"]);
const CALCS: Calc[] = [...BASIC.map((c) => ({ ...c, group: HAEMO_IDS.has(c.id) ? "Haemodynamics and coupling" : "Chambers and valves" })), ...ADVANCED];
const GROUPS = ["Haemodynamics and coupling", "Chambers and valves", "LV and RV function", "VExUS", "Brain and eye", "Lung and diaphragm"];

export const CalcScreen: React.FC = () => {
  const [open, setOpen] = useState<string | null>("sv");
  const [vals, setVals] = useState<Record<string, Record<string, string>>>({});
  const [tips, setTips] = useState<Calc | null>(null);
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();
  const list = CALCS.filter((c) => !ql || `${c.title} ${c.group} ${c.inputs.map((i) => i.label).join(" ")}`.toLowerCase().includes(ql));
  const renderCalc = (c: Calc) => {
    const s = vals[c.id] || {};
    const n = Object.fromEntries(c.inputs.map((i) => { const x = Number((s[i.k] || "").replace(",", ".")); return [i.k, s[i.k] && Number.isFinite(x) ? x : undefined]; }));
    const isOpen = open === c.id || (!!ql && list.length <= 2);
    const outs = isOpen ? c.run(n, s) : [];
    return (
      <div key={c.id} className={`${card} break-inside-avoid mb-2.5`}>
        <button type="button" onClick={(e) => { const el = e.currentTarget; const opening = open !== c.id; setOpen(opening ? c.id : null); if (opening) requestAnimationFrame(() => requestAnimationFrame(() => el.scrollIntoView({ block: "start", behavior: "smooth" }))); }} className="w-full flex items-center justify-between px-4 py-3 text-left scroll-mt-4">
          <span className="flex items-center gap-2 text-sm font-bold text-[var(--c-text)]">{isOpen ? <ChevronDown className="w-4 h-4 shrink-0" /> : <ChevronRight className="w-4 h-4 shrink-0" />}{c.title}</span>
          {c.caveats && <InfoButton label={c.title} onClick={() => setTips(c)} />}
        </button>
        {isOpen && (
          <div className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {c.inputs.map((i) => (
                <div key={i.k}>
                  <label className="block text-[11px] font-semibold text-[var(--c-muted)] mb-1">{i.label}{i.unit ? ` (${i.unit})` : ""}</label>
                  {i.options ? (
                    <select aria-label={i.label} value={s[i.k] || ""} onChange={(e) => setVals({ ...vals, [c.id]: { ...s, [i.k]: e.target.value } })} className={inputCls}>{i.options.map((o) => <option key={o} value={o}>{o || "–"}</option>)}</select>
                  ) : (
                    <input aria-label={i.label} inputMode="decimal" value={s[i.k] || ""} onChange={(e) => setVals({ ...vals, [c.id]: { ...s, [i.k]: e.target.value } })} className={inputCls} />
                  )}
                </div>
              ))}
            </div>
            <div className="bg-[var(--c-surface2)] rounded-2xl p-3 space-y-1.5">
              {outs.map((o) => (
                <div key={o.label}>
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-[var(--c-text2)]">{o.label}</span>
                    <b className="text-[var(--c-text)] whitespace-nowrap">{fmt(o.value, o.dp)}{o.value !== undefined && o.unit ? ` ${o.unit}` : ""}</b>
                  </div>
                  {o.grade && <div className="text-right"><GradeBadge g={o.grade} small /></div>}
                  {o.note && <p className="text-[10.5px] text-[var(--c-muted)]">{o.note}</p>}
                </div>
              ))}
            </div>
            {Object.keys(s).length > 0 && <button type="button" onClick={() => setVals({ ...vals, [c.id]: {} })} className="text-[11px] font-bold text-[var(--c-teal)]">Clear</button>}
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-muted)]" />
        <input aria-label="Search calculators" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, e.g. VExUS, coupling, ONSD" className={`${inputCls} pl-9`} />
      </div>
      {GROUPS.map((gname) => {
        const items = list.filter((c) => c.group === gname);
        if (!items.length) return null;
        return (
          <section key={gname} className="space-y-2">
            <h2 className="px-1 text-[13px] font-bold text-[var(--c-teal)]">{gname}</h2>
            <div className="md:columns-2 md:gap-3">{items.map(renderCalc)}</div>
          </section>
        );
      })}
      {list.length === 0 && <p className="text-xs text-[var(--c-muted)] px-1">No calculator matches that.</p>}
      {tips && <Sheet title={tips.title} onClose={() => setTips(null)}><CaveatList ids={tips.caveats || []} /></Sheet>}
    </div>
  );
};
