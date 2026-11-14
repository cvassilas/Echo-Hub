import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileText, Copy, Share2, Save, FilePlus2, FolderOpen, Check, Trash2, FileDown, BookPlus } from "lucide-react";
import { toLogEntry, sendToClinicalLogs } from "../lib/clinicalLogs";
import { RwmaChart } from "./RwmaChart";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { FIELDS, SECTIONS, VIEW_SECTIONS, FIELD_VIEW, ViewId, SectionId, FieldDef, Derived, derive, gradeField, buildReport, phProbability, diastology, DERIVED_LABELS, DERIVED_GRADERS, fmt, num, vexusApplies, vexus, hvLevel, pvLevel, irvLevel, portalPF } from "../lib/echo";
import { useData, updateSettings, setValue, setDraft, newDraft, saveDraftAsReport, openReport, deleteReport } from "../lib/store";
import { card, inputCls, GradeBadge, Sheet, CaveatList, InfoButton, LEVEL_COLOR } from "./ui";
import { saveFile } from "../lib/saveFile";

const DERIVED_BY_SECTION: Partial<Record<SectionId, (keyof Derived)[]>> = {
  context: ["bsa"],
  lv: ["ef_4c", "ef_2c", "edv_bp", "esv_bp", "ef_calc", "edvi", "esvi", "fs", "rwt", "lv_mass", "lvmi", "sv", "svi", "co", "ci"],
  rv: ["fac", "tapse_spap"],
  atria: ["lavi"],
  av: ["av_peakpg", "ava", "avai", "dvi"],
  mv: ["e_a", "e_eprime", "mva_pht"],
  tv: ["rvsp", "mpap"],
  ivc: ["rap"],
};

const DERIVED_BY_VIEW: Partial<Record<ViewId, (keyof Derived)[]>> = {
  context: ["bsa"],
  plax: ["fs", "rwt", "lv_mass", "lvmi"],
  a4c: ["ef_4c", "ef_2c", "edv_bp", "esv_bp", "ef_calc", "edvi", "esvi", "e_a", "e_eprime", "lavi", "rvsp", "mpap", "mva_pht"],
  rvf: ["fac", "tapse_spap"],
  a5c: ["sv", "svi", "co", "ci", "av_peakpg", "ava", "avai", "dvi"],
  ivcv: ["rap"],
};

interface Sec { id: string; title: string; fields: FieldDef[]; derived: (keyof Derived)[]; ph: boolean; diast: boolean }

