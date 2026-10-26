import React from "react";

/**
 * Original schematic teaching diagrams (not to scale). Each view is drawn as an ultrasound
 * sector: grey tissue, black blood pools, white labels, amber calliper lines for measurements.
 */

const TISSUE = "#59656c";
const TISSUE_HI = "#8a979e";
const BLOOD = "#0a0d10";
const LABEL = "#ffffff";
const CAL = "#F2B33D";
const DOP = "#4FC3B8";

const FAN = "M150,8 L-4,182 A232,232 0 0,0 304,182 Z";

const Frame: React.FC<{ children: React.ReactNode; title: string; caption?: string; h?: number }> = ({ children, title, caption, h = 262 }) => (
  <svg viewBox={`-12 0 324 ${h}`} role="img" aria-label={title} className="w-full h-auto rounded-xl" style={{ background: "#05070a" }}>
    <defs>
      <clipPath id={`clip-${title.replace(/\W/g, "")}`}><path d={FAN} /></clipPath>
      <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={CAL} /></marker>
      <marker id="arrw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={LABEL} /></marker>
      <marker id="arrd" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={DOP} /></marker>
    </defs>
    <path d={FAN} fill={TISSUE} opacity={0.55} />
    <g clipPath={`url(#clip-${title.replace(/\W/g, "")})`}>{children}</g>
    <circle cx={150} cy={8} r={3} fill={CAL} />
    {caption && <text x={150} y={h - 7} textAnchor="middle" fontSize={9} fill={TISSUE_HI} fontFamily="system-ui, sans-serif">{caption}</text>}
  </svg>
);

const B: React.FC<{ d: string }> = ({ d }) => <path d={d} fill={BLOOD} stroke={TISSUE_HI} strokeWidth={1.5} />;
const E: React.FC<{ cx: number; cy: number; rx: number; ry: number; rot?: number }> = ({ cx, cy, rx, ry, rot = 0 }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} fill={BLOOD} stroke={TISSUE_HI} strokeWidth={1.5} />
);
const Valve: React.FC<{ d: string }> = ({ d }) => <path d={d} fill="none" stroke="#e8edf0" strokeWidth={2.2} strokeLinecap="round" />;
const L: React.FC<{ x: number; y: number; t: string; a?: "start" | "middle" | "end"; s?: number; c?: string }> = ({ x, y, t, a = "middle", s = 10, c = LABEL }) => (
  <text x={x} y={y} textAnchor={a} fontSize={s} fill={c} fontFamily="system-ui, sans-serif" fontWeight={600} style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 2.5 }}>{t}</text>
);
const Cal: React.FC<{ x1: number; y1: number; x2: number; y2: number; t?: string; tx?: number; ty?: number; a?: "start" | "middle" | "end" }> = ({ x1, y1, x2, y2, t, tx, ty, a = "start" }) => (
  <g>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={CAL} strokeWidth={1.8} strokeDasharray="4 3" markerStart="url(#arr)" markerEnd="url(#arr)" />
    {t && <L x={tx ?? (x1 + x2) / 2 + 4} y={ty ?? (y1 + y2) / 2} t={t} a={a} s={9} c={CAL} />}
  </g>
);
const Beam: React.FC<{ x2: number; y2: number; t?: string; tx?: number; ty?: number; a?: "start" | "middle" | "end" }> = ({ x2, y2, t, tx, ty, a = "start" }) => (
  <g>
    <line x1={150} y1={8} x2={x2} y2={y2} stroke={DOP} strokeWidth={1.4} strokeDasharray="2 3" />
    <rect x={x2 - 4} y={y2 - 2} width={8} height={4} fill={DOP} />
    {t && <L x={tx ?? x2 + 8} y={ty ?? y2 + 3} t={t} a={a} s={9} c={DOP} />}
  </g>
);

