/**
 * Echo Hub engine: measurement definitions, grading against published reference values,
 * derived calculations, pulmonary hypertension probability, diastolic assessment and report text.
 *
 * Reference sources (values restated, not copied):
 *  - Harkness A et al. BSE normal reference intervals for adult TTE, Echo Res Pract 2020 (default "BSE" standard)
 *  - Lang RM et al. ASE/EACVI chamber quantification, JASE 2015 (alternative "ASE" standard; linear severity bands from ASE 2005)
 *  - Nagueh SF et al. ASE LV diastolic function update, JASE 2025 (supersedes ASE/EACVI 2016)
 *  - Strain: ASE/EACVI 2015 (RV free wall < 20%), GLS 16–18% grey zone (AHA/ACC 2022, ESC HF), LARS <= 18% (ASE 2025)
 *  - Humbert M et al. ESC/ERS pulmonary hypertension guidelines 2022 (echo probability of PH)
 *  - Rudski LG et al. ASE right heart guidelines 2010 (RAP from IVC)
 *  - Baumgartner H et al. EAE/ASE valve stenosis 2009/2017; Zoghbi WA et al. ASE regurgitation 2017
 *  - Adler Y et al. ESC pericardial guidelines 2015 (effusion size)
 */

export type Sex = "M" | "F" | "";
export type Level = "normal" | "borderline" | "mild" | "moderate" | "severe" | "info";
export interface Grade { level: Level; text: string }
export type Values = Record<string, string>;

export type SectionId = "context" | "lv" | "rv" | "atria" | "aorta" | "av" | "mv" | "tv" | "pv" | "ivc" | "peri";
export const SECTIONS: { id: SectionId; title: string }[] = [
  { id: "context", title: "Patient and study" },
  { id: "lv", title: "Left ventricle" },
  { id: "rv", title: "Right ventricle" },
  { id: "atria", title: "Atria" },
  { id: "aorta", title: "Aorta" },
  { id: "av", title: "Aortic valve" },
  { id: "mv", title: "Mitral valve and diastology" },
  { id: "tv", title: "Tricuspid valve and PA pressure" },
  { id: "pv", title: "Pulmonary valve" },
  { id: "ivc", title: "IVC" },
  { id: "peri", title: "Pericardium" },
];

export type ViewId = "context" | "plax" | "psax" | "a4c" | "rvf" | "a5c" | "sc" | "ivcv" | "ssn";
export const VIEW_SECTIONS: { id: ViewId; title: string }[] = [
  { id: "context", title: "Patient and study" },
  { id: "plax", title: "PLAX" },
  { id: "psax", title: "PSAX" },
  { id: "a4c", title: "A4C (with A2C / A3C)" },
  { id: "rvf", title: "RV-focused A4C" },
  { id: "a5c", title: "A5C" },
  { id: "sc", title: "Subcostal" },
  { id: "ivcv", title: "IVC" },
  { id: "ssn", title: "Suprasternal" },
];
export const FIELD_VIEW: Record<string, ViewId> = {
  indication: "context", sex: "context", age: "context", height: "context", weight: "context", hr: "context", rhythm: "context", quality: "context", ventilated: "context",
  lvidd: "plax", lvids: "plax", ivsd: "plax", lvpwd: "plax", lvot_d: "plax", ao_sinus: "plax", ao_asc: "plax", mv_morph: "plax", mr_vc: "plax", ar_vc: "plax",
  av_morph: "psax", septum: "psax", pv_at: "psax", pv_notch: "psax", pa_d: "psax", pr: "psax", mv_pht: "a4c",
  lv_visual: "a4c", rwma: "a4c", ef: "a4c", edv: "a4c", esv: "a4c", mapse: "a4c", lv_gls: "a4c", e: "a4c", a: "a4c", dt: "a4c", ivrt: "a5c", e_sept: "a4c", e_lat: "a4c",
  mv_meanpg: "a4c", mr: "a4c", mr_eroa: "a4c", la_vol: "a4c", lavi: "a4c", la_area: "a4c", la_rs: "a4c", pv_sd: "a4c", tr: "a4c", tr_vc: "a4c", trv: "a4c",
  rv_basal: "rvf", rv_mid: "rvf", rv_lv: "rvf", tapse: "rvf", rv_s: "rvf", rv_eda: "rvf", rv_esa: "rvf", rv_fws: "rvf", ra_area: "rvf",
  lvot_vti: "a5c", av_vmax: "a5c", av_meanpg: "a5c", av_vti: "a5c", ar: "a5c", ar_pht: "a5c",
  eff: "sc", eff_depth: "sc", tamponade: "sc", rv_wall: "sc",
  ivc_d: "ivcv", ivc_collapse: "ivcv",
  desc_ao: "ssn",
};

export interface FieldDef {
  key: string;
  label: string;
  section: SectionId;
  kind: "num" | "select" | "text";
  unit?: string;
  options?: string[];
  caveats?: string[]; // ids in content.ts CAVEATS
  placeholder?: string;
  advanced?: boolean; // hidden behind "more measurements"
}

const SEV = ["None", "Trace", "Mild", "Moderate", "Severe"];

