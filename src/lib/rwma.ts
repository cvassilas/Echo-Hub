/**
 * 17-segment LV model (ASE/EACVI 2015): wall motion states, wall motion score index and
 * a plain-English summary. Stored as a 17-character string, one code per segment.
 */
export const SEGMENTS = [
  "basal anterior", "basal anteroseptal", "basal inferoseptal", "basal inferior", "basal inferolateral", "basal anterolateral",
  "mid anterior", "mid anteroseptal", "mid inferoseptal", "mid inferior", "mid inferolateral", "mid anterolateral",
  "apical anterior", "apical septal", "apical inferior", "apical lateral", "apex",
];

export type WmCode = "." | "N" | "H" | "A" | "D" | "V" | "X";
export const WM_STATES: { code: WmCode; label: string; short: string; score?: number; color: string }[] = [
  { code: "N", label: "Normal", short: "N", score: 1, color: "#2FA37A" },
  { code: "H", label: "Hypokinetic", short: "H", score: 2, color: "#F2B33D" },
  { code: "A", label: "Akinetic", short: "A", score: 3, color: "#E07B3F" },
  { code: "D", label: "Dyskinetic", short: "D", score: 4, color: "#E05A4F" },
  { code: "V", label: "Aneurysmal", short: "An", score: 4, color: "#A6409A" },
  { code: "X", label: "Not seen", short: "–", color: "#5b666c" },
];
export const wmState = (c: string) => WM_STATES.find((s) => s.code === c);

/** Usual coronary territories (individual anatomy varies). */
export const TERRITORY: Record<string, number[]> = {
  LAD: [1, 2, 7, 8, 13, 14, 17],
  RCA: [3, 4, 9, 10, 15],
  LCx: [5, 6, 11, 12, 16],
};

export const parseWm = (s?: string): WmCode[] => Array.from({ length: 17 }, (_, i) => ((s || "")[i] as WmCode) || ".");
export const serialiseWm = (a: WmCode[]) => a.join("");

export interface WmSummary { scored: number; wmsi?: number; abnormal: number[]; text: string; finding?: string }

export function summariseWm(s?: string): WmSummary | null {
  const a = parseWm(s);
  if (a.every((c) => c === ".")) return null;
  const scored = a.map((c, i) => ({ c, i, st: wmState(c) })).filter((x) => x.st?.score);
  const wmsi = scored.length ? scored.reduce((sum, x) => sum + x.st!.score!, 0) / scored.length : undefined;
  const abnormal = scored.filter((x) => x.c !== "N").map((x) => x.i + 1);
  const notSeen = a.map((c, i) => (c === "X" ? i + 1 : 0)).filter(Boolean);
  const parts: string[] = [];
  for (const st of WM_STATES.filter((x) => x.code !== "N" && x.code !== "X")) {
    let idx = a.map((c, i) => (c === st.code ? i : -1)).filter((i) => i >= 0);
    if (!idx.length) continue;
    const whole: string[] = [];
    for (const [name, ring] of [["all basal segments", [0, 1, 2, 3, 4, 5]], ["all mid segments", [6, 7, 8, 9, 10, 11]], ["all apical segments", [12, 13, 14, 15]]] as const) {
      if (ring.every((i) => idx.includes(i))) { whole.push(name + (name === "all apical segments" && idx.includes(16) ? " and the apex" : "")); idx = idx.filter((i) => !(ring as readonly number[]).includes(i) && !(name === "all apical segments" && i === 16)); }
    }
    const rest = idx.length ? joinSegments(idx.map((i) => SEGMENTS[i])) : "";
    parts.push(`${st.label.toLowerCase()}: ${[...whole, rest].filter(Boolean).join(", ")}`);
  }
  let text: string;
  if (!abnormal.length) text = scored.length === 17 ? "Normal regional wall motion in all 17 segments." : `Normal regional wall motion in the ${scored.length} segments assessed.`;
  else {
    const terr = Object.entries(TERRITORY).filter(([, segs]) => abnormal.some((n) => segs.includes(n))).map(([t]) => t);
    const apicalAll = [13, 14, 15, 16, 17].every((n) => abnormal.includes(n));
    const basalNormal = [1, 2, 3, 4, 5, 6].every((n) => a[n - 1] === "N");
    const pattern = apicalAll && basalNormal && terr.length > 1
      ? " Circumferential apical (± mid) abnormality with basal sparing: consider Takotsubo or a wrap-around LAD."
      : terr.length === 1 ? ` In keeping with the ${terr[0]} territory.` : ` Involves more than one coronary territory (${terr.join(", ")}).`;
    text = `Regional wall motion abnormality, ${parts.join("; ")}.${pattern}`;
  }
  if (wmsi !== undefined) text += ` Wall motion score index ${wmsi.toFixed(2)} (${scored.length} segments).`;
  if (notSeen.length) text += ` ${notSeen.length} segment${notSeen.length > 1 ? "s" : ""} not seen.`;
  const finding = abnormal.length ? `Regional wall motion abnormality (${parts.join("; ")})${wmsi !== undefined ? `, WMSI ${wmsi.toFixed(2)}` : ""}` : undefined;
  return { scored: scored.length, wmsi, abnormal, text, finding };
}

/** "basal inferior, mid inferior" → "basal and mid inferior" where walls repeat. */
function joinSegments(names: string[]): string {
  const byWall = new Map<string, string[]>();
  const order: string[] = [];
  for (const n of names) {
    if (n === "apex") { byWall.set("apex", ["apex"]); order.push("apex"); continue; }
    const [level, ...wall] = n.split(" ");
    const w = wall.join(" ");
    if (!byWall.has(w)) { byWall.set(w, []); order.push(w); }
    byWall.get(w)!.push(level);
  }
  return order.map((w) => (w === "apex" ? "apex" : `${listAnd(byWall.get(w)!)} ${w}`)).join(", ");
}
const listAnd = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