// ---------- Views ----------
const Plax = () => (
  <Frame title="Parasternal long axis" caption="Measure linear dimensions at the leaflet tips">
    <g transform="translate(22.5,30) scale(0.85)">
    {/* RV */}
    <B d="M40,40 Q150,22 262,48 L258,66 Q150,48 46,62 Z" />
    {/* LV cavity */}
    <B d="M18,120 Q30,84 90,80 L188,80 Q196,100 192,128 Q150,152 70,150 Q28,146 18,120 Z" />
    {/* Aortic root */}
    <B d="M188,80 Q215,70 300,74 L300,112 Q228,110 196,118 Z" />
    {/* LA */}
    <E cx={232} cy={150} rx={36} ry={26} />
    {/* Descending aorta */}
    <E cx={220} cy={198} rx={10} ry={9} />
    <Valve d="M197,84 L212,96 M197,114 L212,102" />
    <Valve d="M192,120 Q178,128 160,124 M200,128 Q196,138 186,146" />
    <L x={150} y={58} t="RV" />
    <L x={95} y={120} t="LV" />
    <L x={212} y={99} t="Ao" s={9} />
    <L x={232} y={154} t="LA" />
    <L x={238} y={202} t="DAo" a="start" s={9} />
    <L x={46} y={76} t="IVS" s={8} a="start" />
    <L x={38} y={166} t="Post. wall" s={8} a="start" />
    <Cal x1={150} y1={82} x2={150} y2={146} t="LVIDd" tx={154} ty={108} />
    <Cal x1={150} y1={66} x2={150} y2={80} />
    <L x={146} y={76} t="IVSd" s={8} c={CAL} a="end" />
    <Cal x1={190} y1={84} x2={190} y2={118} t="LVOT" tx={186} ty={134} a="end" />
    <Cal x1={232} y1={76} x2={232} y2={110} t="Root" tx={236} ty={124} />
    </g>
  </Frame>
);

const PsaxAv = () => (
  <Frame title="PSAX aortic valve level" caption="Mercedes sign: N / L / R cusps">
    <B d="M60,60 Q150,30 260,70 L250,96 Q200,78 170,92 L128,92 Q108,78 70,86 Z" />
    <E cx={150} cy={122} rx={30} ry={29} />
    <Valve d="M150,122 L150,94 M150,122 L124,138 M150,122 L176,138" />
    <E cx={104} cy={176} rx={36} ry={26} />
    <E cx={196} cy={180} rx={40} ry={28} />
    <B d="M248,96 Q270,120 268,160 L246,162 Q250,126 232,104 Z" />
    <L x={150} y={58} t="RVOT" />
    <L x={150} y={126} t="AV" s={9} />
    <L x={100} y={180} t="RA" />
    <L x={198} y={184} t="LA" />
    <L x={262} y={186} t="PA" />
    <L x={60} y={132} t="TV" s={9} />
    <Beam x2={242} y2={104} t="RVOT PW" tx={232} ty={120} a="end" />
  </Frame>
);

const PsaxPm = () => (
  <Frame title="PSAX papillary muscle level" caption="Round LV = on-axis. D-shape = RV loading">
    <B d="M50,56 Q150,26 252,56 Q238,80 214,92 Q150,70 86,92 Q62,80 50,56 Z" />
    <circle cx={150} cy={148} r={62} fill={TISSUE} stroke={TISSUE_HI} strokeWidth={1.5} />
    <circle cx={150} cy={148} r={44} fill={BLOOD} stroke={TISSUE_HI} strokeWidth={1.5} />
    <circle cx={178} cy={168} r={9} fill={TISSUE_HI} />
    <circle cx={128} cy={174} r={9} fill={TISSUE_HI} />
    <L x={150} y={54} t="RV" />
    <L x={150} y={144} t="LV" />
    <L x={150} y={98} t="Septum" s={8} />
    <L x={202} y={196} t="AL pap" s={8} a="start" />
    <L x={100} y={198} t="PM pap" s={8} a="end" />
  </Frame>
);

const PsaxMv = () => (
  <Frame title="PSAX mitral valve level">
    <B d="M50,56 Q150,26 252,56 Q238,80 214,92 Q150,70 86,92 Q62,80 50,56 Z" />
    <circle cx={150} cy={148} r={62} fill={TISSUE} stroke={TISSUE_HI} strokeWidth={1.5} />
    <circle cx={150} cy={148} r={48} fill={BLOOD} stroke={TISSUE_HI} strokeWidth={1.5} />
    <path d="M116,140 Q150,118 184,140" fill="none" stroke="#e8edf0" strokeWidth={3} />
    <path d="M118,158 Q150,176 182,158" fill="none" stroke="#e8edf0" strokeWidth={3} />
    <ellipse cx={150} cy={149} rx={22} ry={9} fill="none" stroke={CAL} strokeWidth={1.6} strokeDasharray="4 3" />
    <L x={150} y={54} t="RV" />
    <L x={150} y={114} t="AMVL" s={8.5} />
    <L x={150} y={190} t="PMVL" s={8.5} />
    <L x={200} y={152} t="Planimetry" s={8.5} c={CAL} a="start" />
  </Frame>
);