export const FIELDS: FieldDef[] = [
  // Context (no patient identifiers)
  { key: "indication", label: "Indication", section: "context", kind: "text", placeholder: "e.g. shock, ?LV function" },
  { key: "sex", label: "Sex", section: "context", kind: "select", options: ["", "M", "F"] },
  { key: "age", label: "Age", section: "context", kind: "num", unit: "years" },
  { key: "height", label: "Height", section: "context", kind: "num", unit: "cm" },
  { key: "weight", label: "Weight", section: "context", kind: "num", unit: "kg" },
  { key: "hr", label: "Heart rate", section: "context", kind: "num", unit: "bpm" },
  { key: "rhythm", label: "Rhythm", section: "context", kind: "select", options: ["", "Sinus rhythm", "Atrial fibrillation", "Paced", "Other"] },
  { key: "quality", label: "Image quality", section: "context", kind: "select", options: ["", "Good", "Adequate", "Poor", "Very limited"] },
  { key: "ventilated", label: "Ventilation", section: "context", kind: "select", options: ["", "Spontaneous", "Mechanically ventilated"], caveats: ["ivc_vent"] },

  // LV
  { key: "lv_visual", label: "LV systolic function (visual)", section: "lv", kind: "select", options: ["", "Hyperdynamic", "Normal", "Borderline low", "Mildly impaired", "Moderately impaired", "Severely impaired"], caveats: ["ef_visual"] },
  { key: "ef", label: "LVEF (biplane Simpson's)", section: "lv", kind: "num", unit: "%", caveats: ["simpson"] },
  { key: "edv", label: "LV end-diastolic volume", section: "lv", kind: "num", unit: "ml", caveats: ["simpson"], advanced: true },
  { key: "esv", label: "LV end-systolic volume", section: "lv", kind: "num", unit: "ml", caveats: ["simpson"], advanced: true },
  { key: "lvidd", label: "LVIDd", section: "lv", kind: "num", unit: "cm", caveats: ["linear_lv"] },
  { key: "lvids", label: "LVIDs", section: "lv", kind: "num", unit: "cm", caveats: ["linear_lv"], advanced: true },
  { key: "ivsd", label: "IVSd", section: "lv", kind: "num", unit: "cm", caveats: ["linear_lv"] },
  { key: "lvpwd", label: "LVPWd", section: "lv", kind: "num", unit: "cm", caveats: ["linear_lv"] },
  { key: "mapse", label: "MAPSE (lateral)", section: "lv", kind: "num", unit: "mm", caveats: ["mapse"], advanced: true },
  { key: "lv_gls", label: "LV global longitudinal strain", section: "lv", kind: "num", unit: "%", caveats: ["strain"], placeholder: "e.g. -19" },
  { key: "rwma", label: "Regional wall motion", section: "lv", kind: "text", placeholder: "e.g. none / hypokinetic anterior wall" },
  { key: "lvot_d", label: "LVOT diameter", section: "lv", kind: "num", unit: "cm", caveats: ["lvot_d"] },
  { key: "lvot_vti", label: "LVOT VTI", section: "lv", kind: "num", unit: "cm", caveats: ["lvot_vti"] },

  // RV
  { key: "rv_basal", label: "RV basal diameter (RV-focused A4C)", section: "rv", kind: "num", unit: "mm", caveats: ["rv_size"] },
  { key: "rv_mid", label: "RV mid diameter", section: "rv", kind: "num", unit: "mm", caveats: ["rv_size"], advanced: true },
  { key: "rv_lv", label: "RV:LV basal ratio", section: "rv", kind: "num", unit: "", caveats: ["rv_size"] },
  { key: "tapse", label: "TAPSE", section: "rv", kind: "num", unit: "mm", caveats: ["tapse"] },
  { key: "rv_s", label: "RV S′ (tissue Doppler)", section: "rv", kind: "num", unit: "cm/s", caveats: ["tapse"] },
  { key: "rv_eda", label: "RV end-diastolic area", section: "rv", kind: "num", unit: "cm²", caveats: ["fac"], advanced: true },
  { key: "rv_esa", label: "RV end-systolic area", section: "rv", kind: "num", unit: "cm²", caveats: ["fac"], advanced: true },
  { key: "rv_fws", label: "RV free wall strain", section: "rv", kind: "num", unit: "%", caveats: ["strain"], placeholder: "e.g. -24", advanced: true },
  { key: "rv_wall", label: "RV free wall thickness", section: "rv", kind: "num", unit: "mm", advanced: true },
  { key: "septum", label: "Interventricular septum", section: "rv", kind: "select", options: ["", "Normal", "Flattened in diastole (volume load)", "Flattened in systole (pressure load)", "Flattened throughout"], caveats: ["septum"] },

  // Atria
  { key: "la_vol", label: "LA volume (biplane)", section: "atria", kind: "num", unit: "ml", caveats: ["la_vol"] },
  { key: "lavi", label: "LA volume index (if measured directly)", section: "atria", kind: "num", unit: "ml/m²", caveats: ["la_vol"], advanced: true },
  { key: "la_rs", label: "LA reservoir strain (LARS)", section: "atria", kind: "num", unit: "%", caveats: ["strain"], advanced: true },
  { key: "la_area", label: "LA area (A4C)", section: "atria", kind: "num", unit: "cm²", advanced: true },
  { key: "ra_area", label: "RA area (A4C)", section: "atria", kind: "num", unit: "cm²", caveats: ["ra_area"] },

  // Aorta
  { key: "ao_sinus", label: "Aortic root (sinuses)", section: "aorta", kind: "num", unit: "cm", caveats: ["aorta"] },
  { key: "ao_asc", label: "Proximal ascending aorta", section: "aorta", kind: "num", unit: "cm", caveats: ["aorta"] },

  // Aortic valve
  { key: "av_morph", label: "AV morphology", section: "av", kind: "select", options: ["", "Trileaflet, thin", "Trileaflet, sclerotic", "Calcified, restricted", "Bicuspid", "Prosthetic"] },
  { key: "av_vmax", label: "AV peak velocity", section: "av", kind: "num", unit: "m/s", caveats: ["as_grade"] },
  { key: "av_meanpg", label: "AV mean gradient", section: "av", kind: "num", unit: "mmHg", caveats: ["as_grade"] },
  { key: "av_vti", label: "AV VTI", section: "av", kind: "num", unit: "cm", caveats: ["as_grade", "lvot_d"] },
  { key: "ar", label: "Aortic regurgitation", section: "av", kind: "select", options: ["", ...SEV], caveats: ["regurg"] },
  { key: "ar_vc", label: "AR vena contracta", section: "av", kind: "num", unit: "cm", caveats: ["regurg"], advanced: true },
  { key: "ar_pht", label: "AR pressure half-time", section: "av", kind: "num", unit: "ms", caveats: ["ar_pht"], advanced: true },
  { key: "desc_ao", label: "Descending aorta diastolic flow (suprasternal)", section: "av", kind: "select", options: ["", "No reversal", "Brief early reversal", "Holodiastolic reversal"], caveats: ["regurg"], advanced: true },

  // Mitral valve and diastology
  { key: "mv_morph", label: "MV morphology", section: "mv", kind: "select", options: ["", "Normal", "Thickened", "Annular calcification (MAC)", "Prolapse", "Rheumatic", "Repair / prosthesis"], caveats: ["diast_invalid"] },
  { key: "mr", label: "Mitral regurgitation", section: "mv", kind: "select", options: ["", ...SEV], caveats: ["regurg"] },
  { key: "mr_vc", label: "MR vena contracta", section: "mv", kind: "num", unit: "cm", caveats: ["regurg"], advanced: true },
  { key: "mr_eroa", label: "MR EROA (PISA)", section: "mv", kind: "num", unit: "cm²", caveats: ["pisa"], advanced: true },
  { key: "mv_meanpg", label: "MV mean gradient", section: "mv", kind: "num", unit: "mmHg", caveats: ["ms_grade"], advanced: true },
  { key: "mv_pht", label: "MV pressure half-time", section: "mv", kind: "num", unit: "ms", caveats: ["ms_grade"], advanced: true },
  { key: "e", label: "Mitral E velocity", section: "mv", kind: "num", unit: "cm/s", caveats: ["diast_invalid", "mitral_inflow"] },
  { key: "a", label: "Mitral A velocity", section: "mv", kind: "num", unit: "cm/s", caveats: ["diast_invalid", "mitral_inflow"] },
  { key: "dt", label: "E deceleration time", section: "mv", kind: "num", unit: "ms", advanced: true },
  { key: "ivrt", label: "IVRT", section: "mv", kind: "num", unit: "ms", caveats: ["diast_invalid"], advanced: true },
  { key: "pv_sd", label: "Pulmonary vein S/D ratio", section: "mv", kind: "num", unit: "", advanced: true },
  { key: "e_sept", label: "Septal e′", section: "mv", kind: "num", unit: "cm/s", caveats: ["eprime"] },
  { key: "e_lat", label: "Lateral e′", section: "mv", kind: "num", unit: "cm/s", caveats: ["eprime"] },

  // Tricuspid / PA pressure
  { key: "tr", label: "Tricuspid regurgitation", section: "tv", kind: "select", options: ["", ...SEV], caveats: ["regurg"] },
  { key: "trv", label: "TR peak velocity", section: "tv", kind: "num", unit: "m/s", caveats: ["trv"] },
  { key: "tr_vc", label: "TR vena contracta", section: "tv", kind: "num", unit: "cm", caveats: ["regurg"], advanced: true },

  // Pulmonary valve
  { key: "pv_at", label: "RVOT acceleration time", section: "pv", kind: "num", unit: "ms", caveats: ["pvat"] },
  { key: "pv_notch", label: "RVOT Doppler notching", section: "pv", kind: "select", options: ["", "No", "Yes (mid-systolic)"] },
  { key: "pa_d", label: "Main PA diameter", section: "pv", kind: "num", unit: "mm", advanced: true },
  { key: "pr", label: "Pulmonary regurgitation", section: "pv", kind: "select", options: ["", ...SEV], advanced: true },

  // IVC
  { key: "ivc_d", label: "IVC maximum diameter", section: "ivc", kind: "num", unit: "cm", caveats: ["ivc_vent"] },
  { key: "ivc_collapse", label: "IVC collapse with sniff / inspiration", section: "ivc", kind: "select", options: ["", "> 50%", "< 50%"], caveats: ["ivc_vent"] },

  // Pericardium
  { key: "eff", label: "Pericardial effusion", section: "peri", kind: "select", options: ["", "None", "Present"], caveats: ["effusion"] },
  { key: "eff_depth", label: "Largest diastolic depth", section: "peri", kind: "num", unit: "mm", caveats: ["effusion"] },
  { key: "tamponade", label: "Tamponade features", section: "peri", kind: "select", options: ["", "None", "RA systolic collapse", "RV diastolic collapse", "Plethoric IVC + chamber collapse", "Exaggerated respiratory variation"], caveats: ["effusion"] },
];

export const FIELD = Object.fromEntries(FIELDS.map((f) => [f.key, f])) as Record<string, FieldDef>;

// ---------- Helpers ----------
export const num = (v: Values, k: string): number | undefined => {
  const s = (v[k] ?? "").toString().replace(",", ".").trim();
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
};
const r1 = (n: number) => Math.round(n * 10) / 10;
const r2 = (n: number) => Math.round(n * 100) / 100;
export const fmt = (n: number | undefined, dp = 1) => (n === undefined || !Number.isFinite(n) ? "–" : dp === 0 ? String(Math.round(n)) : dp === 2 ? String(r2(n)) : String(r1(n)));

const g = (level: Level, text: string): Grade => ({ level, text });
const bySex = (sex: Sex, m: number, f: number) => (sex === "F" ? f : m);

// ---------- Derived values ----------
export interface Derived {
  bsa?: number; lvot_area?: number; sv?: number; svi?: number; co?: number; ci?: number;
  ef_calc?: number; edvi?: number; esvi?: number; fs?: number; rwt?: number; lv_mass?: number; lvmi?: number;
  lavi?: number; e_a?: number; e_eprime?: number; e_sept_ratio?: number; rap?: number; rvsp?: number; mpap?: number;
  tapse_spap?: number; fac?: number; ava?: number; avai?: number; dvi?: number; av_peakpg?: number; mva_pht?: number;
}

export function bsaMosteller(h?: number, w?: number) { return h && w ? Math.sqrt((h * w) / 3600) : undefined; }

export function rapFromIvc(d?: number, collapse?: string, ventilated?: boolean): number | undefined {
  if (ventilated || d === undefined || !collapse) return undefined;
  const small = d <= 2.1, collapses = collapse.startsWith(">");
  if (small && collapses) return 3;
  if (!small && !collapses) return 15;
  return 8;
}

