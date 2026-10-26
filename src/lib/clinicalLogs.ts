/** Hand a finished report to the Clinical Logs app as a prefilled echo logbook entry (opened for review there). */
import { Capacitor, registerPlugin } from "@capacitor/core";
import { FIELDS, Values, num } from "./echo";

const Launcher = registerPlugin<{ openUrl(o: { url: string }): Promise<void> }>("AppLauncher");

/** Echo Hub key -> [Clinical Logs MeasKey, factor to convert to its unit] */
const MEAS_MAP: Record<string, [string, number]> = {
  hr: ["hr", 1], lvidd: ["lvidd", 10], lvids: ["lvids", 10], ivsd: ["ivsd", 10], lvpwd: ["lvpwd", 10], ef: ["ef", 1],
  mapse: ["mapse", 1], lvot_d: ["lvot_d", 10], lvot_vti: ["lvot_vti", 1], e: ["e_vel", 1], a: ["a_vel", 1],
  e_sept: ["e_sep", 1], e_lat: ["e_lat", 1], la_vol: ["la_vol", 1], tapse: ["tapse", 1], rv_s: ["rv_s", 1],
  rv_basal: ["rv_basal", 1], trv: ["tr_vmax", 1], ivc_d: ["ivc_max", 10], av_vmax: ["av_vmax", 1],
  av_meanpg: ["av_meangrad", 1], eff_depth: ["effusion", 1],
};

const SECTION_TO_FIELD: Record<string, "lv" | "rv" | "valves" | "ivc" | "other" | "impression"> = {
  "LEFT VENTRICLE": "lv", "RIGHT VENTRICLE": "rv", VALVES: "valves", IVC: "ivc", SUMMARY: "impression",
};

function splitReport(text: string) {
  const out: Record<string, string[]> = { lv: [], rv: [], valves: [], ivc: [], other: [], impression: [] };
  let cur: string | null = null;
  let otherHead = "";
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("TRANSTHORACIC")) continue;
    if (/^[A-Z][A-Z \-]+$/.test(line)) { cur = SECTION_TO_FIELD[line] || "other"; otherHead = cur === "other" ? line.charAt(0) + line.slice(1).toLowerCase() : ""; continue; }
    if (!cur) continue;
    out[cur].push(cur === "other" && otherHead ? `${otherHead}: ${line}` : line);
    if (cur === "other") otherHead = "";
  }
  const j = (k: string) => out[k].join(" ").trim();
  return { lv: j("lv"), rv: j("rv"), valves: j("valves"), ivc: j("ivc"), other: j("other"), impression: j("impression") };
}

export function toLogEntry(v: Values, reportText: string, findings: string[]) {
  const s = splitReport(reportText);
  const meas: Record<string, number> = {};
  for (const [k, [to, f]] of Object.entries(MEAS_MAP)) { const n = num(v, k); if (n !== undefined) meas[to] = Math.round(n * f * 100) / 100; }
  const measText = FIELDS.filter((f) => f.kind === "num" && num(v, f.key) !== undefined && !["age", "height", "weight"].includes(f.key))
    .map((f) => `${f.label} ${v[f.key]}${f.unit ? ` ${f.unit}` : ""}`).join("; ");
  const q = v.quality === "Very limited" ? "Poor" : v.quality || "Adequate";
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return {
    logType: "echo", date, type: "formal", study_type: "TTE", location: "ICU", patient_type: "ICU",
    age: num(v, "age") ?? null, sex: v.sex === "M" || v.sex === "F" ? v.sex : "", quality: q,
    indication: v.indication || "Transthoracic echo", supervision: "Independent",
    lv: s.lv || "Not assessed", rv: s.rv || "Not assessed", valves: s.valves || "Not assessed", ivc: s.ivc || "Not assessed",
    other: s.other || "Not assessed", impression: s.impression || "See report", pathologies: findings.join("; "),
    height_cm: num(v, "height"), weight_kg: num(v, "weight"), meas, measurements: measText, report: reportText,
  };
}

const b64url = (s: string) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export async function sendToClinicalLogs(entry: object) {
  const url = `clinicallogs://echo?d=${b64url(JSON.stringify(entry))}`;
  if (!Capacitor.isNativePlatform()) throw new Error("This works in the Android app, with Clinical Logs installed.");
  await Launcher.openUrl({ url });
}
