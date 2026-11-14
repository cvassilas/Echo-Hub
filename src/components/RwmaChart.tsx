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

export const RwmaChart: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => {
  const [brush, setBrush] = useState<WmCode>("H");
  const segs = parseWm(value);
  const sum = summariseWm(value);
  const tap = (i: number) => { const next = [...segs]; next[i] = next[i] === brush ? "." : brush; onChange(serialiseWm(next)); };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {WM_STATES.map((s) => (
          <button key={s.code} type="button" onClick={() => setBrush(s.code)} aria-pressed={brush === s.code}
            className={`m3-press px-2.5 py-1.5 rounded-full text-[11.5px] font-bold border flex items-center gap-1.5 ${brush === s.code ? "border-transparent bg-[var(--c-tonal)] text-[var(--c-on-tonal)]" : "border-[var(--c-border2)] text-[var(--c-text2)]"}`}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />{s.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col md:flex-row md:items-start gap-3">
        <svg viewBox="0 0 280 250" className="w-full max-w-[340px] mx-auto md:mx-0 touch-manipulation" role="group" aria-label="17-segment wall motion chart">
          {GEOM.map(([d, lx, ly], i) => {
            const st = wmState(segs[i]);
            return (
              <g key={i} onClick={() => tap(i)} style={{ cursor: "pointer" }} role="button" aria-label={`${SEGMENTS[i]}: ${st?.label || "not scored"}`}>
                <path d={d} fill={st ? st.color : "var(--c-surface2)"} fillOpacity={st ? 0.85 : 1} stroke="var(--c-bg, #0b0f11)" strokeWidth={2} />
                <text x={lx} y={ly + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill={st ? "#0b0f11" : "var(--c-muted)"} pointerEvents="none">{st && st.code !== "N" ? st.short : i + 1}</text>
              </g>
            );
          })}
          <text x={CX} y={11} textAnchor="middle" fontSize={9} fill="var(--c-muted)">Anterior</text>
          <text x={CX} y={246} textAnchor="middle" fontSize={9} fill="var(--c-muted)">Inferior</text>
          <text x={4} y={CY + 3} fontSize={9} fill="var(--c-muted)">Septal</text>
          <text x={276} y={CY + 3} textAnchor="end" fontSize={9} fill="var(--c-muted)">Lateral</text>
        </svg>
        <div className="flex-1 space-y-2 text-[12px] text-[var(--c-text2)]">
          <div className="flex gap-2 flex-wrap">
            <button type="button" onClick={() => onChange(serialiseWm(segs.map((c) => (c === "." ? "N" : c)) as WmCode[]))} className="m3-press px-3 py-1.5 rounded-full border border-[var(--c-border2)] text-[11.5px] font-bold text-[var(--c-teal)]">Set unscored to normal</button>
            {value && <button type="button" onClick={() => onChange("")} className="m3-press px-3 py-1.5 rounded-full border border-[var(--c-border2)] text-[11.5px] font-bold text-[var(--c-text2)]">Clear</button>}
          </div>
          <p>Choose a state, then tap segments. Tap a segment again to clear it. Rings from outside in: basal (1–6), mid (7–12), apical (13–16), apex (17).</p>
          {sum && <p className="text-[12.5px] text-[var(--c-text)] leading-snug">{sum.text}</p>}
        </div>
      </div>
    </div>
  );
};
