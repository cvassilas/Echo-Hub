import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FileText, Copy, Share2, Save, FilePlus2, FolderOpen, Check, Trash2, FileDown } from "lucide-react";
import { Share } from "@capacitor/share";
import { Capacitor } from "@capacitor/core";
import { FIELDS, SECTIONS, VIEW_SECTIONS, FIELD_VIEW, ViewId, SectionId, FieldDef, Derived, derive, gradeField, buildReport, phProbability, diastology, DERIVED_LABELS, DERIVED_GRADERS, fmt, num } from "../lib/echo";
import { useData, updateSettings, setValue, setDraft, newDraft, saveDraftAsReport, openReport, deleteReport } from "../lib/store";
import { card, inputCls, GradeBadge, Sheet, CaveatList, InfoButton, LEVEL_COLOR } from "./ui";
import { saveFile } from "../lib/saveFile";

const DERIVED_BY_SECTION: Partial<Record<SectionId, (keyof Derived)[]>> = {
  context: ["bsa"],
  lv: ["ef_calc", "edvi", "esvi", "fs", "rwt", "lv_mass", "lvmi", "sv", "svi", "co", "ci"],
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
  a4c: ["ef_calc", "edvi", "esvi", "e_a", "e_eprime", "lavi", "rvsp", "mpap", "mva_pht"],
  rvf: ["fac", "tapse_spap"],
  a5c: ["sv", "svi", "co", "ci", "av_peakpg", "ava", "avai", "dvi"],
  ivcv: ["rap"],
};

interface Sec { id: string; title: string; fields: FieldDef[]; derived: (keyof Derived)[]; ph: boolean; diast: boolean }

export const ReportScreen: React.FC = () => {
  const { draft, reports, settings } = useData();
  const v = useMemo(() => ({ ...draft.values, __std: settings.standard || "BSE" }), [draft.values, settings.standard]);
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

      {secs.map((s) => {
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
            <button type="button" onClick={() => setOpen({ ...open, [s.id]: !isOpen })} className="w-full flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-2 text-[16px] font-bold text-[var(--c-text)]">{isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}{s.title}</span>
              <span className="flex items-center gap-1.5 text-[10.5px] text-[var(--c-muted)]">
                {abn > 0 && <span className="w-2 h-2 rounded-full" style={{ background: LEVEL_COLOR.moderate }} />}
                {count > 0 && `${count} entered`}
              </span>
            </button>
            {isOpen && (
              <div className="px-4 pb-4 space-y-2.5">
                <div className="grid grid-cols-2 gap-x-2 gap-y-2.5">
                  {shown.map((f) => <div key={f.key} className={wide(f) ? "col-span-2" : ""}><FieldRow f={f} value={v[f.key] || ""} grade={gradeField(f.key, v, d)} onTips={() => setTips(f)} /></div>)}
                </div>
                {adv.length > 0 && (
                  <button type="button" onClick={() => setMore({ ...more, [s.id]: !more[s.id] })} className="text-[11px] font-bold text-[var(--c-teal)]">
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
                {s.diast && (num(v, "e") !== undefined || num(v, "e_sept") !== undefined || ds.graded) && (
                  <div className="rounded-2xl p-3 text-xs bg-[var(--c-surface2)]">
                    <b className="text-[var(--c-text)]">{ds.conclusion}</b>
                    {ds.detail && <p className="text-[11px] text-[var(--c-text2)] mt-0.5">{ds.detail}</p>}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button type="button" disabled={!filled} onClick={() => setShowReport(true)} className="w-full py-3.5 rounded-2xl bg-[var(--c-primary-container)] text-[var(--c-on-primary-container)] shadow-lg m3-press font-bold flex items-center justify-center gap-2 disabled:opacity-40">
        <FileText className="w-5 h-5" /> Generate report
      </button>
      <p className="text-[10.5px] text-[var(--c-muted)] text-center px-4">Grading follows BSE/ASE/EACVI/ESC thresholds. Always apply clinical judgement and check against the current guidelines.</p>

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

const wide = (f: FieldDef) => f.kind === "text" || (f.kind === "select" && (f.options || []).some((o) => o.length > 14)) || f.label.length > 24;

const FieldRow: React.FC<{ f: FieldDef; value: string; grade: ReturnType<typeof gradeField>; onTips: () => void }> = ({ f, value, grade, onTips }) => (
  <div>
    <div className="flex items-center justify-between gap-2 mb-1">
      <label className="text-[11.5px] font-semibold text-[var(--c-muted)] leading-tight">{f.label}{f.unit ? <span className="font-normal"> ({f.unit})</span> : null}</label>
      {f.caveats?.length ? <InfoButton label={f.label} onClick={onTips} /> : null}
    </div>
    {f.kind === "select" ? (
      <select aria-label={f.label} value={value} onChange={(e) => setValue(f.key, e.target.value)} className={inputCls}>
        {f.options!.map((o) => <option key={o} value={o}>{o || "–"}</option>)}
      </select>
    ) : (
      <input aria-label={f.label} value={value} onChange={(e) => setValue(f.key, e.target.value)} placeholder={f.placeholder || ""}
        inputMode={f.kind === "num" ? "decimal" : "text"} className={inputCls} />
    )}
    {grade && <div className="mt-1"><GradeBadge g={grade} /></div>}
  </div>
);

const ReportView: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { draft, settings } = useData();
  const generated = useMemo(() => buildReport({ ...draft.values, __std: settings.standard || "BSE" }).text, [draft.values, settings.standard]);
  const text = draft.text ?? generated;
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
      <p className="text-[10.5px] text-[var(--c-muted)]">You can edit the text before copying. Add patient identifiers only in the clinical record, not here.</p>
    </Sheet>
  );
};