export const ReportScreen: React.FC = () => {
  const { draft, reports, settings } = useData();
  const v: Record<string, string> = useMemo(() => ({ ...draft.values, __std: settings.standard || "BSE" }), [draft.values, settings.standard]);
  const d = useMemo(() => derive(v), [v]);
  const byView = (settings.order || "view") === "view";
  const secs: Sec[] = byView
    ? VIEW_SECTIONS.map((s) => ({ id: s.id, title: s.title, fields: FIELDS.filter((f) => FIELD_VIEW[f.key] === s.id), derived: DERIVED_BY_VIEW[s.id] || [], ph: s.id === "ivcv", diast: s.id === "a4c" }))
    : SECTIONS.map((s) => ({ id: s.id, title: s.title, fields: FIELDS.filter((f) => f.section === s.id), derived: DERIVED_BY_SECTION[s.id as SectionId] || [], ph: s.id === "tv", diast: s.id === "mv" }));
  const [open, setOpen] = useState<Record<string, boolean>>({ context: true, lv: true, plax: true });
  const [more, setMore] = useState<Record<string, boolean>>({});
  const [tips, setTips] = useState<FieldDef | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);
  const filled = Object.values(v).filter((x) => String(x || "").trim()).length;
  const ph = phProbability(v, d);
  const ds = diastology(v, d);

  return (
    <div className="space-y-3 lg:space-y-0 lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-4 lg:items-start">
    <div className="space-y-3">
      <div className={`${card} p-3 space-y-2`}>
        <div className="flex gap-2">
          <input aria-label="Study label" value={draft.label} onChange={(e) => setDraft({ label: e.target.value })} placeholder="Label, e.g. ICU bed 4 (no names)" className={inputCls} />
          <button type="button" aria-label="Saved reports" onClick={() => setShowSaved(true)} className="px-3 rounded-full border border-[var(--c-border2)] text-[var(--c-teal)] m3-press flex items-center gap-1 text-xs font-bold"><FolderOpen className="w-4 h-4" />{reports.length}</button>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => { saveDraftAsReport(); setSavedMsg(true); setTimeout(() => setSavedMsg(false), 1500); }} disabled={!filled} className="flex-1 py-2 rounded-full border border-[var(--c-border2)] text-[var(--c-teal)] m3-press text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40">
            {savedMsg ? <><Check className="w-4 h-4" /> Saved</> : <><Save className="w-4 h-4" /> Save</>}
          </button>
          <button type="button" onClick={() => { if (!filled || confirm("Start a new study? Unsaved entries will be cleared.")) newDraft(); }} className="flex-1 py-2 rounded-full border border-[var(--c-border2)] text-[var(--c-teal)] m3-press text-xs font-bold flex items-center justify-center gap-1.5"><FilePlus2 className="w-4 h-4" /> New</button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex flex-1 rounded-full border border-[var(--c-border2)] overflow-hidden">
          {([["view", "In scan order"], ["structure", "By structure"]] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => updateSettings({ order: k })}
              className={`m3-press flex-1 py-2 text-[12.5px] font-bold ${(settings.order || "view") === k ? "bg-[var(--c-tonal)] text-[var(--c-on-tonal)]" : "text-[var(--c-text2)]"}`}>{(settings.order || "view") === k ? "✓ " : ""}{l}</button>
          ))}
        </div>
        <button type="button" onClick={() => updateSettings({ standard: settings.standard === "ASE" ? "BSE" : "ASE" })} className="m3-press px-3 py-2 rounded-full border border-[var(--c-border2)] text-[12px] font-bold text-[var(--c-teal)]" title="Reference standard">{settings.standard === "ASE" ? "ASE 2015" : "BSE 2020"}</button>
      </div>

      {secs.filter((s) => s.id !== "vexus" || vexusApplies(v)).map((s) => {
        const fields = s.fields;
        let basic = fields.filter((f) => !f.advanced), adv = fields.filter((f) => f.advanced);
        if (!basic.length) { basic = adv; adv = []; }
        const shown = more[s.id] ? fields : basic;
        const count = fields.filter((f) => String(v[f.key] || "").trim()).length;
        const abn = fields.map((f) => gradeField(f.key, v, d)).filter((g) => g && !["normal", "info"].includes(g.level)).length;
        const isOpen = !!open[s.id];
        const derived = s.derived.filter((k) => d[k] !== undefined);
        return (
          <div key={s.id} className={card}>
            <button type="button" id={`sec-${s.id}`} onClick={() => setOpen({ ...open, [s.id]: !isOpen })} className="w-full flex items-center justify-between px-4 py-4 scroll-mt-3">
              <span className="flex items-center gap-2 text-[17px] font-bold text-[var(--c-text)]">{isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}{s.title}</span>
              <span className="flex items-center gap-1.5 text-[10.5px] text-[var(--c-muted)]">
                {abn > 0 && <span className="w-2 h-2 rounded-full" style={{ background: LEVEL_COLOR.moderate }} />}
                {count > 0 && `${count}/${fields.length}`}
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-2.5">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-4">
                  {shown.map((f) => <div key={f.key} className={wide(f) ? "col-span-2" : ""}><FieldRow f={f} value={v[f.key] || ""} grade={gradeField(f.key, v, d)} onTips={() => setTips(f)} /></div>)}
                </div>
                {(() => {
                  const fillable = shown.filter((f) => !String(v[f.key] || "").trim() && (normalOption(f) || f.kind === "segments"));
                  return fillable.length > 0 ? (
                    <button type="button" onClick={() => fillable.forEach((f) => setValue(f.key, f.kind === "segments" ? "N".repeat(17) : normalOption(f)!))}
                      className="m3-press w-full min-h-[46px] rounded-full border border-[var(--c-border2)] text-[14px] font-bold text-[var(--c-teal)]">
                      Mark the rest normal ({fillable.length})
                    </button>
                  ) : null;
                })()}
                {adv.length > 0 && (
                  <button type="button" onClick={() => setMore({ ...more, [s.id]: !more[s.id] })} className="text-[13px] font-bold text-[var(--c-teal)] py-1">
                    {more[s.id] ? "Fewer measurements" : `More measurements (${adv.length})`}
                  </button>
                )}
                {derived.length > 0 && (
                  <div className="bg-[var(--c-surface2)] rounded-2xl p-2.5 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--c-muted)]">Calculated</p>
                    {derived.map((k) => {
                      const [label, u, dp] = DERIVED_LABELS[k]!;
                      const gr = DERIVED_GRADERS[k]?.(d[k]!, v);
                      return (
                        <div key={k} className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-[var(--c-text2)]">{label}</span>
                          <span className="flex items-center gap-1.5 text-right"><b className="text-[var(--c-text)]">{fmt(d[k], dp)}{u ? ` ${u}` : ""}</b>{gr && <GradeBadge g={gr} small />}</span>
                        </div>
                      );
                    })}
                    {s.derived.includes("rvsp") && d.rvsp && d.rap === undefined && <p className="text-[10px] text-[var(--c-muted)]">RAP of 8 mmHg assumed (enter IVC to estimate).</p>}
                  </div>
                )}
                {s.ph && ph.probability !== "Not assessable" && (
                  <div className="rounded-2xl p-3 text-xs" style={{ background: `color-mix(in srgb, ${LEVEL_COLOR[ph.probability === "High" ? "severe" : ph.probability === "Intermediate" ? "moderate" : "normal"]} 12%, transparent)` }}>
                    <b className="text-[var(--c-text)]">PH probability: {ph.probability}</b>
                    <p className="text-[11px] text-[var(--c-text2)] mt-0.5">{ph.reason}</p>
                  </div>
                )}
                {(s.id === "ivc" || s.id === "ivcv") && num(v, "ivc_d") !== undefined && (
                  <p className="text-[11px] text-[var(--c-muted)] px-1">{vexusApplies(v) ? "IVC ≥ 2 cm: complete the VExUS section to grade venous congestion." : "IVC < 2 cm: VExUS grade 0, so the VExUS section isn't needed."}</p>
                )}
                {s.id === "vexus" && (v.hv_pattern || portalPF(v) !== undefined || v.irv_pattern) && (() => {
                  const vx = vexus(num(v, "ivc_d"), hvLevel(v.hv_pattern), pvLevel(portalPF(v)), irvLevel(v.irv_pattern));
                  const lvl = vx.grade === undefined ? "info" : (["normal", "mild", "moderate", "severe"] as const)[vx.grade];
                  return (
                    <div className="rounded-2xl p-3 text-xs" style={{ background: `color-mix(in srgb, ${LEVEL_COLOR[lvl]} 14%, transparent)` }}>
                      <b className="text-[var(--c-text)]">{vx.text}</b>
                      {portalPF(v) !== undefined && num(v, "pv_pf") === undefined && <p className="text-[11px] text-[var(--c-text2)] mt-0.5">Portal pulsatility {fmt(portalPF(v), 0)}% from Vmax/Vmin.</p>}
                    </div>
                  );
                })()}
                {s.diast && (num(v, "e") !== undefined || num(v, "e_sept") !== undefined || ds.graded) && (
                  <div className="rounded-2xl p-3 text-xs bg-[var(--c-surface2)]">
                    <b className="text-[var(--c-text)]">{ds.conclusion}</b>
                    {ds.detail && <p className="text-[11px] text-[var(--c-text2)] mt-0.5">{ds.detail}</p>}
                  </div>
                )}
                {(() => {
                  const vis = secs.filter((x) => x.id !== "vexus" || vexusApplies(v));
                  const nx = vis[vis.findIndex((x) => x.id === s.id) + 1];
                  return nx ? (
                    <button type="button" onClick={() => { setOpen({ ...open, [s.id]: false, [nx.id]: true }); requestAnimationFrame(() => requestAnimationFrame(() => document.getElementById(`sec-${nx.id}`)?.scrollIntoView({ block: "start", behavior: "smooth" }))); }}
                      className="m3-press w-full min-h-[48px] rounded-full bg-[var(--c-tonal)] text-[var(--c-on-tonal)] text-[14.5px] font-bold flex items-center justify-center gap-1.5">
                      Next: {nx.title} <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button type="button" onClick={() => setShowReport(true)} className="m3-press w-full min-h-[48px] rounded-full bg-[var(--c-tonal)] text-[var(--c-on-tonal)] text-[14.5px] font-bold flex items-center justify-center gap-1.5">
                      <FileText className="w-4 h-4" /> Generate report
                    </button>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}

      <button type="button" disabled={!filled} onClick={() => setShowReport(true)} className="w-full py-3.5 rounded-2xl bg-[var(--c-primary-container)] text-[var(--c-on-primary-container)] shadow-lg m3-press font-bold flex items-center justify-center gap-2 disabled:opacity-40">
        <FileText className="w-5 h-5" /> Generate report
      </button>
      <p className="text-[10.5px] text-[var(--c-muted)] text-center px-4">Grading follows BSE/ASE/EACVI/ESC thresholds. Always apply clinical judgement and check against the current guidelines.</p>
    </div>
    <LivePreview v={v} onOpen={() => setShowReport(true)} />

      {tips && (
        <Sheet title={tips.label} onClose={() => setTips(null)}>
          <CaveatList ids={tips.caveats || []} />
        </Sheet>
      )}
      {showReport && <ReportView onClose={() => setShowReport(false)} />}
      {showSaved && (
        <Sheet title="Saved reports" onClose={() => setShowSaved(false)}>
          {reports.length === 0 && <p className="text-xs text-[var(--c-muted)]">Nothing saved yet. Reports stay on this phone.</p>}
          {reports.map((r) => (
            <div key={r.id} className="flex items-center gap-2 bg-[var(--c-surface2)] rounded-2xl px-3 py-2.5">
              <button type="button" className="flex-1 text-left min-w-0" onClick={() => { openReport(r.id); setShowSaved(false); }}>
                <span className="block text-sm font-bold text-[var(--c-text)] truncate">{r.label}</span>
                <span className="block text-[10.5px] text-[var(--c-muted)]">{new Date(r.updated).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </button>
              <button type="button" aria-label={`Delete ${r.label}`} onClick={() => confirm(`Delete "${r.label}"?`) && deleteReport(r.id)} className="p-2 text-[var(--c-muted)]"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </Sheet>
      )}
    </div>
  );
};

/** Tablet (landscape): the report builds live beside the form. */
const LivePreview: React.FC<{ v: Record<string, string>; onOpen: () => void }> = ({ v, onOpen }) => {
  const rep = useMemo(() => buildReport(v), [v]);
  return (
    <aside className={`${card} hidden lg:flex flex-col sticky top-4 max-h-[calc(100vh-2rem)] p-3 gap-2`}>
      <div className="flex items-center justify-between">
        <h2 className="text-[14px] font-bold text-[var(--c-teal)]">Live report</h2>
        <button type="button" onClick={onOpen} className="m3-press px-3 py-1.5 rounded-full bg-[var(--c-tonal)] text-[var(--c-on-tonal)] text-xs font-bold flex items-center gap-1"><FileText className="w-4 h-4" /> Open</button>
      </div>
      {rep.findings.length > 0 && (
        <ul className="space-y-1">
          {rep.findings.map((f) => <li key={f} className="text-[12px] leading-snug text-[var(--c-text)] pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-[var(--c-teal)]">{f}</li>)}
        </ul>
      )}
      <pre className="flex-1 overflow-y-auto whitespace-pre-wrap bg-[var(--c-surface2)] rounded-2xl p-3 text-[11.5px] leading-relaxed text-[var(--c-text2)] font-mono">{rep.text}</pre>
    </aside>
  );
};

const wide = (f: FieldDef) => f.kind === "text" || f.kind === "longtext" || f.kind === "segments" || (useChips(f) && chipsWide(f)) || (f.kind === "select" && (f.options || []).some((o) => o.length > 14)) || f.label.length > 24;

/** Larger entry controls for the report form. */
const entryCls = inputCls.replace("py-2.5 text-[15px]", "py-3.5 text-[17px] min-h-[54px]");

/** Short option lists show as tap chips instead of a dropdown. */
const useChips = (f: FieldDef) => f.kind === "select" && (f.options || []).filter(Boolean).length <= 6;
const chipsWide = (f: FieldDef) => (f.options || []).filter(Boolean).join("").length > 26;

/** Value probably entered in the wrong unit → suggested corrected value. */
const MM_KEYS = new Set(["tapse", "mapse", "rv_basal", "rv_mid", "lvot_d_mm"]);
function unitHint(f: FieldDef, raw: string): { to: string; why: string } | null {
  const n = Number(raw.replace(",", "."));
  if (f.kind !== "num" || !raw.trim() || !Number.isFinite(n) || n <= 0) return null;
  const r = (x: number) => String(Math.round(x * 100) / 100);
  if (f.unit === "cm" && n > 15) return { to: r(n / 10), why: `Looks like mm: use ${r(n / 10)} cm?` };
  if (f.unit === "mm" && MM_KEYS.has(f.key) && n < 4) return { to: r(n * 10), why: `Looks like cm: use ${r(n * 10)} mm?` };
  if (f.unit === "m/s" && n > 8) return { to: r(n / 100), why: `Looks like cm/s: use ${r(n / 100)} m/s?` };
  if (f.unit === "cm/s" && n < 2.5) return { to: r(n * 100), why: `Looks like m/s: use ${r(n * 100)} cm/s?` };
  return null;
}

/** Enter / Next on the keyboard moves to the next box in the form. */
const nextField = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const all = Array.from(document.querySelectorAll<HTMLElement>("[data-entry]")).filter((el) => el.offsetParent !== null);
  const i = all.indexOf(e.currentTarget);
  const nxt = all[i + 1];
  if (nxt) { nxt.focus(); nxt.scrollIntoView({ block: "center", behavior: "smooth" }); } else (e.currentTarget as HTMLElement).blur();
};

const FieldRow: React.FC<{ f: FieldDef; value: string; grade: ReturnType<typeof gradeField>; onTips: () => void }> = ({ f, value, grade, onTips }) => {
  const hint = unitHint(f, value);
  return (
    <div>
      <div className="flex items-center justify-between gap-2 mb-1.5 min-h-[24px]">
        <label className="text-[13.5px] font-semibold text-[var(--c-text2)] leading-tight">{f.label}{f.unit ? <span className="font-normal text-[var(--c-muted)]"> ({f.unit})</span> : null}</label>
        {f.caveats?.length ? <InfoButton label={f.label} onClick={onTips} /> : null}
      </div>
      {f.kind === "segments" ? (
        <RwmaChart value={value} onChange={(x) => setValue(f.key, x)} />
      ) : f.kind === "longtext" ? (
        <textarea data-entry aria-label={f.label} value={value} onChange={(e) => setValue(f.key, e.target.value)} placeholder={f.placeholder || ""} rows={4}
          className={`${entryCls} min-h-[110px] leading-snug resize-y`} />
      ) : useChips(f) ? (
        <div role="radiogroup" aria-label={f.label} className="flex flex-wrap gap-2">
          {f.options!.filter(Boolean).map((o) => {
            const on = value === o;
            return (
              <button key={o} type="button" role="radio" aria-checked={on} onClick={() => setValue(f.key, on ? "" : o)}
                className={`m3-press min-h-[44px] px-3.5 py-2 rounded-xl text-[14.5px] font-semibold border text-left leading-tight ${on ? "border-transparent bg-[var(--c-tonal)] text-[var(--c-on-tonal)]" : "border-[var(--c-border2)] text-[var(--c-text2)]"}`}>
                {on ? "✓ " : ""}{o}
              </button>
            );
          })}
        </div>
      ) : f.kind === "select" ? (
        <select data-entry aria-label={f.label} value={value} onChange={(e) => setValue(f.key, e.target.value)} className={entryCls}>
          {f.options!.map((o) => <option key={o} value={o}>{o || "–"}</option>)}
        </select>
      ) : (
        <input data-entry aria-label={f.label} value={value} onChange={(e) => setValue(f.key, e.target.value)} onKeyDown={nextField} placeholder={f.placeholder || ""}
          inputMode={f.kind === "num" ? "decimal" : "text"} enterKeyHint="next" className={entryCls} />
      )}
      {hint && (
        <button type="button" onClick={() => setValue(f.key, hint.to)} className="mt-1.5 text-[12.5px] font-bold text-[var(--c-teal)] underline underline-offset-2">{hint.why}</button>
      )}
      {grade && <div className="mt-1.5"><GradeBadge g={grade} /></div>}
    </div>
  );
};

/** For "Mark rest normal": the normal answer for a select field, if it has one. */
const NORMAL_RE = /^(Normal|None|No\b|No reversal|Present bilaterally|Not seen|Trileaflet, thin)/;
const normalOption = (f: FieldDef) => (f.kind === "select" && f.section !== "context" ? (f.options || []).find((o) => NORMAL_RE.test(o)) : undefined);

const ReportView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { draft, settings } = useData();
  const rep = useMemo(() => buildReport({ ...draft.values, __std: settings.standard || "BSE" }), [draft.values, settings.standard]);
  const generated = rep.text;
  const text = draft.text ?? generated;
  const [logMsg, setLogMsg] = useState<string | null>(null);
  const toLog = async () => {
    setLogMsg(null);
    try { await sendToClinicalLogs(toLogEntry(draft.values, text, rep.findings)); }
    catch (e: any) { setLogMsg(e?.message || "Couldn't open Clinical Logs"); }
  };
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* */ } };
  const share = async () => {
    try {
      if (Capacitor.isNativePlatform()) await Share.share({ title: "Echo report", text, dialogTitle: "Share report" });
      else if (navigator.share) await navigator.share({ title: "Echo report", text });
      else await copy();
    } catch { /* cancelled */ }
  };
  const pdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    doc.setFont("helvetica", "normal");
    const lines = text.split("\n");
    let y = 18;
    for (const raw of lines) {
      const heading = /^[A-Z][A-Z \-—0-9]+$/.test(raw.trim()) || raw.startsWith("TRANSTHORACIC");
      doc.setFont("helvetica", heading ? "bold" : "normal");
      doc.setFontSize(heading ? 11 : 10);
      const wrapped = doc.splitTextToSize(raw || " ", 180);
      for (const w of wrapped) { if (y > 280) { doc.addPage(); y = 18; } doc.text(w, 15, y); y += heading ? 6 : 5; }
      if (heading) y += 0.5;
    }
    doc.setFontSize(8); doc.setTextColor(120);
    doc.text("Generated with Echo Hub. Check values against the current BSE/ASE guidelines.", 15, 290);
    await saveFile(doc.output("blob"), `Echo report ${new Date().toISOString().slice(0, 10)}${draft.label ? ` ${draft.label.replace(/[^\w ]+/g, "")}` : ""}.pdf`);
  };
  return (
    <Sheet title="Report" onClose={onClose}>
      <textarea aria-label="Report text" value={text} onChange={(e) => setDraft({ text: e.target.value })} rows={22}
        className="w-full bg-[var(--c-surface2)] text-[var(--c-text)] rounded-2xl p-3 text-[12.5px] leading-relaxed font-mono outline-none focus:border-[var(--c-teal)]" />
      {draft.text !== undefined && <button type="button" onClick={() => setDraft({ text: undefined })} className="text-[11px] font-bold text-[var(--c-teal)]">Discard my edits and regenerate</button>}
      <div className="grid grid-cols-3 gap-2">
        <button type="button" onClick={copy} className="py-2.5 rounded-full border border-[var(--c-border2)] text-[var(--c-teal)] m3-press text-xs font-bold flex items-center justify-center gap-1.5">{copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}</button>
        <button type="button" onClick={share} className="py-2.5 rounded-full border border-[var(--c-border2)] text-[var(--c-teal)] m3-press text-xs font-bold flex items-center justify-center gap-1.5"><Share2 className="w-4 h-4" /> Share</button>
        <button type="button" onClick={() => pdf().catch((e) => alert(e?.message || "Couldn't make the PDF"))} className="py-2.5 rounded-full bg-[var(--c-teal)] text-[var(--c-on-primary)] m3-press text-xs font-bold flex items-center justify-center gap-1.5"><FileDown className="w-4 h-4" /> PDF</button>
      </div>
      <button type="button" onClick={toLog} className="w-full py-2.5 rounded-full bg-[var(--c-tonal)] text-[var(--c-on-tonal)] m3-press text-xs font-bold flex items-center justify-center gap-1.5"><BookPlus className="w-4 h-4" /> Add to Clinical Logs</button>
      {logMsg && <p className="text-[11px] text-red-400">{logMsg}</p>}
      <p className="text-[10.5px] text-[var(--c-muted)]">You can edit the text before copying. Add patient identifiers only in the clinical record, not here.</p>
    </Sheet>
  );
};