const A4c = () => (
  <Frame title="Apical four chamber" caption="True apex: long, bullet-shaped LV">
    {/* LV right of screen, RV left (common UK/US orientation with marker to the left of the patient) */}
    <B d="M154,30 Q214,70 232,140 L160,140 L156,40 Z" />
    <B d="M146,34 Q96,70 76,140 L140,140 Z" />
    <E cx={196} cy={182} rx={38} ry={30} />
    <E cx={106} cy={182} rx={36} ry={30} />
    <Valve d="M162,142 L178,158 M230,142 L214,158" />
    <Valve d="M80,142 L94,158 M138,142 L126,156" />
    <L x={196} y={104} t="LV" />
    <L x={112} y={104} t="RV" />
    <L x={198} y={186} t="LA" />
    <L x={106} y={186} t="RA" />
    <Cal x1={80} y1={128} x2={142} y2={128} t="RV basal" tx={111} ty={120} a="middle" />
    <Beam x2={196} y2={150} t="Inflow PW" tx={238} ty={166} a="start" />
    <circle cx={232} cy={142} r={4} fill="none" stroke={DOP} strokeWidth={1.5} />
    <L x={228} y={132} t="lat e′" s={8.5} c={DOP} a="end" />
    <circle cx={162} cy={142} r={4} fill="none" stroke={DOP} strokeWidth={1.5} />
    <L x={166} y={130} t="sept e′" s={8.5} c={DOP} a="start" />
    <line x1={74} y1={142} x2={74} y2={124} stroke={CAL} strokeWidth={2} markerEnd="url(#arr)" />
    <L x={66} y={152} t="TAPSE" s={8.5} c={CAL} a="end" />
  </Frame>
);

const A5c = () => (
  <Frame title="Apical five chamber" caption="Align the beam with LVOT flow">
    <B d="M154,30 Q214,70 232,140 L160,140 L156,40 Z" />
    <B d="M146,34 Q96,70 76,140 L140,140 Z" />
    <B d="M162,140 L188,140 L196,174 L160,176 Z" />
    <E cx={212} cy={190} rx={30} ry={24} />
    <E cx={102} cy={186} rx={34} ry={28} />
    <Valve d="M164,170 L176,164 M194,170 L182,164" />
    <L x={196} y={104} t="LV" />
    <L x={112} y={104} t="RV" />
    <L x={178} y={190} t="AV" s={9} />
    <L x={226} y={196} t="LA" />
    <L x={102} y={190} t="RA" />
    <Beam x2={176} y2={156} t="LVOT PW" tx={194} ty={150} a="start" />
  </Frame>
);

const A2c = () => (
  <Frame title="Apical two chamber" caption="No RV in view; apex still">
    <B d="M150,30 Q218,70 228,140 L82,140 Q86,70 150,30 Z" />
    <E cx={156} cy={182} rx={52} ry={30} />
    <circle cx={226} cy={170} r={7} fill={BLOOD} stroke={TISSUE_HI} />
    <Valve d="M90,142 L108,160 M222,142 L204,160" />
    <L x={155} y={100} t="LV" />
    <L x={156} y={186} t="LA" />
    <L x={110} y={124} t="Inferior" s={8.5} />
    <L x={200} y={124} t="Anterior" s={8.5} />
    <L x={240} y={184} t="CS" s={8} a="start" />
  </Frame>
);

const Sc4c = () => (
  <Frame title="Subcostal four chamber" caption="Best window for effusion in ventilated patients">
    <path d="M-10,8 L310,8 L310,62 Q150,80 -10,52 Z" fill="#6d5b4e" opacity={0.75} />
    <B d="M70,76 Q160,62 250,90 L240,118 Q160,98 84,108 Z" />
    <B d="M84,112 Q160,104 236,124 L248,180 Q170,196 96,170 Z" />
    <E cx={66} cy={150} rx={30} ry={26} />
    <E cx={102} cy={206} rx={34} ry={22} />
    <L x={40} y={40} t="Liver" />
    <L x={162} y={92} t="RV" />
    <L x={170} y={154} t="LV" />
    <L x={60} y={154} t="RA" />
    <L x={104} y={210} t="LA" />
    <Cal x1={150} y1={66} x2={150} y2={76} />
    <L x={150} y={50} t="RV free wall" s={8.5} c={CAL} />
  </Frame>
);