export function derive(v: Values): Derived {
  const d: Derived = {};
  const h = num(v, "height"), w = num(v, "weight"), hr = num(v, "hr");
  d.bsa = bsaMosteller(h, w);
  const lvotD = num(v, "lvot_d"), lvotVti = num(v, "lvot_vti");
  if (lvotD) d.lvot_area = Math.PI * (lvotD / 2) ** 2;
  if (d.lvot_area && lvotVti) d.sv = d.lvot_area * lvotVti;
  if (d.sv && d.bsa) d.svi = d.sv / d.bsa;
  if (d.sv && hr) d.co = (d.sv * hr) / 1000;
  if (d.co && d.bsa) d.ci = d.co / d.bsa;
  const edv = num(v, "edv"), esv = num(v, "esv");
  if (edv && esv !== undefined && edv > esv) d.ef_calc = ((edv - esv) / edv) * 100;
  if (edv && d.bsa) d.edvi = edv / d.bsa;
  if (esv && d.bsa) d.esvi = esv / d.bsa;
  const lvidd = num(v, "lvidd"), lvids = num(v, "lvids"), ivs = num(v, "ivsd"), pw = num(v, "lvpwd");
  if (lvidd && lvids) d.fs = ((lvidd - lvids) / lvidd) * 100;
  if (lvidd && pw) d.rwt = (2 * pw) / lvidd;
  if (lvidd && ivs && pw) d.lv_mass = 0.8 * 1.04 * ((ivs + lvidd + pw) ** 3 - lvidd ** 3) + 0.6;
  if (d.lv_mass && d.bsa) d.lvmi = d.lv_mass / d.bsa;
  const laVol = num(v, "la_vol");
  d.lavi = num(v, "lavi") ?? (laVol && d.bsa ? laVol / d.bsa : undefined);
  const e = num(v, "e"), a = num(v, "a"), es = num(v, "e_sept"), el = num(v, "e_lat");
  if (e && a) d.e_a = e / a;
  const eAvg = es && el ? (es + el) / 2 : es ?? el;
  if (e && eAvg) d.e_eprime = e / eAvg;
  if (e && es) d.e_sept_ratio = e / es;
  d.rap = rapFromIvc(num(v, "ivc_d"), v.ivc_collapse, v.ventilated === "Mechanically ventilated");
  const trv = num(v, "trv");
  if (trv) d.rvsp = 4 * trv * trv + (d.rap ?? 8);
  if (d.rvsp) d.mpap = 0.61 * d.rvsp + 2;
  const tapse = num(v, "tapse");
  if (tapse && d.rvsp) d.tapse_spap = tapse / d.rvsp;
  const eda = num(v, "rv_eda"), esa = num(v, "rv_esa");
  if (eda && esa !== undefined && eda > esa) d.fac = ((eda - esa) / eda) * 100;
  const avVti = num(v, "av_vti"), avVmax = num(v, "av_vmax");
  if (d.lvot_area && lvotVti && avVti) { d.ava = (d.lvot_area * lvotVti) / avVti; d.dvi = lvotVti / avVti; }
  if (d.ava && d.bsa) d.avai = d.ava / d.bsa;
  if (avVmax) d.av_peakpg = 4 * avVmax * avVmax;
  const pht = num(v, "mv_pht");
  if (pht) d.mva_pht = 220 / pht;
  return d;
}

export const DERIVED_LABELS: Partial<Record<keyof Derived, [string, string, number]>> = {
  bsa: ["BSA (Mosteller)", "m²", 2], sv: ["Stroke volume", "ml", 0], svi: ["SV index", "ml/m²", 0], co: ["Cardiac output", "L/min", 1], ci: ["Cardiac index", "L/min/m²", 1],
  ef_calc: ["EF from volumes", "%", 0], edvi: ["EDV index", "ml/m²", 0], esvi: ["ESV index", "ml/m²", 0], fs: ["Fractional shortening", "%", 0],
  rwt: ["Relative wall thickness", "", 2], lv_mass: ["LV mass (linear)", "g", 0], lvmi: ["LV mass index", "g/m²", 0], lavi: ["LA volume index", "ml/m²", 0],
  e_a: ["E/A", "", 1], e_eprime: ["E/e′ (average)", "", 1], rap: ["Estimated RAP", "mmHg", 0], rvsp: ["Estimated RVSP", "mmHg", 0], mpap: ["Estimated mean PAP", "mmHg", 0],
  tapse_spap: ["TAPSE/sPAP", "mm/mmHg", 2], fac: ["RV FAC", "%", 0], ava: ["AVA (continuity)", "cm²", 2], avai: ["AVA index", "cm²/m²", 2], dvi: ["Dimensionless index", "", 2],
  av_peakpg: ["AV peak gradient", "mmHg", 0], mva_pht: ["MVA (pressure half-time)", "cm²", 1],
};

// ---------- Grading ----------
type Grader = (n: number, v: Values, d: Derived) => Grade | null;

const sexOf = (v: Values): Sex => (v.sex === "M" || v.sex === "F" ? v.sex : "");
/** Reference standard: BSE 2020 (default, UK) or ASE/EACVI 2015. Passed in the values as __std. */
export type Standard = "BSE" | "ASE";
const stdOf = (v: Values): Standard => (v.__std === "ASE" ? "ASE" : "BSE");
const absn = (n: number) => Math.abs(n);
/** Four-band grade: normal up to b0, mild up to b1, moderate up to b2, severe above. */
function bands(n: number, b0: number, b1: number, b2: number, words: [string, string, string, string], unit: string, lo?: number): Grade {
  if (lo !== undefined && n < lo) return g("info", `Below normal range (< ${lo}${unit})`);
  return n <= b0 ? g("normal", `${words[0]} (≤ ${b0}${unit})`) : n <= b1 ? g("mild", words[1]) : n <= b2 ? g("moderate", words[2]) : g("severe", words[3]);
}
const DIL: [string, string, string, string] = ["Normal", "Mildly dilated", "Moderately dilated", "Severely dilated"];

