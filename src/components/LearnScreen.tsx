import React, { useState } from "react";
import { ChevronRight, ArrowLeft, Search } from "lucide-react";
import { VIEWS, CAVEATS, ViewGuide } from "../lib/content";
import { Diagram, DIAGRAMS } from "./Diagrams";
import { card, inputCls, Bullets, SectionTitle, CaveatList } from "./ui";

const CONCEPTS = ["windows", "doppler", "inflow", "pisa"];

export const LearnScreen: React.FC = () => {
  const [view, setView] = useState<ViewGuide | null>(null);
  const [caveat, setCaveat] = useState<string | null>(null);
  const [concept, setConcept] = useState<string | null>(null);
  const [q, setQ] = useState("");

  if (view) return <ViewPage v={view} onBack={() => setView(null)} />;
  if (caveat) return (
    <div className="space-y-3">
      <BackBar onBack={() => setCaveat(null)} title="Measurement caveats" />
      <div className={`${card} p-4`}><CaveatList ids={[caveat]} /></div>
    </div>
  );
  if (concept) return (
    <div className="space-y-3">
      <BackBar onBack={() => setConcept(null)} title={DIAGRAMS[concept].title} />
      <div className={`${card} p-3`}><Diagram id={concept} /></div>
      {concept === "inflow" && <div className={`${card} p-4`}><CaveatList ids={["mitral_inflow", "eprime", "diast_invalid"]} /></div>}
      {concept === "pisa" && <div className={`${card} p-4`}><CaveatList ids={["pisa"]} /></div>}
      {concept === "doppler" && <div className={`${card} p-4`}><Bullets items={["Doppler measures only the component of velocity along the beam: measured = true × cos θ.", "Keep θ under 20° for velocities used in gradients (AS, TR, RVSP) and VTI.", "Angle correction is not recommended for cardiac Doppler; move the probe or change window instead.", "Colour Doppler first shows the jet direction; then line up the CW or PW cursor with it."]} /></div>}
      {concept === "windows" && <div className={`${card} p-4`}><Bullets items={["Parasternal: left sternal edge, 3rd–4th space, patient rolled left, left arm above the head.", "Apical: at the apex beat, often lower and more lateral than expected; steep left lateral position.", "Subcostal: below the xiphisternum, knees bent. Often best in ventilated or COPD patients.", "Suprasternal: neck extended, probe in the notch, pointing down."]} /></div>}
    </div>
  );

  const ql = q.trim().toLowerCase();
  const views = VIEWS.filter((v) => !ql || [v.name, ...v.structures, ...v.measure, ...v.optimise, ...v.pitfalls].join(" ").toLowerCase().includes(ql));
  const cav = Object.entries(CAVEATS).filter(([, c]) => !ql || [c.title, ...c.points].join(" ").toLowerCase().includes(ql));
  const groups = Array.from(new Set(VIEWS.map((v) => v.group)));

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-muted)]" />
        <input aria-label="Search tips" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search views and tips, e.g. TAPSE, foreshortening" className={`${inputCls} pl-9`} />
      </div>

      {!ql && (
        <div className={`${card} p-3`}>
          <SectionTitle>Concepts</SectionTitle>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {CONCEPTS.map((c) => (
              <button key={c} type="button" onClick={() => setConcept(c)} className="text-left bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl p-2">
                <div className="pointer-events-none"><Diagram id={c} /></div>
                <span className="block text-xs font-bold text-[var(--c-text)] mt-1.5">{DIAGRAMS[c].title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {groups.map((gname) => {
        const list = views.filter((v) => v.group === gname);
        if (!list.length) return null;
        return (
          <div key={gname} className={`${card} p-3 space-y-1.5`}>
            <SectionTitle>{gname} views</SectionTitle>
            {list.map((v) => (
              <button key={v.id} type="button" onClick={() => setView(v)} className="w-full flex items-center gap-3 text-left bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl p-2">
                <div className="w-20 shrink-0 pointer-events-none"><Diagram id={v.diagram} /></div>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-bold text-[var(--c-text)]">{v.name}</span>
                  <span className="block text-[11px] text-[var(--c-muted)] line-clamp-2">{v.measure.slice(0, 3).join(" · ")}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-[var(--c-muted)] shrink-0" />
              </button>
            ))}
          </div>
        );
      })}

      {cav.length > 0 && (
        <div className={`${card} p-3 space-y-1.5`}>
          <SectionTitle>Measurement caveats</SectionTitle>
          {cav.map(([id, c]) => (
            <button key={id} type="button" onClick={() => setCaveat(id)} className="w-full flex items-center justify-between text-left bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl px-3 py-2.5">
              <span className="text-[13px] font-semibold text-[var(--c-text)]">{c.title}</span>
              <ChevronRight className="w-4 h-4 text-[var(--c-muted)] shrink-0" />
            </button>
          ))}
        </div>
      )}
      <p className="text-[10.5px] text-[var(--c-muted)] text-center px-4">Diagrams are schematic and not to scale. Teaching notes are written for this app; check against current BSE/ASE guidance.</p>
    </div>
  );
};

const BackBar: React.FC<{ onBack: () => void; title: string }> = ({ onBack, title }) => (
  <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-[var(--c-teal)]"><ArrowLeft className="w-4 h-4" /> {title}</button>
);

const ViewPage: React.FC<{ v: ViewGuide; onBack: () => void }> = ({ v, onBack }) => (
  <div className="space-y-3">
    <BackBar onBack={onBack} title="All views" />
    <h2 className="text-lg font-bold text-[var(--c-text)]">{v.name}</h2>
    <div className={`${card} p-3`}><Diagram id={v.diagram} /></div>
    <div className={`${card} p-4 space-y-2`}>
      <p className="text-[13px] text-[var(--c-text2)]"><b className="text-[var(--c-text)]">Probe: </b>{v.probe}</p>
      <p className="text-[13px] text-[var(--c-text2)]"><b className="text-[var(--c-text)]">Marker: </b>{v.marker}</p>
    </div>
    <Block title="Structures" items={v.structures} color="#7D8E97" />
    <Block title="Optimise the view" items={v.optimise} color="var(--c-teal)" />
    <Block title="Measure here" items={v.measure} color="#F2B33D" />
    <Block title="Pitfalls" items={v.pitfalls} color="#E05A4F" />
  </div>
);

const Block: React.FC<{ title: string; items: string[]; color: string }> = ({ title, items, color }) => (
  <div className={`${card} p-4 space-y-2`}>
    <SectionTitle>{title}</SectionTitle>
    <Bullets items={items} color={color} />
  </div>
);