const Ivc = () => (
  <Frame title="Subcostal IVC" caption="Measure perpendicular to the IVC; sniff">
    <path d="M-10,8 L310,8 L310,90 Q150,110 -10,80 Z" fill="#6d5b4e" opacity={0.75} />
    <B d="M-10,128 Q100,118 200,124 Q236,128 262,110 L274,140 Q240,150 206,150 Q100,154 -10,156 Z" />
    <B d="M110,92 Q122,104 128,122 L140,122 Q132,100 120,86 Z" />
    <E cx={276} cy={128} rx={26} ry={30} />
    <L x={60} y={60} t="Liver" />
    <L x={60} y={146} t="IVC" />
    <L x={276} y={132} t="RA" />
    <L x={146} y={100} t="Hepatic v." s={8.5} a="start" />
    <Cal x1={200} y1={125} x2={204} y2={150} t="1–2 cm from RA" tx={150} ty={180} a="middle" />
  </Frame>
);

const Ssn = () => (
  <Frame title="Suprasternal notch" caption="CW in descending aorta: coarctation, AR flow reversal">
    <B d="M40,170 Q60,70 150,58 Q240,70 262,170 L238,172 Q222,94 150,84 Q80,94 64,170 Z" />
    <E cx={150} cy={130} rx={18} ry={14} />
    <path d="M110,64 L102,20 M150,58 L150,14 M190,64 L198,22" stroke={TISSUE_HI} strokeWidth={6} />
    <L x={50} y={190} t="Asc Ao" />
    <L x={252} y={190} t="Desc Ao" />
    <L x={150} y={134} t="RPA" s={9} />
    <Beam x2={232} y2={140} t="CW" tx={238} ty={130} a="start" />
  </Frame>
);

// ---------- Concepts ----------
const Windows = () => (
  <svg viewBox="0 0 300 260" role="img" aria-label="Acoustic windows" className="w-full h-auto rounded-xl" style={{ background: "#05070a" }}>
    <path d="M90,20 Q150,6 210,20 L232,80 L228,200 Q150,232 72,200 L68,80 Z" fill="#2b3439" stroke={TISSUE_HI} />
    <line x1={150} y1={22} x2={150} y2={150} stroke={TISSUE_HI} strokeWidth={6} />
    <path d="M136,150 L150,166 L164,150" fill={TISSUE_HI} />
    {[48, 70, 92, 114, 136].map((y) => <path key={y} d={`M80,${y + 4} Q115,${y - 6} 146,${y} M154,${y} Q185,${y - 6} 220,${y + 4}`} stroke="#3e4a50" fill="none" strokeWidth={4} />)}
    <path d="M150,96 Q190,90 196,128 Q182,150 150,146 Z" fill="#7a2f2f" opacity={0.7} />
    {[
      [150, 14, "Suprasternal"], [134, 84, "Parasternal"], [188, 140, "Apical"], [150, 178, "Subcostal"],
    ].map(([x, y, t]) => (
      <g key={t as string}>
        <circle cx={x as number} cy={y as number} r={7} fill="none" stroke={CAL} strokeWidth={2.4} />
        <L x={(x as number) + ((t as string) === "Parasternal" ? -12 : 12)} y={(y as number) + 4} t={t as string} a={(t as string) === "Parasternal" ? "end" : "start"} s={10} c={CAL} />
      </g>
    ))}
    <L x={150} y={246} t="Patient in left lateral position for parasternal and apical windows" s={8.5} c={TISSUE_HI} />
  </svg>
);

const DopplerAngle = () => (
  <svg viewBox="0 0 300 220" role="img" aria-label="Doppler angle" className="w-full h-auto rounded-xl" style={{ background: "#05070a" }}>
    <line x1={40} y1={160} x2={270} y2={160} stroke={TISSUE_HI} strokeWidth={10} strokeLinecap="round" />
    <line x1={60} y1={160} x2={250} y2={160} stroke={BLOOD} strokeWidth={6} />
    <line x1={100} y1={160} x2={220} y2={160} stroke={CAL} strokeWidth={2} markerEnd="url(#arr)" />
    <L x={160} y={182} t="True flow velocity V" c={CAL} s={10} />
    <line x1={80} y1={30} x2={160} y2={160} stroke={DOP} strokeWidth={2} markerEnd="url(#arrd)" />
    <path d="M128,108 A40,40 0 0,1 146,150" fill="none" stroke={LABEL} />
    <L x={146} y={126} t="θ" s={13} a="start" />
    <L x={60} y={24} t="Doppler beam" c={DOP} s={10} a="start" />
    <L x={150} y={206} t="Measured = V × cos θ. 20° → 6% low, 30° → 13%, 60° → 50%" s={8.5} c={TISSUE_HI} />
  </svg>
);