export const GRADERS: Record<string, Grader> = {
  ef: (n, v) => {
    if (stdOf(v) === "ASE") {
      const s = sexOf(v); const nl = s === "F" ? 54 : 52;
      return n > 72 + (s === "F" ? 2 : 0) ? g("info", "Above normal range") : n >= nl ? g("normal", `Normal (≥ ${nl}%)`) : n >= 41 ? g("mild", `Mildly abnormal (41–${nl - 1}%)`) : n >= 30 ? g("moderate", "Moderately abnormal (30–40%)") : g("severe", "Severely abnormal (< 30%)");
    }
    return n > 70 ? g("info", "Hyperdynamic (> 70%)") : n >= 55 ? g("normal", "Normal (≥ 55%)") : n >= 50 ? g("borderline", "Borderline low (50–54%)") : n >= 36 ? g("moderate", "Impaired (36–49%)") : g("severe", "Severely impaired (≤ 35%)");
  },
  lvidd: (n, v) => {
    const s = sexOf(v); if (!s) return g("info", "Enter sex to grade");
    if (stdOf(v) === "BSE") return s === "M" ? bands(n, 5.6, 6.1, 6.5, DIL, " cm", 3.7) : bands(n, 5.1, 5.5, 5.9, DIL, " cm", 3.5);
    return s === "M" ? bands(n, 5.8, 6.3, 6.8, DIL, " cm", 4.2) : bands(n, 5.2, 5.6, 6.1, DIL, " cm", 3.8);
  },
  lvids: (n, v) => {
    const s = sexOf(v); if (!s) return null;
    const w: [string, string, string, string] = ["Normal", "Mildly increased", "Moderately increased", "Severely increased"];
    if (stdOf(v) === "BSE") return s === "M" ? bands(n, 4.1, 4.5, 5.0, w, " cm") : bands(n, 3.7, 4.2, 4.6, w, " cm");
    const hi = bySex(s, 4.0, 3.5); return n <= hi ? g("normal", `Normal (≤ ${hi} cm)`) : g("mild", `Increased (> ${hi} cm)`);
  },
  ivsd: (n, v) => wall(n, sexOf(v), stdOf(v), "ivs"),
  lvpwd: (n, v) => wall(n, sexOf(v), stdOf(v), "pw"),
  lv_gls: (n) => { const a = absn(n); return a >= 18 ? g("normal", "Normal (≥ 18% magnitude)") : a >= 16 ? g("borderline", "Borderline (16–18%)") : g("moderate", "Reduced (< 16%)"); },
  rv_fws: (n) => { const a = absn(n); return a >= 20 ? g("normal", "Normal (≥ 20% magnitude)") : g("moderate", "Reduced (< 20%)"); },
  la_rs: (n) => n <= 18 ? g("moderate", "≤ 18%: supports raised LA pressure") : g("normal", "> 18% (normal mean ≈ 39%)"),
  ivrt: () => null,
  pv_sd: (n) => n <= 0.67 ? g("moderate", "≤ 0.67: supports raised LAP (reduced EF)") : g("normal", "> 0.67"),
  mapse: (n) => n >= 10 ? g("normal", "≥ 10 mm") : n >= 8 ? g("borderline", "Reduced (8–10 mm)") : g("moderate", "Markedly reduced (< 8 mm)"),
  lvot_vti: (n) => n < 18 ? g("mild", "Low (< 18 cm): low stroke volume") : n > 25 ? g("info", "High (> 25 cm)") : g("normal", "Normal (18–25 cm)"),
  rv_basal: (n, v) => { const hi = stdOf(v) === "BSE" ? (sexOf(v) === "F" ? 43 : 47) : 41; if (stdOf(v) === "BSE" && !sexOf(v)) return g("info", "Enter sex to grade"); return n > hi ? g("mild", `Dilated (> ${hi} mm)`) : g("normal", `Normal (≤ ${hi} mm)`); },
  rv_mid: (n, v) => { if (stdOf(v) === "BSE" && !sexOf(v)) return g("info", "Enter sex to grade"); const hi = stdOf(v) === "BSE" ? (sexOf(v) === "F" ? 35 : 42) : 35; return n > hi ? g("mild", `Dilated (> ${hi} mm)`) : g("normal", `Normal (≤ ${hi} mm)`); },
  rv_lv: (n) => n > 1.0 ? g("severe", "Severely dilated (> 1.0)") : n > 0.6 ? g("moderate", "Dilated (0.6–1.0)") : g("normal", "Normal (≤ 0.6)"),
  tapse: (n) => n < 17 ? g("moderate", "Reduced (< 17 mm)") : g("normal", "Normal (≥ 17 mm)"),
  rv_s: (n, v) => { const lo = stdOf(v) === "BSE" ? 9 : 9.5; return n < lo ? g("moderate", `Reduced (< ${lo} cm/s)`) : g("normal", `Normal (≥ ${lo} cm/s)`); },
  rv_wall: (n) => n > 5 ? g("mild", "RV hypertrophy (> 5 mm)") : g("normal", "Normal (≤ 5 mm)"),
  la_area: (n) => n > 20 ? g("mild", "Dilated (> 20 cm²)") : g("normal", "Normal (≤ 20 cm²)"),
  ra_area: (n, v) => { if (stdOf(v) === "BSE" && !sexOf(v)) return g("info", "Enter sex to grade"); const hi = stdOf(v) === "BSE" ? (sexOf(v) === "F" ? 19 : 22) : 18; return n > hi ? g("mild", `Dilated (> ${hi} cm²)`) : g("normal", `Normal (≤ ${hi} cm²)`); },
  lavi: (n, v) => laviGrade(n, stdOf(v)),
  ao_sinus: (n, v) => aortaGrade(n, v, "sinus"),
  ao_asc: (n, v) => aortaGrade(n, v, "asc"),
  av_vmax: (n) => n < 2.6 ? g("normal", "No significant stenosis (< 2.6 m/s)") : n < 3.0 ? g("mild", "Mild AS range (2.6–2.9)") : n < 4.0 ? g("moderate", "Moderate AS range (3.0–3.9)") : g("severe", "Severe AS range (≥ 4.0)"),
  av_meanpg: (n) => n < 20 ? g(n < 10 ? "normal" : "mild", "< 20 mmHg") : n < 40 ? g("moderate", "Moderate AS range (20–39)") : g("severe", "Severe AS range (≥ 40)"),
  ar_vc: (n) => n < 0.3 ? g("mild", "Mild (< 0.3 cm)") : n <= 0.6 ? g("moderate", "Moderate (0.3–0.6 cm)") : g("severe", "Severe (> 0.6 cm)"),
  ar_pht: (n) => n > 500 ? g("mild", "Mild (> 500 ms)") : n >= 200 ? g("moderate", "Moderate (200–500 ms)") : g("severe", "Severe (< 200 ms)"),
  mr_vc: (n) => n < 0.3 ? g("mild", "Mild (< 0.3 cm)") : n < 0.7 ? g("moderate", "Moderate (0.3–0.69 cm)") : g("severe", "Severe (≥ 0.7 cm)"),
  mr_eroa: (n) => n < 0.2 ? g("mild", "Mild (< 0.2 cm²)") : n < 0.4 ? g("moderate", "Moderate (0.2–0.39 cm²); severe if secondary MR (ESC 2025 ≥ 0.3)") : g("severe", "Severe (≥ 0.4 cm²)"),
  mv_meanpg: (n) => n < 5 ? g("mild", "< 5 mmHg (mild MS range)") : n <= 10 ? g("moderate", "5–10 mmHg (moderate MS range)") : g("severe", "> 10 mmHg (severe MS range)"),
  e_sept: (n, v) => { const c = eprimeCut(num(v, "age")); return eLow(n, c.sept, c.strict) ? g("mild", `Reduced (${c.strict ? "<" : "≤"} ${c.sept} cm/s, ${c.age})`) : g("normal", `Normal for ${c.age}`); },
  e_lat: (n, v) => { const c = eprimeCut(num(v, "age")); return eLow(n, c.lat, c.strict) ? g("mild", `Reduced (${c.strict ? "<" : "≤"} ${c.lat} cm/s, ${c.age})`) : g("normal", `Normal for ${c.age}`); },
  trv: (n) => n <= 2.8 ? g("normal", "≤ 2.8 m/s") : n <= 3.4 ? g("moderate", "2.9–3.4 m/s") : g("severe", "> 3.4 m/s"),
  tr_vc: (n) => n < 0.3 ? g("mild", "Mild (< 0.3 cm)") : n < 0.7 ? g("moderate", "Moderate (0.3–0.69 cm)") : g("severe", "Severe (≥ 0.7 cm)"),
  pv_at: (n) => n < 105 ? g("moderate", "Short (< 105 ms): suggests raised PVR") : g("normal", "≥ 105 ms"),
  pa_d: (n) => n > 25 ? g("mild", "Dilated (> 25 mm)") : g("normal", "≤ 25 mm"),
  ivc_d: (n) => n > 2.1 ? g("mild", "Dilated (> 2.1 cm)") : g("normal", "≤ 2.1 cm"),
  eff_depth: (n) => n < 10 ? g("mild", "Small (< 10 mm)") : n <= 20 ? g("moderate", "Moderate (10–20 mm)") : g("severe", "Large (> 20 mm)"),
};

function aortaGrade(n: number, v: Values, site: "sinus" | "asc"): Grade {
  const s = sexOf(v); if (!s) return g("info", "Enter sex to grade");
  if (stdOf(v) === "BSE") {
    const h = num(v, "height");
    if (!h) return g("info", "Enter height: BSE indexes the aorta to height");
    const perM = site === "sinus" ? bySex(s, 21.8, 20.7) : bySex(s, 19.9, 19.8);
    const hi = Math.round((perM * h) / 100) / 10; // cm
    return n > hi ? g("mild", `Dilated (> ${hi} cm for height)`) : g("normal", `Normal (≤ ${hi} cm for height)`);
  }
  const hi = site === "sinus" ? bySex(s, 4.0, 3.6) : bySex(s, 3.8, 3.5);
  return n > hi ? g("mild", `Dilated (> ${hi} cm)`) : g("normal", `Normal (≤ ${hi} cm)`);
}

function wall(n: number, s: Sex, std: Standard = "ASE", site: "ivs" | "pw" = "ivs"): Grade {
  if (!s) return g("info", "Enter sex to grade");
  if (std === "BSE") {
    const hi = site === "ivs" ? (s === "M" ? 1.2 : 1.1) : 1.2;
    return n <= hi ? g("normal", `Normal (≤ ${hi} cm)`) : n <= hi + 0.3 ? g("mild", "Increased") : g("moderate", "Markedly increased");
  }
  const [hi, m1, m2] = s === "M" ? [1.0, 1.3, 1.6] : [0.9, 1.2, 1.5];
  return n <= hi ? g("normal", `Normal (0.6–${hi} cm)`) : n <= m1 ? g("mild", "Mildly increased") : n <= m2 ? g("moderate", "Moderately increased") : g("severe", "Severely increased");
}
function laviGrade(n: number, std: Standard = "BSE"): Grade {
  if (std === "BSE") return n < 34 ? g("normal", "Normal (< 34 ml/m²)") : n <= 38 ? g("borderline", "Borderline (34–38)") : g("mild", "Dilated (> 38)");
  return n <= 34 ? g("normal", "Normal (≤ 34 ml/m²)") : n <= 41 ? g("mild", "Mildly dilated (35–41)") : n <= 48 ? g("moderate", "Moderately dilated (42–48)") : g("severe", "Severely dilated (> 48)");
}

