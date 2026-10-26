import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Grade, bsaMosteller, rapFromIvc, fmt, GRADERS, DERIVED_GRADERS } from "../lib/echo";
import { card, inputCls, GradeBadge, InfoButton, Sheet, CaveatList } from "./ui";

interface In { k: string; label: string; unit: string; options?: string[] }
interface Out { label: string; value?: number; unit: string; dp: number; grade?: Grade | null; note?: string }
interface Calc { id: string; title: string; inputs: In[]; caveats?: string[]; run: (n: Record<string, number | undefined>, s: Record<string, string>) => Out[] }

const area = (d?: number) => (d ? Math.PI * (d / 2) ** 2 : undefined);

const CALCS: Calc[] = [
  { id: "bsa", title: "Body surface area", inputs: [{ k: "h", label: "Height", unit: "cm" }, { k: "w", label: "Weight", unit: "kg" }],
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
  { id: "bern", title: "Pressure gradient (Bernoulli)", inputs: [{ k: "v", label: "Peak velocity", unit: "m/s" }, { k: "v1", label: "Proximal velocity (optional)", unit: "m/s" }],
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
  { id: "qpqs", title: "Shunt ratio (Qp:Qs)",
    inputs: [{ k: "rd", label: "RVOT diameter", unit: "cm" }, { k: "rvti", label: "RVOT VTI", unit: "cm" }, { k: "ld", label: "LVOT diameter", unit: "cm" }, { k: "lvti", label: "LVOT VTI", unit: "cm" }],
    run: ({ rd, rvti, ld, lvti }) => { const qp = area(rd) && rvti ? area(rd)! * rvti : undefined; const qs = area(ld) && lvti ? area(ld)! * lvti : undefined; return [{ label: "Qp:Qs", value: qp && qs ? qp / qs : undefined, unit: "", dp: 2, note: "> 1.5 suggests a significant left-to-right shunt." }]; } },
  { id: "ee", title: "E/e′ and E/A", caveats: ["diast_invalid", "eprime"],
    inputs: [{ k: "e", label: "E", unit: "cm/s" }, { k: "a", label: "A", unit: "cm/s" }, { k: "es", label: "Septal e′", unit: "cm/s" }, { k: "el", label: "Lateral e′", unit: "cm/s" }],
    run: ({ e, a, es, el }) => { const avg = es && el ? (es + el) / 2 : es ?? el; const r = e && avg ? e / avg : undefined; return [{ label: "E/A", value: e && a ? e / a : undefined, unit: "", dp: 1 }, { label: "E/e′ (average)", value: r, unit: "", dp: 1, grade: r ? DERIVED_GRADERS.e_eprime!(r, {}) : null }, { label: "E/septal e′", value: e && es ? e / es : undefined, unit: "", dp: 1, note: "In AF, ≥ 11 supports raised filling pressure." }]; } },
];

export const CalcScreen: React.FC = () => {
  const [open, setOpen] = useState<string | null>("sv");
  const [vals, setVals] = useState<Record<string, Record<string, string>>>({});
  const [tips, setTips] = useState<Calc | null>(null);
  return (
    <div className="space-y-2.5">
      {CALCS.map((c) => {
        const s = vals[c.id] || {};
        const n = Object.fromEntries(c.inputs.map((i) => { const x = Number((s[i.k] || "").replace(",", ".")); return [i.k, s[i.k] && Number.isFinite(x) ? x : undefined]; }));
        const outs = open === c.id ? c.run(n, s) : [];
        return (
          <div key={c.id} className={card}>
            <button type="button" onClick={() => setOpen(open === c.id ? null : c.id)} className="w-full flex items-center justify-between px-4 py-3 text-left">
              <span className="flex items-center gap-2 text-sm font-bold text-[var(--c-text)]">{open === c.id ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}{c.title}</span>
              {c.caveats && <InfoButton label={c.title} onClick={() => setTips(c)} />}
            </button>
            {open === c.id && (
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
                <div className="bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl p-3 space-y-1.5">
                  {outs.map((o) => (
                    <div key={o.label}>
                      <div className="flex items-center justify-between gap-2 text-sm">
                        <span className="text-[var(--c-text2)]">{o.label}</span>
                        <b className="text-[var(--c-text)]">{fmt(o.value, o.dp)}{o.value !== undefined && o.unit ? ` ${o.unit}` : ""}</b>
                      </div>
                      {o.grade && <div className="text-right"><GradeBadge g={o.grade} small /></div>}
                      {o.note && <p className="text-[10.5px] text-[var(--c-muted)]">{o.note}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      {tips && <Sheet title={tips.title} onClose={() => setTips(null)}><CaveatList ids={tips.caveats || []} /></Sheet>}
    </div>
  );
};