const Pisa = () => (
  <svg viewBox="0 0 300 230" role="img" aria-label="PISA" className="w-full h-auto rounded-xl" style={{ background: "#05070a" }}>
    <rect x={0} y={0} width={300} height={120} fill="#0b2a52" />
    <rect x={0} y={128} width={300} height={102} fill="#5a1414" opacity={0.6} />
    <line x1={0} y1={124} x2={136} y2={124} stroke="#e8edf0" strokeWidth={6} />
    <line x1={164} y1={124} x2={300} y2={124} stroke="#e8edf0" strokeWidth={6} />
    <path d="M100,124 A50,50 0 0,1 200,124" fill="#d64b2a" opacity={0.85} />
    <path d="M118,124 A32,32 0 0,1 182,124" fill="#f3d23a" opacity={0.9} />
    <line x1={150} y1={124} x2={150} y2={74} stroke={CAL} strokeWidth={2} markerEnd="url(#arr)" />
    <L x={156} y={96} t="r" s={13} c={CAL} a="start" />
    <path d="M140,128 Q150,190 136,226 M160,128 Q150,190 164,226" stroke="#f08b6a" strokeWidth={3} fill="none" />
    <L x={30} y={40} t="LV (blue: flow towards probe)" s={9} a="start" />
    <L x={30} y={160} t="LA" s={10} a="start" />
    <L x={210} y={100} t="Aliasing line = Va" s={9} a="start" c="#f3d23a" />
    <L x={150} y={20} t="EROA = 2πr² × Va / Vmax" s={11} c={CAL} />
  </svg>
);

const Wave: React.FC<{ x: number; e: number; a: number; label: string; ep: number; ap: number }> = ({ x, e, a, label, ep, ap }) => (
  <g>
    <line x1={x} y1={90} x2={x + 62} y2={90} stroke={TISSUE_HI} />
    <path d={`M${x + 2},90 L${x + 14},${90 - e} L${x + 30},90 M${x + 34},90 L${x + 44},${90 - a} L${x + 56},90`} fill="none" stroke={DOP} strokeWidth={2} />
    <line x1={x} y1={150} x2={x + 62} y2={150} stroke={TISSUE_HI} />
    <path d={`M${x + 2},150 L${x + 12},${150 + ep} L${x + 26},150 M${x + 34},150 L${x + 42},${150 + ap} L${x + 54},150`} fill="none" stroke={CAL} strokeWidth={2} />
    <L x={x + 31} y={186} t={label} s={8.5} />
  </g>
);
const Inflow = () => (
  <svg viewBox="0 0 300 210" role="img" aria-label="Diastolic filling patterns" className="w-full h-auto rounded-xl" style={{ background: "#05070a" }}>
    <L x={6} y={20} t="Mitral inflow (E, A)" s={9} c={DOP} a="start" />
    <L x={6} y={124} t="Annular TDI (e′, a′)" s={9} c={CAL} a="start" />
    <Wave x={8} e={52} a={34} ep={26} ap={16} label="Normal" />
    <Wave x={80} e={30} a={52} ep={12} ap={20} label="Grade I" />
    <Wave x={152} e={52} a={34} ep={12} ap={18} label="Grade II" />
    <Wave x={224} e={66} a={18} ep={10} ap={8} label="Grade III" />
    <L x={150} y={204} t="Grade II looks normal on inflow: low e′ and high E/e′ unmask it" s={8} c={TISSUE_HI} />
  </svg>
);

export const DIAGRAMS: Record<string, { title: string; el: React.FC }> = {
  plax: { title: "Parasternal long axis", el: Plax },
  psax_av: { title: "PSAX: aortic valve level", el: PsaxAv },
  psax_mv: { title: "PSAX: mitral valve level", el: PsaxMv },
  psax_pm: { title: "PSAX: papillary muscle level", el: PsaxPm },
  a4c: { title: "Apical four chamber", el: A4c },
  a5c: { title: "Apical five / three chamber", el: A5c },
  a2c: { title: "Apical two chamber", el: A2c },
  sc4c: { title: "Subcostal four chamber", el: Sc4c },
  ivc: { title: "Subcostal IVC", el: Ivc },
  ssn: { title: "Suprasternal notch", el: Ssn },
  windows: { title: "Acoustic windows", el: Windows },
  doppler: { title: "Doppler angle", el: DopplerAngle },
  pisa: { title: "PISA", el: Pisa },
  inflow: { title: "Diastolic filling patterns", el: Inflow },
};

export const Diagram: React.FC<{ id: string }> = ({ id }) => {
  const D = DIAGRAMS[id];
  if (!D) return null;
  const C = D.el;
  return <C />;
};