export const DERIVED_GRADERS: Partial<Record<keyof Derived, (n: number, v: Values) => Grade | null>> = {
  ef_calc: (n, v) => GRADERS.ef(n, v, {}),
  edvi: (n, v) => {
    const s = sexOf(v); if (!s) return null;
    if (stdOf(v) === "BSE") return s === "M" ? bands(n, 79, 91, 103, DIL, " ml/m²") : bands(n, 70, 81, 91, DIL, " ml/m²");
    return s === "M" ? bands(n, 74, 89, 100, DIL, " ml/m²") : bands(n, 61, 70, 80, DIL, " ml/m²");
  },
  esvi: (n, v) => {
    const s = sexOf(v); if (!s) return null;
    const w: [string, string, string, string] = ["Normal", "Mildly increased", "Moderately increased", "Severely increased"];
    if (stdOf(v) === "BSE") return s === "M" ? bands(n, 31, 36, 42, w, " ml/m²") : bands(n, 27, 32, 37, w, " ml/m²");
    return s === "M" ? bands(n, 31, 38, 45, w, " ml/m²") : bands(n, 24, 32, 40, w, " ml/m²");
  },
  rwt: (n) => n > 0.42 ? g("mild", "> 0.42 (concentric)") : g("normal", "≤ 0.42"),
  lvmi: (n, v) => {
    const s = sexOf(v); if (!s) return null;
    const w: [string, string, string, string] = ["Normal", "Mildly increased", "Moderately increased", "Severely increased"];
    if (stdOf(v) === "BSE") return s === "M" ? bands(n, 110, 127, 145, w, " g/m²") : bands(n, 99, 115, 131, w, " g/m²");
    return s === "M" ? bands(n, 115, 131, 148, w, " g/m²") : bands(n, 95, 108, 121, w, " g/m²");
  },
  lavi: (n, v) => laviGrade(n, stdOf(v)),
  svi: (n) => n < 35 ? g("mild", "Low (< 35 ml/m²)") : g("normal", "≥ 35 ml/m²"),
  ci: (n) => n < 2.2 ? g("moderate", "Low (< 2.2)") : g("normal", "≥ 2.2"),
  e_eprime: (n) => n > 14 ? g("moderate", "Raised (> 14)") : g("normal", "≤ 14"),
  fac: (n, v) => { const lo = stdOf(v) === "BSE" ? (sexOf(v) === "M" ? 30 : 35) : 35; return n < lo ? g("moderate", `Reduced (< ${lo}%)`) : g("normal", `Normal (≥ ${lo}%)`); },
  ava: (n) => n > 1.5 ? g("normal", "> 1.5 cm² (no more than mild)") : n >= 1.0 ? g("moderate", "1.0–1.5 cm² (moderate)") : g("severe", "< 1.0 cm² (severe)"),
  avai: (n) => n < 0.6 ? g("severe", "< 0.6 cm²/m² (severe)") : g("info", "≥ 0.6 cm²/m²"),
  dvi: (n) => n < 0.25 ? g("severe", "< 0.25 (severe)") : n < 0.5 ? g("moderate", "0.25–0.5") : g("normal", "≥ 0.5"),
  mva_pht: (n) => n > 1.5 ? g("mild", "> 1.5 cm² (mild)") : n >= 1.0 ? g("moderate", "1.0–1.5 cm² (moderate)") : g("severe", "< 1.0 cm² (severe)"),
  tapse_spap: (n) => n < 0.55 ? g("moderate", "< 0.55 (supports PH / RV–PA uncoupling)") : g("normal", "≥ 0.55"),
  rvsp: (n) => n >= 35 ? g("moderate", "Raised (≥ 35 mmHg)") : g("normal", "< 35 mmHg"),
};

export function gradeField(key: string, v: Values, d: Derived): Grade | null {
  const n = num(v, key);
  const fn = GRADERS[key];
  return n === undefined || !fn ? null : fn(n, v, d);
}

// ---------- Pulmonary hypertension probability (ESC/ERS 2022) ----------
export interface PhResult { probability: "Low" | "Intermediate" | "High" | "Not assessable"; signs: string[]; categories: number; reason: string }

export function phProbability(v: Values, d: Derived): PhResult {
  const trv = num(v, "trv");
  const signs: string[] = [];
  const cats = new Set<string>();
  const rvlv = num(v, "rv_lv");
  if (rvlv && rvlv > 1.0) { signs.push("RV/LV basal ratio > 1.0"); cats.add("A"); }
  if (v.septum && v.septum.startsWith("Flattened")) { signs.push("septal flattening"); cats.add("A"); }
  const at = num(v, "pv_at");
  if ((at && at < 105) || v.pv_notch?.startsWith("Yes")) { signs.push("RVOT AT < 105 ms and/or notching"); cats.add("B"); }
  const pa = num(v, "pa_d");
  const aoRoot = num(v, "ao_sinus");
  if (pa && (aoRoot ? pa > aoRoot * 10 : pa > 25)) { signs.push(aoRoot ? "PA diameter > aortic root" : "PA diameter > 25 mm"); cats.add("B"); }
  const ivc = num(v, "ivc_d");
  if (ivc && ivc > 2.1 && v.ivc_collapse?.startsWith("<")) { signs.push("IVC > 21 mm with reduced collapse"); cats.add("C"); }
  const ra = num(v, "ra_area");
  if (ra && ra > 18) { signs.push("RA area > 18 cm²"); cats.add("C"); }
  const otherSigns = cats.size >= 2;
  if (trv === undefined && !signs.length) return { probability: "Not assessable", signs, categories: 0, reason: "No TR velocity or other PH signs entered." };
  let p: PhResult["probability"];
  if (trv === undefined || trv <= 2.8) p = otherSigns ? "Intermediate" : "Low";
  else if (trv <= 3.4) p = otherSigns ? "High" : "Intermediate";
  else p = "High";
  const tr = trv === undefined ? "TR velocity not measurable" : `TR Vmax ${fmt(trv, 1)} m/s`;
  return { probability: p, signs, categories: cats.size, reason: `${tr}; other PH signs in ${cats.size} of 3 categories (ventricles, PA, IVC/RA)${signs.length ? `: ${signs.join(", ")}` : ""}.` };
}

// ---------- Diastolic function (ASE 2025 update) ----------
export interface DiastResult { conclusion: string; detail: string; graded: boolean; lap?: "normal" | "elevated" | "indeterminate" }

/** Age-adjusted e′ cut-offs (ASE 2025 Table 6); defaults septal ≤ 6, lateral ≤ 7, average ≤ 6.5 cm/s. */
function eprimeCut(age?: number): { sept: number; lat: number; avg: number; label: string; age: string; strict: boolean } {
  if (age !== undefined && age < 40) return { sept: 7, lat: 10, avg: 9, strict: true, age: "age 20–39", label: "age 20–39: septal < 7, lateral < 10, average < 9" };
  if (age !== undefined && age <= 65) return { sept: 6, lat: 8, avg: 7, strict: true, age: "age 40–65", label: "age 40–65: septal < 6, lateral < 8, average < 7" };
  if (age !== undefined) return { sept: 6, lat: 7, avg: 6.5, strict: true, age: "age > 65", label: "age > 65: septal < 6, lateral < 7, average < 6.5" };
  return { sept: 6, lat: 7, avg: 6.5, strict: false, age: "any age", label: "septal ≤ 6, lateral ≤ 7, average ≤ 6.5" };
}
const eLow = (n: number, cut: number, strict: boolean) => (strict ? n < cut : n <= cut);

