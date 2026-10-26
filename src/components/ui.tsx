import React from "react";
import { Info } from "lucide-react";
import { Grade, Level } from "../lib/echo";
import { CAVEATS } from "../lib/content";

export const card = "bg-[var(--c-surface)] rounded-[24px]";
export const inputCls = "w-full bg-[var(--c-surface2)] text-[var(--c-text)] placeholder-[var(--c-muted)] border-0 border-b-2 border-[var(--c-border2)] focus:border-[var(--c-teal)] rounded-t-xl rounded-b-none px-3.5 py-2.5 text-[15px] outline-none transition-colors [color-scheme:var(--c-scheme)]";
export const labelCls = "block text-[11px] font-semibold text-[var(--c-muted)] mb-1";

export const LEVEL_COLOR: Record<Level, string> = {
  normal: "#2FA37A", borderline: "#B9A13A", mild: "#D9A441", moderate: "#E07B39", severe: "#E05A4F", info: "#7D8E97",
};

export const GradeBadge: React.FC<{ g: Grade | null | undefined; small?: boolean }> = ({ g, small }) =>
  g ? (
    <span className={`inline-flex items-center rounded-lg font-bold leading-tight ${small ? "text-[10.5px] px-2 py-0.5" : "text-[11.5px] px-2.5 py-1"}`}
      style={{ color: LEVEL_COLOR[g.level], background: `color-mix(in srgb, ${LEVEL_COLOR[g.level]} 14%, transparent)` }}>
      {g.text}
    </span>
  ) : null;

export const Sheet: React.FC<{ onClose: () => void; title: React.ReactNode; children: React.ReactNode }> = ({ onClose, title, children }) => (
  <div className="fixed inset-0 z-[60] bg-black/60 flex items-end justify-center" onClick={onClose}>
    <div className="bg-[var(--c-surface)] w-full max-w-md rounded-t-[28px] max-h-[92vh] flex flex-col shadow-2xl animate-fadeIn" onClick={(e) => e.stopPropagation()}>
      <div className="flex flex-col items-center px-4 pt-2.5 pb-2"><span className="w-8 h-1 rounded-full bg-[var(--c-border2)] opacity-60 mb-2" /><div className="w-full flex items-center justify-between">
        <div className="text-[22px] leading-7 text-[var(--c-text)] min-w-0">{title}</div>
        <button type="button" onClick={onClose} aria-label="Close" className="m3-press w-10 h-10 rounded-full text-[var(--c-text2)] text-lg">✕</button>
      </div></div>
      <div className="overflow-y-auto p-4 pb-8 space-y-4">{children}</div>
    </div>
  </div>
);

export const CaveatList: React.FC<{ ids: string[] }> = ({ ids }) => (
  <div className="space-y-4">
    {ids.map((id) => CAVEATS[id] && (
      <div key={id}>
        <h3 className="text-sm font-bold text-[var(--c-text)] mb-1.5">{CAVEATS[id].title}</h3>
        <ul className="space-y-1.5">
          {CAVEATS[id].points.map((p, i) => <li key={i} className="text-[13px] leading-snug text-[var(--c-text2)] pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-[var(--c-teal)]">{p}</li>)}
        </ul>
      </div>
    ))}
  </div>
);

export const InfoButton: React.FC<{ onClick: () => void; label: string }> = ({ onClick, label }) => (
  <button type="button" aria-label={`Tips: ${label}`} onClick={onClick} className="p-1 -m-1 text-[var(--c-teal)] shrink-0"><Info className="w-4 h-4" /></button>
);

export const Bullets: React.FC<{ items: string[]; color?: string }> = ({ items, color = "var(--c-teal)" }) => (
  <ul className="space-y-1.5">
    {items.map((p, i) => (
      <li key={i} className="text-[13px] leading-snug text-[var(--c-text2)] pl-3.5 relative">
        <span className="absolute left-0 top-[7px] w-1.5 h-1.5 rounded-full" style={{ background: color }} />{p}
      </li>
    ))}
  </ul>
);

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-[14px] font-bold text-[var(--c-teal)] tracking-[0.01em]">{children}</h2>
);
