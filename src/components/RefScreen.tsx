import React, { useState } from "react";
import { Search } from "lucide-react";
import { REFS, FORMULAE } from "../lib/content";
import { card, inputCls, SectionTitle } from "./ui";

export const RefScreen: React.FC = () => {
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();
  const tables = REFS.filter((t) => !ql || [t.title, t.note || "", ...t.rows.flat(), ...t.head].join(" ").toLowerCase().includes(ql));
  const formulae = FORMULAE.filter((f) => !ql || [f.name, f.formula, f.note || ""].join(" ").toLowerCase().includes(ql));
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-muted)]" />
        <input aria-label="Search reference values" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search, e.g. LAVI, AS, TAPSE" className={`${inputCls} pl-9`} />
      </div>
      {tables.map((t) => (
        <div key={t.title} className={`${card} p-3 space-y-2`}>
          <div>
            <SectionTitle>{t.title}</SectionTitle>
            <p className="text-[10.5px] text-[var(--c-muted)] mt-0.5">{t.source}</p>
          </div>
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-[12px] border-collapse">
              <thead><tr>{t.head.map((h, i) => <th key={i} className="text-left font-bold text-[var(--c-muted)] px-1.5 py-1 border-b border-[var(--c-border)]">{h}</th>)}</tr></thead>
              <tbody>
                {t.rows.map((r, i) => (
                  <tr key={i} className="border-b border-[var(--c-border)]/50 last:border-0">
                    {r.map((c, j) => <td key={j} className={`px-1.5 py-1.5 align-top ${j === 0 ? "font-semibold text-[var(--c-text)]" : "text-[var(--c-text2)]"}`}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {t.note && <p className="text-[11px] leading-snug text-[var(--c-muted)]">{t.note}</p>}
        </div>
      ))}
      {formulae.length > 0 && (
        <div className={`${card} p-3 space-y-2`}>
          <SectionTitle>Formulae</SectionTitle>
          {formulae.map((f) => (
            <div key={f.name} className="border-b border-[var(--c-border)]/50 last:border-0 pb-1.5">
              <p className="text-[12px] font-semibold text-[var(--c-text)]">{f.name}</p>
              <p className="text-[12.5px] font-mono text-[var(--c-teal)]">{f.formula}</p>
              {f.note && <p className="text-[10.5px] text-[var(--c-muted)]">{f.note}</p>}
            </div>
          ))}
        </div>
      )}
      <p className="text-[10.5px] text-[var(--c-muted)] text-center px-4">Values restated from the cited guidelines for quick reference. Check the source documents for full criteria and updates.</p>
    </div>
  );
};