export function diastology(v: Values, d: Derived): DiastResult {
  const rhythm = v.rhythm || "";
  const e = num(v, "e"), es = num(v, "e_sept"), el = num(v, "e_lat"), trv = num(v, "trv"), lavi = d.lavi;
  const lars = num(v, "la_rs"), pvsd = num(v, "pv_sd"), ivrt = num(v, "ivrt"), age = num(v, "age"), a = num(v, "a");
  const ea = d.e_a;

  // Conditions where the main algorithm doesn't apply
  if (v.mv_morph === "Repair / prosthesis") return { graded: false, conclusion: "Diastolic function: not assessable by the standard algorithm (mitral repair or prosthesis).", detail: "ASE 2025: the main algorithm doesn't apply after mitral repair, replacement or TEER." };
  if (v.mv_morph === "Rheumatic" || (num(v, "mv_meanpg") ?? 0) >= 5) {
    const ind: string[] = [];
    if (ivrt !== undefined && ivrt < 60) ind.push("IVRT < 60 ms");
    if (a !== undefined && a > 150) ind.push("A velocity > 1.5 m/s");
    return { graded: false, lap: ind.length ? "elevated" : "indeterminate", conclusion: ind.length ? `Mitral stenosis: ${ind.join(", ")} suggests raised LA pressure.` : "Mitral stenosis: LA pressure not assessable from E/e′.", detail: "ASE 2025: E/e′ isn't useful in mitral stenosis. Supportive of raised LAP: IVRT < 60 ms, A velocity > 1.5 m/s, IVRT/TE–e′ < 4.2." };
  }
  if (v.mv_morph === "Annular calcification (MAC)") {
    let lap: DiastResult["lap"] = "indeterminate", why = "Needs E/A (and IVRT if E/A 0.8–1.8).";
    if (ea !== undefined && ea < 0.8) { lap = "normal"; why = `E/A ${fmt(ea, 1)} < 0.8.`; }
    else if (ea !== undefined && ea > 1.8) { lap = "elevated"; why = `E/A ${fmt(ea, 1)} > 1.8.`; }
    else if (ea !== undefined && ivrt !== undefined) { lap = ivrt >= 80 ? "normal" : "elevated"; why = `E/A ${fmt(ea, 1)} with IVRT ${fmt(ivrt, 0)} ms (${ivrt >= 80 ? "≥" : "<"} 80 ms).`; }
    return { graded: false, lap, conclusion: `Mitral annular calcification: LA pressure ${lap === "indeterminate" ? "indeterminate" : lap}.`, detail: `ASE 2025 MAC approach (moderate–severe MAC): E/A < 0.8 normal LAP, > 1.8 raised, 0.8–1.8 use IVRT (≥ 80 ms normal, < 80 ms raised). ${why} E/e′ is unreliable with MAC.` };
  }
  if (v.mr === "Severe") {
    const ind: string[] = [];
    if (ivrt !== undefined && ivrt < 60) ind.push("IVRT < 60 ms");
    return { graded: false, lap: ind.length ? "elevated" : "indeterminate", conclusion: ind.length ? "Severe MR: IVRT < 60 ms suggests raised LA pressure." : "Severe MR: standard algorithm not applicable.", detail: "ASE 2025: in severe primary MR use IVRT < 60 ms, Ar–A ≥ 30 ms or IVRT/TE–e′ < 5.6. Average E/e′ > 14 applies only when EF is reduced." };
  }
  if (rhythm === "Paced") return { graded: false, conclusion: "Diastolic function not graded (paced rhythm).", detail: "Pacing alters mitral inflow and septal e′. Lateral e′, TR velocity and LARS may still help." };
  if (rhythm === "Atrial fibrillation") {
    const ind: string[] = [];
    if (d.e_sept_ratio !== undefined && d.e_sept_ratio >= 11) ind.push(`E/septal e′ ${fmt(d.e_sept_ratio, 1)} (≥ 11)`);
    if (trv !== undefined && trv > 2.8) ind.push(`TR velocity ${fmt(trv, 1)} m/s (> 2.8)`);
    const ef = num(v, "ef") ?? d.ef_calc, dt = num(v, "dt");
    if (dt !== undefined && dt < 160 && ef !== undefined && ef < 50) ind.push(`DT ${fmt(dt, 0)} ms (< 160, reduced EF)`);
    if (ivrt !== undefined && ivrt <= 65) ind.push(`IVRT ${fmt(ivrt, 0)} ms (≤ 65)`);
    return { graded: false, lap: ind.length >= 2 ? "elevated" : ind.length === 0 && (d.e_sept_ratio !== undefined || trv !== undefined) ? "normal" : "indeterminate",
      conclusion: ind.length >= 2 ? "AF: indicators support raised LV filling pressure." : ind.length === 1 ? "AF: one indicator of raised filling pressure; interpret with care." : "AF: no indicator of raised filling pressure among those entered.",
      detail: `ASE 2025 AF indicators: E/septal e′ ≥ 11, TR > 2.8 m/s, DT < 160 ms (reduced EF), IVRT ≤ 65 ms. ${ind.length ? `Present: ${ind.join("; ")}.` : ""} Average beats with matched R-R intervals; don't grade.` };
  }

  // Sinus rhythm: three primary variables
  const cut = eprimeCut(age);
  const eAvg = es !== undefined && el !== undefined ? (es + el) / 2 : undefined;
  const ePrimeLow = es === undefined && el === undefined ? undefined : (es !== undefined && eLow(es, cut.sept, cut.strict)) || (el !== undefined && eLow(el, cut.lat, cut.strict)) || (eAvg !== undefined && eLow(eAvg, cut.avg, cut.strict));
  const septRatio = d.e_sept_ratio, latRatio = e && el ? e / el : undefined;
  const eeHigh = d.e_eprime === undefined ? undefined : (es !== undefined && el !== undefined ? d.e_eprime > 14 : es !== undefined ? (septRatio ?? 0) >= 15 : (latRatio ?? 0) >= 13);
  const pasp = d.rvsp, rapKnown = d.rap !== undefined;
  const paHigh = trv === undefined ? undefined : rapKnown && pasp !== undefined ? pasp >= 35 : trv >= 2.8;
  const paLabel = rapKnown ? "PASP ≥ 35 mmHg" : "TR velocity ≥ 2.8 m/s";
  const prim: [string, boolean | undefined][] = [[`reduced e′ (${cut.label})`, ePrimeLow], ["average E/e′ > 14 (septal ≥ 15, lateral ≥ 13)", eeHigh], [paLabel, paHigh]];
  const avail = prim.filter((p) => p[1] !== undefined), pos = avail.filter((p) => p[1]);
  const list = avail.length ? avail.map((p) => `${p[0]}: ${p[1] ? "yes" : "no"}`).join("; ") + "." : "";

  // Supplementary variables
  const sup: [string, boolean | undefined][] = [["LARS ≤ 18%", lars === undefined ? undefined : lars <= 18], ["PV S/D ≤ 0.67", pvsd === undefined ? undefined : pvsd <= 0.67], ["LAVI > 34 ml/m²", lavi === undefined ? undefined : lavi > 34], ["IVRT ≤ 70 ms", ivrt === undefined ? undefined : ivrt <= 70]];
  const supAvail = sup.filter((x) => x[1] !== undefined), supPos = supAvail.filter((x) => x[1]);
  const supList = supAvail.length ? ` Supplementary: ${supAvail.map((x) => `${x[0]}: ${x[1] ? "yes" : "no"}`).join("; ")}.` : "";

  // Diastolic dysfunction present? (ASE 2025 Figure 2)
  const markers = [eeHigh, lars === undefined ? undefined : lars <= 18, ea === undefined ? undefined : ea <= 0.8 || ea >= 2, lavi === undefined ? undefined : lavi > 34].filter((x) => x === true).length;
  const ddPresent = ePrimeLow ? markers >= 1 : markers >= 2;

  if (avail.length === 3 && pos.length === 3) {
    const grade = ea === undefined ? "" : ea >= 2 ? "Grade 3 diastolic dysfunction" : "Grade 2 diastolic dysfunction";
    return { graded: !!grade, lap: "elevated", conclusion: `${grade ? grade + ", " : ""}raised LA pressure.`, detail: `All three primary variables abnormal: ${list}${ea !== undefined ? ` E/A ${fmt(ea, 1)} (${ea >= 2 ? "≥ 2: grade 3" : "< 2: grade 2"}).` : " Enter E and A to grade."}` };
  }
  if (avail.length === 3 && pos.length === 0) {
    return { graded: true, lap: "normal", conclusion: ddPresent ? "Normal LA pressure; markers of diastolic dysfunction present." : "Normal diastolic function, normal LA pressure.", detail: list + supList };
  }
  if (avail.length === 3 && ePrimeLow && pos.length === 1 && ea !== undefined && ea <= 0.8) {
    return { graded: true, lap: "normal", conclusion: "Grade 1 diastolic dysfunction, normal LA pressure.", detail: `Reduced e′ with normal E/e′ and PA pressure, E/A ${fmt(ea, 1)} ≤ 0.8. ${list}` };
  }
  // Needs supplementary variables
  if (supAvail.length) {
    if (supPos.length) {
      const grade = ePrimeLow && ea !== undefined ? (ea >= 2 ? "Grade 3 diastolic dysfunction, " : "Grade 2 diastolic dysfunction, ") : "";
      return { graded: !!grade, lap: "elevated", conclusion: `${grade}raised LA pressure (supported by ${supPos.map((x) => x[0]).join(", ")}).`, detail: `${list}${supList} ASE 2025: when the primary variables are discordant, LARS, PV S/D, LAVI or IVRT decide. LARS ≤ 18% is specific but may miss raised LAP when EF is normal; PV S/D can be > 0.67 despite raised LAP in normal EF.` };
    }
    return { graded: !!(ePrimeLow && ea !== undefined && ea <= 0.8), lap: "normal", conclusion: ePrimeLow ? "Impaired relaxation with normal LA pressure (grade 1)." : "LA pressure likely normal.", detail: list + supList };
  }
  if (!avail.length) return { graded: false, conclusion: "Diastolic function: enter e′, E/e′ and TR velocity.", detail: "" };
  return { graded: false, lap: "indeterminate", conclusion: "LA pressure indeterminate: add LARS, PV S/D, LAVI or IVRT.", detail: `${list} ASE 2025: with discordant or missing primary variables, use supplementary variables; if none are available report LAP as 'cannot be determined'.` };
}

// ---------- Report text ----------
const lc = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const unit = (k: string) => (FIELD[k]?.unit ? ` ${FIELD[k].unit}` : "");
const meas = (v: Values, k: string, dp = 1) => { const n = num(v, k); return n === undefined ? "" : `${fmt(n, dp)}${unit(k)}`; };

export interface Report { text: string; findings: string[] }

