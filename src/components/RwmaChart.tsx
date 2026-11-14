import React, { useState } from "react";
import { SEGMENTS, WM_STATES, WmCode, parseWm, serialiseWm, summariseWm, wmState } from "../lib/rwma";

/** Tappable 17-segment bull's-eye: pick a state, then tap segments to apply it (tap again to clear). */

const CX = 140, CY = 122;
const R = [0, 26, 52, 78, 104]; // apex, apical ring, mid ring, basal ring outer radii
const rad = (deg: number) => ((deg - 90) * Math.PI) / 180; // 0° = top, clockwise

function arc(r0: number, r1: number, a0: number, a1: number) {
  const p = (r: number, a: number) => `${(CX + r * Math.cos(rad(a))).toFixed(2)},${(CY + r * Math.sin(rad(a))).toFixed(2)}`;
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${p(r1, a0)} A${r1},${r1} 0 ${large} 1 ${p(r1, a1)} L${p(r0, a1)} A${r0},${r0} 0 ${large} 0 ${p(r0, a0)} Z`;
}
/** Segment number → [path, label x, label y]. Anterior at the top, septum on the left, lateral on the right. */
const GEOM: [string, number, number][] = (() => {
  const g: [string, number, number][] = [];
  // Basal (1–6) and mid (7–12): anterior 0°, anteroseptal 300°, inferoseptal 240°, inferior 180°, inferolateral 120°, anterolateral 60°
  const centres = [0, 300, 240, 180, 120, 60];
  for (const [ring, r0, r1] of [[0, R[3], R[4]], [1, R[2], R[3]]] as const) {
    centres.forEach((c, i) => {
      const rm = (r0 + r1) / 2;
      g[ring * 6 + i] = [arc(r0, r1, c - 30, c + 30), CX + rm * Math.cos(rad(c)), CY + rm * Math.sin(rad(c))];
    });
  }
  // Apical (13–16): anterior 0°, septal 270°, inferior 180°, lateral 90°
  [0, 270, 180, 90].forEach((c, i) => {
    const rm = (R[1] + R[2]) / 2;
    g[12 + i] = [arc(R[1], R[2], c - 45, c + 45), CX + rm * Math.cos(rad(c)), CY + rm * Math.sin(rad(c))];
  });
  g[16] = [`M${CX - R[1]},${CY} A${R[1]},${R[1]} 0 1 1 ${CX + R[1]},${CY} A${R[1]},${R[1]} 0 1 1 ${CX - R[1]},${CY} Z`, CX, CY];
  return g;
})();

/** Apical views: segment numbers along the wall from the left base, over the apex, to the right base. */
type ApicalId = "a4c" | "a2c" | "a3c";
const APICAL: Record<ApicalId, { title: string; left: string; right: string; segs: number[] }> = {
  a4c: { title: "A4C", left: "Inferoseptal", right: "Anterolateral", segs: [3, 9, 14, 17, 16, 12, 6] },
  a2c: { title: "A2C", left: "Inferior", right: "Anterior", segs: [4, 10, 15, 17, 13, 7, 1] },
  a3c: { title: "A3C", left: "Inferolateral", right: "Anteroseptal", segs: [5, 11, 16, 17, 14, 8, 2] },
};
// Wall spans along the LV outline (radians, from left base over the apex to right base)
const SPANS = [0.62, 0.62, 0.52, 0.12, 0.52, 0.62, 0.62];
const ACX = 110, ACY = 160, ARX = 58, ARY = 118, WALL = 22;
function wallPath(a0: number, a1: number) {
  const n = 16, pts: string[] = [];
  for (let k = 0; k <= n; k++) {
    const a = a0 + ((a1 - a0) * k) / n;
    pts.push(`${(ACX + ARX * Math.cos(a)).toFixed(1)},${(ACY - ARY * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}
const APICAL_GEOM: [string, number, number][] = (() => {
  const out: [string, number, number][] = [];
  let a = Math.PI + 0.25;
  SPANS.forEach((sp) => {
    const a1 = a - sp, mid = (a + a1) / 2;
    out.push([wallPath(a, a1), ACX + (ARX + 24) * Math.cos(mid), ACY - (ARY + 24) * Math.sin(mid)]);
    a = a1;
  });
  return out;
})();

const ApicalView: React.FC<{ id: ApicalId; segs: WmCode[]; onTap: (i: number) => void }> = ({ id, segs, onTap }) => {
  const view = APICAL[id];
  const baseY = ACY - ARY * Math.sin(Math.PI + 0.25);
  const xl = ACX + ARX * Math.cos(Math.PI + 0.25), xr = ACX + ARX * Math.cos(-0.25);
  return (
    <svg viewBox="0 0 220 252" className="w-full touch-manipulation" role="group" aria-label={`${view.title} wall motion`}>
      <path d={`${wallPath(Math.PI + 0.25, -0.25)} Z`} fill="var(--c-surface2)" opacity={0.6} />
      {id === "a3c" && <path d={`M${xr - 4},${baseY} Q${xr + 18},${baseY + 26} ${xr + 6},${baseY + 50}`} stroke="var(--c-muted)" strokeWidth={10} fill="none" opacity={0.35} />}
      <line x1={xl + 8} y1={baseY} x2={id === "a3c" ? xr - 26 : xr - 8} y2={baseY} stroke="var(--c-muted)" strokeWidth={2} strokeDasharray="4 3" />
      <text x={ACX} y={baseY + 16} textAnchor="middle" fontSize={9} fill="var(--c-muted)">{id === "a3c" ? "MV        AV" : "mitral valve"}</text>
      {APICAL_GEOM.map(([d, lx, ly], k) => {
        const n = view.segs[k], i = n - 1, st = wmState(segs[i]);
        return (
          <g key={k} onClick={() => onTap(i)} style={{ cursor: "pointer" }} role="button" aria-label={`${SEGMENTS[i]}: ${st?.label || "not scored"}`}>
            <path d={d} stroke="transparent" strokeWidth={WALL + 16} fill="none" />
            <path d={d} stroke={st ? st.color : "var(--c-border2)"} strokeOpacity={st ? 0.9 : 1} strokeWidth={WALL} strokeLinecap="butt" fill="none" />
            <text x={lx} y={ly + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={st && st.code !== "N" ? st.color : "var(--c-text2)"} pointerEvents="none">{st && st.code !== "N" ? `${n} ${st.short}` : n}</text>
          </g>
        );
      })}
      <text x={xl - 2} y={baseY + 32} fontSize={10} fill="var(--c-muted)" textAnchor="middle">{view.left}</text>
      <text x={xr + 2} y={baseY + (id === "a3c" ? 46 : 32)} fontSize={10} textAnchor="middle" fill="var(--c-muted)">{view.right}</text>
    </svg>
  );
};

const Bullseye: React.FC<{ segs: WmCode[]; onTap: (i: number) => void; compact?: boolean }> = ({ segs, onTap, compact }) => (
  <svg viewBox="0 0 280 250" className="w-full touch-manipulation" role="group" aria-label="17-segment wall motion chart">
    {GEOM.map(([d, lx, ly], i) => {
      const st = wmState(segs[i]);
      return (
        <g key={i} onClick={() => onTap(i)} style={{ cursor: "pointer" }} role="button" aria-label={`${SEGMENTS[i]}: ${st?.label || "not scored"}`}>
          <path d={d} fill={st ? st.color : "var(--c-surface2)"} fillOpacity={st ? 0.85 : 1} stroke="var(--c-bg, #0b0f11)" strokeWidth={2} />
          <text x={lx} y={ly + 4} textAnchor="middle" fontSize={compact ? 13 : 11} fontWeight={700} fill={st ? "#0b0f11" : "var(--c-muted)"} pointerEvents="none">{st && st.code !== "N" ? st.short : i + 1}</text>
        </g>
      );
    })}
    {!compact && <>
      <text x={CX} y={11} textAnchor="middle" fontSize={9} fill="var(--c-muted)">Anterior</text>
      <text x={CX} y={246} textAnchor="middle" fontSize={9} fill="var(--c-muted)">Inferior</text>
      <text x={4} y={CY + 3} fontSize={9} fill="var(--c-muted)">Septal</text>
      <text x={276} y={CY + 3} textAnchor="end" fontSize={9} fill="var(--c-muted)">Lateral</text>
    </>}
  </svg>
);

export const RwmaChart: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [brush, setBrush] = useState<WmCode>("H");
  const [view, setView] = useState<"bull" | ApicalId>("bull");
  const segs = parseWm(value);
  const sum = summariseWm(value);
  const tap = (i: number) => { const next = [...segs]; next[i] = next[i] === brush ? "." : brush; onChange(serialiseWm(next)); };
  const chip = (on: boolean) => `m3-press px-3 py-2 rounded-full text-[13px] font-bold border flex items-center gap-1.5 ${on ? "border-transparent bg-[var(--c-tonal)] text-[var(--c-on-tonal)]" : "border-[var(--c-border2)] text-[var(--c-text2)]"}`;
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap gap-1.5">
        {WM_STATES.map((s) => (
          <button key={s.code} type="button" onClick={() => setBrush(s.code)} aria-pressed={brush === s.code} className={chip(brush === s.code)}>
            <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />{s.label}
          </button>
        ))}
      </div>
      <div className="flex rounded-full border border-[var(--c-border2)] overflow-hidden" role="tablist" aria-label="Wall motion view">
        {([["bull", "Bull's-eye"], ["a4c", "A4C"], ["a2c", "A2C"], ["a3c", "A3C"]] as const).map(([k, l]) => (
          <button key={k} type="button" role="tab" aria-selected={view === k} onClick={() => setView(k)}
            className={`m3-press flex-1 min-h-[42px] text-[13.5px] font-bold ${view === k ? "bg-[var(--c-tonal)] text-[var(--c-on-tonal)]" : "text-[var(--c-text2)]"}`}>{l}</button>
        ))}
      </div>
      {view === "bull" ? (
        <div className="max-w-[360px] mx-auto"><Bullseye segs={segs} onTap={tap} /></div>
      ) : (
        <div className="grid grid-cols-[3fr_2fr] gap-2 items-center max-w-[520px] mx-auto">
          <ApicalView id={view} segs={segs} onTap={tap} />
          <div><Bullseye segs={segs} onTap={tap} compact /><p className="text-[10.5px] text-center text-[var(--c-muted)]">Updates together</p></div>
        </div>
      )}
      <div className="space-y-2 text-[12.5px] text-[var(--c-text2)]">
        <div className="flex gap-2 flex-wrap">
          <button type="button" onClick={() => onChange(serialiseWm(segs.map((c) => (c === "." ? "N" : c)) as WmCode[]))} className={chip(false)}>Set unscored to normal</button>
          {value && <button type="button" onClick={() => onChange("")} className={chip(false)}>Clear</button>}
        </div>
        <p>Choose a state, then tap segments in any view; the bull's-eye and the apical views share the same scores. Tap a segment again to clear it.</p>
        {sum && <p className="text-[13px] text-[var(--c-text)] leading-snug">{sum.text}</p>}
      </div>
    </div>
  );
};