export function buildReport(v: Values): Report {
  const d = derive(v);
  const out: string[] = [];
  const findings: string[] = [];
  const line = (s: string) => s && out.push(s);
  const gtxt = (k: string) => gradeField(k, v, d);
  const isAbn = (gr: Grade | null) => gr && gr.level !== "normal" && gr.level !== "info";

  out.push(`TRANSTHORACIC ECHOCARDIOGRAM — ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`);
  const ctx = [
    v.indication && `Indication: ${v.indication}`,
    v.rhythm && `Rhythm: ${v.rhythm}${num(v, "hr") ? `, HR ${fmt(num(v, "hr"), 0)} bpm` : ""}`,
    v.quality && `Image quality: ${v.quality.toLowerCase()}`,
    v.ventilated === "Mechanically ventilated" && "Mechanically ventilated",
    (num(v, "height") || num(v, "weight")) && `Height ${meas(v, "height", 0) || "–"}, weight ${meas(v, "weight", 0) || "–"}${d.bsa ? `, BSA ${fmt(d.bsa, 2)} m²` : ""}`,
  ].filter(Boolean);
  if (ctx.length) out.push(ctx.join(". ") + ".");
  out.push("");

  // LV
  const lv: string[] = [];
  const ef = num(v, "ef") ?? d.ef_calc;
  const efTxt = ef !== undefined ? GRADERS.ef(ef, v, d)!.text.replace(/ \(.*\)/, "") : "";
  if (v.lv_visual || ef !== undefined) {
    const fn = v.lv_visual ? lc(v.lv_visual) : lc(efTxt);
    lv.push(`${fn.charAt(0).toUpperCase() + fn.slice(1)} LV systolic function${ef !== undefined ? ` (EF ${fmt(ef, 0)}%${num(v, "ef") !== undefined ? ", biplane" : ", from volumes"})` : ""}.`);
    if (v.lv_visual && v.lv_visual !== "Normal") findings.push(`${v.lv_visual} LV systolic function`);
    else if (!v.lv_visual && ef !== undefined && ef < 55) findings.push(`${efTxt} LV systolic function (EF ${fmt(ef, 0)}%)`);
  }
  const lvidd = gtxt("lvidd");
  if (num(v, "lvidd")) { lv.push(`LVIDd ${meas(v, "lvidd")}${lvidd ? ` (${lc(lvidd.text.replace(/ \(.*\)/, ""))})` : ""}.`); if (isAbn(lvidd)) findings.push(`${lvidd!.text.replace(/ \(.*\)/, "")} LV`); }
  const iv = gtxt("ivsd"), pw = gtxt("lvpwd");
  if (num(v, "ivsd") || num(v, "lvpwd")) {
    lv.push(`Wall thickness IVSd ${meas(v, "ivsd") || "–"}, LVPWd ${meas(v, "lvpwd") || "–"}${d.rwt ? `, RWT ${fmt(d.rwt, 2)}` : ""}${d.lvmi ? `, LV mass index ${fmt(d.lvmi, 0)} g/m²` : ""}.`);
    if (isAbn(iv) || isAbn(pw)) {
      const conc = d.rwt !== undefined && d.rwt > 0.42;
      const lvmiG = d.lvmi !== undefined ? DERIVED_GRADERS.lvmi?.(d.lvmi, v) : null;
      const lvmiHigh = !!lvmiG && lvmiG.level !== "normal" && lvmiG.level !== "info";
      const pattern = d.lvmi === undefined ? "Increased wall thickness" : lvmiHigh ? (conc ? "Concentric LV hypertrophy" : "Eccentric LV hypertrophy") : conc ? "Concentric remodelling" : "Increased wall thickness";
      lv.push(`${pattern}.`); findings.push(pattern);
    }
  }
  if (v.rwma) lv.push(`Regional wall motion: ${v.rwma}.`);
  if (v.rwma && !/^(none|normal|no )/i.test(v.rwma)) findings.push(`Regional wall motion abnormality (${v.rwma})`);
  if (num(v, "mapse")) lv.push(`Lateral MAPSE ${meas(v, "mapse", 0)}.`);
  if (num(v, "lv_gls") !== undefined) { const gr = gtxt("lv_gls"); lv.push(`LV GLS −${fmt(Math.abs(num(v, "lv_gls")!), 1)}%${gr ? ` (${lc(gr.text.replace(/ \(.*\)/, ""))})` : ""}.`); if (isAbn(gr)) findings.push(`${gr!.level === "borderline" ? "Borderline" : "Reduced"} LV global longitudinal strain (−${fmt(Math.abs(num(v, "lv_gls")!), 1)}%)`); }
  if (d.sv) {
    lv.push(`LVOT VTI ${meas(v, "lvot_vti")}, stroke volume ${fmt(d.sv, 0)} ml${d.svi ? ` (SVi ${fmt(d.svi, 0)} ml/m²)` : ""}${d.co ? `, cardiac output ${fmt(d.co, 1)} L/min${d.ci ? ` (CI ${fmt(d.ci, 1)})` : ""}` : ""}.`);
    if (d.svi !== undefined && d.svi < 35) findings.push(`Low stroke volume index (${fmt(d.svi, 0)} ml/m²)`);
  } else if (num(v, "lvot_vti")) { lv.push(`LVOT VTI ${meas(v, "lvot_vti")}.`); const gr = gtxt("lvot_vti"); if (gr && gr.level === "mild") findings.push(`Low LVOT VTI (${meas(v, "lvot_vti")})`); }
  if (lv.length) out.push("LEFT VENTRICLE", ...lv, "");

  // RV
  const rv: string[] = [];
  const size: string[] = [];
  if (num(v, "rv_basal")) size.push(`basal diameter ${meas(v, "rv_basal", 0)}`);
  if (num(v, "rv_mid")) size.push(`mid ${meas(v, "rv_mid", 0)}`);
  if (num(v, "rv_lv")) size.push(`RV:LV ratio ${fmt(num(v, "rv_lv"), 1)}`);
  const rvDil = [gtxt("rv_basal"), gtxt("rv_mid"), gtxt("rv_lv")].filter(isAbn) as Grade[];
  if (size.length) { rv.push(`${rvDil.length ? (rvDil.some((x) => x.level === "severe") ? "Severely dilated" : "Dilated") : "Normal size"} RV (${size.join(", ")}).`); if (rvDil.length) findings.push(`${rvDil.some((x) => x.level === "severe") ? "Severely dilated" : "Dilated"} RV`); }
  const fnBits: string[] = [];
  const tg = gtxt("tapse"), sg = gtxt("rv_s");
  if (num(v, "tapse")) fnBits.push(`TAPSE ${meas(v, "tapse", 0)}`);
  if (num(v, "rv_s")) fnBits.push(`S′ ${meas(v, "rv_s")}`);
  if (d.fac !== undefined) fnBits.push(`FAC ${fmt(d.fac, 0)}%`);
  const facAbn = d.fac !== undefined && d.fac < 35;
  if (fnBits.length) { const abn = isAbn(tg) || isAbn(sg) || facAbn; rv.push(`${abn ? "Impaired" : "Normal"} RV systolic function (${fnBits.join(", ")}).`); if (abn) findings.push("Impaired RV systolic function"); }
  if (num(v, "rv_fws") !== undefined) { const gr = gtxt("rv_fws"); rv.push(`RV free wall strain −${fmt(Math.abs(num(v, "rv_fws")!), 1)}%${isAbn(gr) ? " (reduced)" : ""}.`); if (isAbn(gr)) findings.push("Reduced RV free wall strain"); }
  const rw = gtxt("rv_wall"); if (num(v, "rv_wall")) rv.push(`RV free wall ${meas(v, "rv_wall", 0)}${isAbn(rw) ? " (hypertrophied)" : ""}.`);
  if (v.septum) { rv.push(v.septum === "Normal" ? "Normal septal motion." : `Septum ${lc(v.septum)}.`); if (v.septum !== "Normal") findings.push(`Septal ${lc(v.septum.replace("Flattened", "flattening"))}`); }
  if (rv.length) out.push("RIGHT VENTRICLE", ...rv, "");

  // Atria
  const la: string[] = [];
  if (d.lavi !== undefined) { const gr = laviGrade(d.lavi, stdOf(v)); la.push(`LA: ${lc(gr.text.replace(/ \(.*\)/, ""))} (LAVI ${fmt(d.lavi, 0)} ml/m²${num(v, "la_vol") ? `, volume ${meas(v, "la_vol", 0)}` : ""}).`); if (isAbn(gr)) findings.push(`${gr.text.replace(/ \(.*\)/, "")} LA`); }
  else if (num(v, "la_vol")) la.push(`LA volume ${meas(v, "la_vol", 0)} (enter height and weight to index).`);
  if (num(v, "la_area")) { const gr = gtxt("la_area"); la.push(`LA area ${meas(v, "la_area", 0)}${isAbn(gr) ? " (dilated)" : ""}.`); if (d.lavi === undefined && isAbn(gr)) findings.push("Dilated LA"); }
  if (num(v, "la_rs") !== undefined) { const gr = gtxt("la_rs"); la.push(`LA reservoir strain ${fmt(num(v, "la_rs"), 0)}%${isAbn(gr) ? " (≤ 18%: supports raised LA pressure)" : ""}.`); }
  if (la.length) out.push("LEFT ATRIUM", ...la, "");
  if (num(v, "ra_area")) { const gr = gtxt("ra_area"); out.push("RIGHT ATRIUM", `${isAbn(gr) ? "Dilated" : "Normal size"} RA (area ${meas(v, "ra_area", 0)}).`, ""); if (isAbn(gr)) findings.push("Dilated RA"); }

  // Valves
  const val: string[] = [];
  const av: string[] = [];
  if (v.av_morph) av.push(`${v.av_morph}.`);
  if (num(v, "av_vmax") || num(v, "av_meanpg") || d.ava) {
    const parts = [num(v, "av_vmax") && `Vmax ${meas(v, "av_vmax")}`, num(v, "av_meanpg") && `mean gradient ${meas(v, "av_meanpg", 0)}`, d.ava && `AVA ${fmt(d.ava, 2)} cm² (continuity)`, d.dvi && `DVI ${fmt(d.dvi, 2)}`].filter(Boolean);
    const grades = [gtxt("av_vmax"), gtxt("av_meanpg"), d.ava !== undefined ? DERIVED_GRADERS.ava!(d.ava, v) : null].filter(Boolean) as Grade[];
    const rank = { normal: 0, borderline: 0, info: 0, mild: 1, moderate: 2, severe: 3 } as const;
    const worst = Math.max(0, ...grades.map((x) => rank[x.level]));
    const best = Math.min(...grades.map((x) => rank[x.level]));
    const word = ["No significant aortic stenosis", "Mild aortic stenosis", "Moderate aortic stenosis", "Severe aortic stenosis"];
    const disc = grades.length > 1 && worst - best >= 1 && worst >= 2;
    av.push(`${disc ? `Discordant grading (${word[best].toLowerCase()} to ${word[worst].toLowerCase()})` : word[worst]}: ${parts.join(", ")}.`);
    if (disc) av.push("Check LVOT diameter and alignment; consider low-flow states (SVi < 35 ml/m²).");
    if (worst >= 1) findings.push(disc ? "Aortic stenosis with discordant grading" : word[worst]);
  }
  if (v.ar) { av.push(regurgText("aortic", v.ar, [num(v, "ar_vc") && `VC ${meas(v, "ar_vc")}`, num(v, "ar_pht") && `PHT ${meas(v, "ar_pht", 0)}`, v.desc_ao && v.desc_ao !== "No reversal" && `${v.desc_ao.toLowerCase()} in the descending aorta`])); if (["Moderate", "Severe"].includes(v.ar)) findings.push(`${v.ar} aortic regurgitation`); }
  if (av.length) val.push(`Aortic valve: ${av.join(" ")}`);

  const mv: string[] = [];
  if (v.mv_morph) mv.push(`${v.mv_morph}.`);
  if (num(v, "mv_meanpg") || d.mva_pht) {
    const parts = [num(v, "mv_meanpg") && `mean gradient ${meas(v, "mv_meanpg", 0)}${num(v, "hr") ? ` at HR ${fmt(num(v, "hr"), 0)}` : ""}`, d.mva_pht && `MVA ${fmt(d.mva_pht, 1)} cm² by PHT`].filter(Boolean);
    const gr = d.mva_pht !== undefined ? DERIVED_GRADERS.mva_pht!(d.mva_pht, v) : gtxt("mv_meanpg");
    const w = gr ? { mild: "Mild", moderate: "Moderate", severe: "Severe" }[gr.level as "mild"] : "";
    mv.push(`${w ? `${w} mitral stenosis` : "Mitral stenosis assessment"}: ${parts.join(", ")}.`);
    if (w) findings.push(`${w} mitral stenosis`);
  }
  if (v.mr) { mv.push(regurgText("mitral", v.mr, [num(v, "mr_vc") && `VC ${meas(v, "mr_vc")}`, num(v, "mr_eroa") && `EROA ${meas(v, "mr_eroa", 2)}`])); if (["Moderate", "Severe"].includes(v.mr)) findings.push(`${v.mr} mitral regurgitation`); }
  if (mv.length) val.push(`Mitral valve: ${mv.join(" ")}`);

  const tv: string[] = [];
  if (v.tr) tv.push(regurgText("tricuspid", v.tr, [num(v, "tr_vc") && `VC ${meas(v, "tr_vc")}`]));
  if (v.tr && ["Moderate", "Severe"].includes(v.tr)) findings.push(`${v.tr} tricuspid regurgitation`);
  if (tv.length) val.push(`Tricuspid valve: ${tv.join(" ")}`);
  if (v.pr) val.push(`Pulmonary valve: ${regurgText("pulmonary", v.pr, [])}`);
  if (val.length) out.push("VALVES", ...val, "");

  // Aorta
  const ao: string[] = [];
  if (num(v, "ao_sinus")) { const gr = gtxt("ao_sinus"); ao.push(`Sinuses ${meas(v, "ao_sinus")}${isAbn(gr) ? " (dilated)" : ""}`); if (isAbn(gr)) findings.push("Dilated aortic root"); }
  if (num(v, "ao_asc")) { const gr = gtxt("ao_asc"); ao.push(`proximal ascending aorta ${meas(v, "ao_asc")}${isAbn(gr) ? " (dilated)" : ""}`); if (isAbn(gr)) findings.push("Dilated ascending aorta"); }
  if (ao.length) out.push("AORTA", `${ao.join(", ")}.`, "");

  // IVC
  if (num(v, "ivc_d") || v.ivc_collapse) {
    const vent = v.ventilated === "Mechanically ventilated";
    out.push("IVC", `IVC ${meas(v, "ivc_d") || "–"}${v.ivc_collapse ? `, ${v.ivc_collapse} collapse` : ""}. ${vent ? "Mechanically ventilated: RAP not estimated from IVC." : d.rap !== undefined ? `Estimated RAP ${d.rap} mmHg${d.rap === 3 ? " (0–5)" : d.rap === 8 ? " (5–10)" : " (10–20)"}.` : ""}`.trim(), "");
    if (d.rap === 15) findings.push("Dilated, non-collapsing IVC (estimated RAP 15 mmHg)");
  }

  // PH
  const ph = phProbability(v, d);
  if (ph.probability !== "Not assessable") {
    const lines = [`Echocardiographic probability of pulmonary hypertension: ${ph.probability.toUpperCase()}.`, ph.reason];
    if (d.rvsp) lines.push(`Estimated RVSP ${fmt(d.rvsp, 0)} mmHg (4V² + RAP ${d.rap ?? "8 assumed"})${d.mpap ? `; estimated mean PAP ~${fmt(d.mpap, 0)} mmHg` : ""}${d.tapse_spap ? `; TAPSE/sPAP ${fmt(d.tapse_spap, 2)} mm/mmHg` : ""}.`);
    out.push("PULMONARY HYPERTENSION", ...lines, "");
    if (ph.probability !== "Low") findings.push(`${ph.probability} probability of pulmonary hypertension${d.rvsp ? ` (RVSP ~${fmt(d.rvsp, 0)} mmHg)` : ""}`);
  }

  // Diastology
  const ds = diastology(v, d);
  const dsBits = [num(v, "e") && `E ${meas(v, "e", 0)}`, num(v, "a") && `A ${meas(v, "a", 0)}`, d.e_a && `E/A ${fmt(d.e_a, 1)}`, num(v, "dt") && `DT ${meas(v, "dt", 0)}`, num(v, "e_sept") && `septal e′ ${meas(v, "e_sept")}`, num(v, "e_lat") && `lateral e′ ${meas(v, "e_lat")}`, d.e_eprime && `average E/e′ ${fmt(d.e_eprime, 1)}`].filter(Boolean);
  if (dsBits.length || ds.graded) {
    out.push("DIASTOLOGY", ds.conclusion, ...(dsBits.length ? [`${dsBits.join(", ")}.`] : []), ...(ds.detail ? [ds.detail] : []), "");
    if (ds.lap === "elevated" || /^Grade/.test(ds.conclusion)) findings.push(ds.conclusion.replace(/\.$/, ""));
  }

  // Pericardium
  if (v.eff) {
    const depth = num(v, "eff_depth"), gr = gtxt("eff_depth");
    const sizeWord = gr ? gr.text.replace(/ \(.*\)/, "").toLowerCase() : "";
    const t = v.eff === "None" ? "No pericardial effusion." : `${sizeWord ? sizeWord.charAt(0).toUpperCase() + sizeWord.slice(1) + " p" : "P"}ericardial effusion${depth ? ` (${fmt(depth, 0)} mm)` : ""}.${v.tamponade && v.tamponade !== "None" ? ` Features of tamponade physiology: ${lc(v.tamponade)}.` : v.tamponade === "None" ? " No echocardiographic features of tamponade." : ""}`;
    out.push("PERICARDIUM", t, "");
    if (v.eff === "Present") findings.push(`${sizeWord ? sizeWord.charAt(0).toUpperCase() + sizeWord.slice(1) + " p" : "P"}ericardial effusion${v.tamponade && v.tamponade !== "None" ? " with tamponade features" : ""}`);
  }

  out.push("SUMMARY");
  if (findings.length) findings.forEach((f, i) => out.push(`${i + 1}. ${f}.`));
  else out.push("No significant abnormality identified in the parameters recorded.");
  if (v.quality === "Poor" || v.quality === "Very limited") out.push(`Limited by ${v.quality.toLowerCase()} image quality.`);
  return { text: out.join("\n").replace(/\n{3,}/g, "\n\n").trim(), findings };
}

function regurgText(valve: string, sev: string, extras: (string | 0 | undefined | false | "")[]): string {
  const ex = extras.filter(Boolean);
  if (sev === "None") return `No ${valve} regurgitation.`;
  return `${sev} ${valve} regurgitation${ex.length ? ` (${ex.join(", ")})` : ""}.`;
}
