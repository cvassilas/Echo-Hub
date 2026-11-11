import React from "react";

/** Probe-position and Doppler-gate placement diagrams. Schematic, not to scale. */

const FONT = "Carlito, Calibri, 'Segoe UI', system-ui, sans-serif";
const BG = "#05070a";
const CAL = "#F2B33D";
const DOP = "#4FC3B8";
const MUTED = "#9aa6ab";
const SKIN = "#2a3236";
const LINE = "#56636a";
const TISSUE = "#4b5458";
const DARK = "#07090b";
const RED = "#E05A4F";
const BLUE = "#3d7fd9";
const WHITE = "#eef2f3";

const T: React.FC<{ x: number; y: number; t: string; s?: number; c?: string; a?: "start" | "middle" | "end"; b?: boolean }> = ({ x, y, t, s = 9, c = "#ffffff", a = "middle", b }) => (
  <text x={x} y={y} fontSize={s} fill={c} textAnchor={a} fontFamily={FONT} fontWeight={b ? 700 : 400}>{t}</text>
);
const Svg: React.FC<{ h: number; label: string; children: React.ReactNode }> = ({ h, label, children }) => (
  <svg viewBox={`0 0 300 ${h}`} role="img" aria-label={label} className="w-full h-auto rounded-xl" style={{ background: BG }}>{children}</svg>
);
/** Probe footprint at (x,y), rotated `r` degrees, with the orientation marker dot. */
const Probe: React.FC<{ x: number; y: number; r?: number; w?: number; label?: string; lx?: number; ly?: number; la?: "start" | "middle" | "end" }> = ({ x, y, r = 0, w = 16, label, lx, ly, la = "middle" }) => (
  <g>
    <g transform={`translate(${x},${y}) rotate(${r})`}>
      <rect x={-w / 2} y={-4} width={w} height={8} rx={3} fill={CAL} />
      <circle cx={w / 2 - 2.5} cy={0} r={1.6} fill={BG} />
    </g>
    {label && <T x={lx ?? x} y={ly ?? y - 9} t={label} s={8.5} c={CAL} a={la} />}
  </g>
);
/** PW sample volume: two short bars across the beam line. */
const Gate: React.FC<{ x: number; y: number; ang?: number; c?: string }> = ({ x, y, ang = 0, c = WHITE }) => (
  <g transform={`translate(${x},${y}) rotate(${ang})`}>
    <line x1={-5} y1={-3} x2={5} y2={-3} stroke={c} strokeWidth={1.6} />
    <line x1={-5} y1={3} x2={5} y2={3} stroke={c} strokeWidth={1.6} />
  </g>
);
const Beam: React.FC<{ x1: number; y1: number; x2: number; y2: number; c?: string }> = ({ x1, y1, x2, y2, c = DOP }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={1} strokeDasharray="3 2" />
);
const Sector: React.FC<{ x: number; y: number; r: number; spread?: number; children?: React.ReactNode; id: string }> = ({ x, y, r, spread = 40, children, id }) => {
  const a = (spread * Math.PI) / 180;
  const d = `M${x},${y} L${x - r * Math.sin(a)},${y + r * Math.cos(a)} A${r},${r} 0 0,0 ${x + r * Math.sin(a)},${y + r * Math.cos(a)} Z`;
  return (
    <g>
      <clipPath id={id}><path d={d} /></clipPath>
      <path d={d} fill="#15191c" />
      <g clipPath={`url(#${id})`}>{children}</g>
      <path d={d} fill="none" stroke={LINE} strokeWidth={0.8} />
    </g>
  );
};

// ---------- Torso outline (front) ----------
const TorsoFront: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-22,-62 Q0,-70 22,-62 L46,-50 Q54,-20 50,20 L46,70 Q0,80 -46,70 L-50,20 Q-54,-20 -46,-50 Z" fill={SKIN} stroke={LINE} />
    <path d="M-6,-62 L-6,-12 M6,-62 L6,-12" stroke={LINE} strokeWidth={0.6} />
    <path d="M-40,-8 Q-20,8 0,-6 Q20,8 40,-8" stroke={LINE} strokeWidth={0.8} fill="none" />
    <T x={0} y={-48} t="sternum" s={7} c={MUTED} />
    <T x={0} y={4} t="costal margin" s={7} c={MUTED} />
  </g>
);

// ---------- TCD ----------
export const TcdPlacement = () => (
  <Svg h={232} label="Transcranial Doppler windows and MCA sampling">
    {/* Lateral head */}
    <g>
      <path d="M30,150 Q18,90 46,52 Q80,22 112,40 Q132,58 130,96 Q130,118 120,132 L118,160 Q104,170 90,168 L70,186 L48,186 Q36,170 30,150 Z" fill={SKIN} stroke={LINE} />
      <path d="M118,98 Q132,100 128,112" stroke={LINE} fill="none" />
      <ellipse cx={108} cy={84} rx={6} ry={3.5} fill={DARK} stroke={LINE} />
      <path d="M62,112 L98,112" stroke={WHITE} strokeWidth={1.6} />
      <T x={66} y={123} t="zygomatic arch" s={7} c={MUTED} a="start" />
      <ellipse cx={56} cy={110} rx={7} ry={9} fill="none" stroke={LINE} />
      <rect x={60} y={86} width={30} height={20} rx={5} fill="none" stroke={DOP} strokeDasharray="3 2" />
      <Probe x={75} y={96} r={0} />
      <T x={75} y={80} t="Temporal window" s={8.5} c={DOP} />
      <circle cx={108} cy={84} r={9} fill="none" stroke={DOP} strokeDasharray="3 2" />
      <T x={124} y={70} t="Orbital" s={8} c={DOP} a="end" />
      <rect x={36} y={150} width={16} height={12} rx={4} fill="none" stroke={DOP} strokeDasharray="3 2" />
      <T x={10} y={176} t="Suboccipital" s={8} c={DOP} a="start" />
      <T x={78} y={208} t="Probe just above the zygoma," s={8} c={MUTED} />
      <T x={78} y={218} t="in front of the ear" s={8} c={MUTED} />
    </g>
    {/* Axial circle of Willis */}
    <g>
      <ellipse cx={222} cy={112} rx={66} ry={80} fill="#101417" stroke={LINE} />
      <T x={222} y={26} t="anterior" s={7.5} c={MUTED} />
      <Probe x={157} y={118} r={90} />
      <path d="M157,118 L250,70 L250,166 Z" fill={DOP} opacity={0.07} />
      <path d="M214,128 Q222,112 232,128 Q228,140 222,136 Q216,140 214,128 Z" fill="#6b7478" />
      <T x={224} y={150} t="midbrain" s={7} c={MUTED} />
      <path d="M212,112 Q192,112 172,104" stroke={RED} strokeWidth={3} fill="none" />
      <path d="M212,112 Q218,92 222,72" stroke={BLUE} strokeWidth={2.5} fill="none" />
      <path d="M232,112 Q226,92 222,72" stroke={BLUE} strokeWidth={2.5} fill="none" opacity={0.6} />
      <path d="M212,112 Q220,108 232,112" stroke={RED} strokeWidth={2} fill="none" />
      <path d="M232,112 Q252,112 272,104" stroke={RED} strokeWidth={3} fill="none" opacity={0.55} />
      <path d="M214,124 Q200,138 206,150" stroke={RED} strokeWidth={2} fill="none" />
      <Beam x1={161} y1={117} x2={196} y2={111} />
      <Gate x={190} y={110} ang={80} />
      <T x={182} y={96} t="MCA → probe" s={8.5} c={RED} />
      <T x={182} y={86} t="45–65 mm" s={8.5} c={CAL} />
      <T x={236} y={66} t="ACA away" s={8} c={BLUE} a="start" />
      <T x={194} y={162} t="PCA" s={8} c={RED} />
      <T x={222} y={206} t="ICA terminus ~60–65 mm: flow splits" s={7.5} c={MUTED} />
      <T x={222} y={216} t="towards (MCA) and away (ACA)" s={7.5} c={MUTED} />
    </g>
  </Svg>
);

// ---------- VExUS ----------
export const VexusPlacement = () => (
  <Svg h={316} label="VExUS probe positions and Doppler sample sites">
    <TorsoFront x={58} y={86} s={0.95} />
    <Probe x={74} y={92} r={-30} label="1 Subcostal" lx={110} ly={112} la="start" />
    <Probe x={16} y={70} r={90} label="2 R mid-axillary" lx={10} ly={44} la="start" />
    <Probe x={10} y={120} r={80} label="3 R posterior axillary" lx={4} ly={156} la="start" />
    <T x={120} y={20} t="Patient's right is on the left of the picture" s={7.5} c={MUTED} a="start" />
    <T x={120} y={34} t="1  IVC and hepatic veins (or coronal via 2)" s={8.5} c="#dfe6e8" a="start" />
    <T x={120} y={48} t="2  Portal vein at the liver hilum" s={8.5} c="#dfe6e8" a="start" />
    <T x={120} y={62} t="3  Right kidney: interlobar vessels" s={8.5} c="#dfe6e8" a="start" />
    <T x={120} y={80} t="ECG on for all three; breath hold" s={8.5} c={CAL} a="start" />

    {/* Hepatic vein panel */}
    <g>
      <Sector x={52} y={180} r={112} spread={34} id="vx1">
        <rect x={0} y={180} width={110} height={120} fill={TISSUE} />
        <path d="M42,180 L42,300 L62,300 L62,180 Z" fill={DARK} />
        <path d="M62,232 Q80,252 98,278 L90,284 Q74,260 58,244 Z" fill={BLUE} opacity={0.85} />
      </Sector>
      <Beam x1={52} y1={180} x2={76} y2={258} />
      <Gate x={73} y={250} ang={-17} />
      <T x={52} y={308} t="Hepatic vein: gate 1–2 cm from IVC" s={8} c={DOP} />
      <T x={26} y={200} t="IVC" s={7.5} c={MUTED} />
    </g>
    {/* Portal vein panel */}
    <g>
      <Sector x={150} y={180} r={112} spread={34} id="vx2">
        <rect x={90} y={180} width={130} height={120} fill={TISSUE} />
        <path d="M110,250 Q150,240 196,250 L196,262 Q150,252 110,262 Z" fill={RED} opacity={0.85} stroke={WHITE} strokeWidth={1.4} />
      </Sector>
      <Beam x1={150} y1={180} x2={160} y2={251} />
      <Gate x={159} y={246} ang={-8} />
      <T x={150} y={308} t="Portal vein: gate mid-vessel, angle < 60°" s={8} c={DOP} />
      <T x={192} y={240} t="bright walls" s={7} c={MUTED} a="end" />
    </g>
    {/* Kidney panel */}
    <g>
      <Sector x={248} y={180} r={112} spread={34} id="vx3">
        <rect x={190} y={180} width={120} height={120} fill={TISSUE} />
        <ellipse cx={248} cy={256} rx={34} ry={24} fill="#30383b" stroke={WHITE} strokeWidth={0.8} />
        <ellipse cx={248} cy={258} rx={14} ry={9} fill="#9aa4a8" />
        {[-26, -12, 4, 18].map((dx) => <path key={dx} d={`M${248 + dx},238 L${252 + dx},250 L${244 + dx},250 Z`} fill={DARK} />)}
        {[-19, -4, 11].map((dx) => <g key={dx}><line x1={248 + dx} y1={236} x2={248 + dx} y2={252} stroke={RED} strokeWidth={1.4} /><line x1={250 + dx} y1={236} x2={250 + dx} y2={252} stroke={BLUE} strokeWidth={1.4} /></g>)}
      </Sector>
      <Beam x1={248} y1={180} x2={245} y2={242} />
      <Gate x={245} y={243} ang={3} />
      <T x={248} y={308} t="Kidney: gate on artery + vein together" s={8} c={DOP} />
    </g>
  </Svg>
);

// ---------- Lung zones ----------
export const LungZones = () => (
  <Svg h={238} label="Lung ultrasound scanning zones">
    <TorsoFront x={78} y={110} s={1.05} />
    {[[-1, 1]].map(() => null)}
    {/* anterior zones: between sternum and anterior axillary line, split by nipple line */}
    {[-1, 1].map((side) => (
      <g key={side}>
        <line x1={78 + side * 10} y1={46} x2={78 + side * 10} y2={176} stroke={DOP} strokeWidth={0.8} strokeDasharray="3 2" />
        <line x1={78 + side * 40} y1={50} x2={78 + side * 44} y2={176} stroke={DOP} strokeWidth={0.8} strokeDasharray="3 2" />
        <line x1={78 + side * 10} y1={98} x2={78 + side * 52} y2={98} stroke={DOP} strokeWidth={0.8} strokeDasharray="3 2" />
      </g>
    ))}
    <circle cx={60} cy={74} r={4} fill={CAL} /><circle cx={56} cy={124} r={4} fill={CAL} />
    <circle cx={96} cy={74} r={4} fill={CAL} /><circle cx={100} cy={124} r={4} fill={CAL} />
    <T x={78} y={30} t="Front: anterior zones (upper / lower)" s={8.5} c="#dfe6e8" />
    <T x={78} y={208} t="● BLUE upper and lower points" s={8.5} c={CAL} />
    <T x={78} y={220} t="Sternum → anterior axillary line" s={7.5} c={MUTED} />
    {/* Side view */}
    <g>
      <path d="M200,40 Q238,30 262,48 L270,120 Q268,170 254,196 L212,196 Q198,160 196,110 Z" fill={SKIN} stroke={LINE} />
      <path d="M228,50 L226,196" stroke={DOP} strokeWidth={0.8} strokeDasharray="3 2" />
      <path d="M254,52 L262,190" stroke={DOP} strokeWidth={0.8} strokeDasharray="3 2" />
      <path d="M200,112 L268,112" stroke={DOP} strokeWidth={0.8} strokeDasharray="3 2" />
      <circle cx={256} cy={164} r={4.5} fill={RED} />
      <T x={233} y={30} t="Side: lateral and posterior" s={8.5} c="#dfe6e8" />
      <T x={212} y={208} t="anterior" s={7} c={MUTED} />
      <T x={268} y={208} t="posterior" s={7} c={MUTED} />
      <T x={240} y={222} t="● PLAPS point (posterolateral, base)" s={8} c={RED} />
      <T x={240} y={233} t="12 zones = 3 per side × upper/lower × 2 sides" s={7.5} c={MUTED} />
    </g>
  </Svg>
);

// ---------- Diaphragm ----------
export const DiaphragmPlacement = () => (
  <Svg h={226} label="Diaphragm excursion and thickness">
    <TorsoFront x={64} y={92} s={0.95} />
    <Probe x={46} y={104} r={-60} />
    <T x={46} y={128} t="Excursion: curvilinear," s={8} c={CAL} />
    <T x={46} y={138} t="subcostal mid-clavicular," s={8} c={CAL} />
    <T x={46} y={148} t="aim at the dome" s={8} c={CAL} />
    <Probe x={8} y={86} r={90} w={12} />
    <T x={6} y={62} t="Thickness: linear," s={8} c={DOP} a="start" />
    <T x={6} y={72} t="8–10th ICS mid-axillary" s={8} c={DOP} a="start" />
    {/* M-mode */}
    <g>
      <rect x={140} y={22} width={150} height={78} fill="#15191c" stroke={LINE} />
      <path d={Array.from({ length: 61 }, (_, i) => `${i ? "L" : "M"}${140 + i * 2.5},${70 - 26 * Math.max(0, Math.sin((i / 60) * Math.PI * 3))}`).join(" ")} stroke={WHITE} strokeWidth={2} fill="none" />
      <line x1={180} y1={70} x2={180} y2={44} stroke={CAL} /><line x1={174} y1={70} x2={186} y2={70} stroke={CAL} /><line x1={174} y1={44} x2={186} y2={44} stroke={CAL} />
      <T x={188} y={58} t="excursion" s={8} c={CAL} a="start" />
      <T x={215} y={114} t="M-mode: quiet breathing < 10 mm = dysfunction" s={7.5} c={MUTED} />
    </g>
    {/* Thickness */}
    <g>
      <rect x={140} y={128} width={150} height={78} fill="#15191c" stroke={LINE} />
      <rect x={140} y={150} width={150} height={6} fill={WHITE} opacity={0.85} />
      <rect x={140} y={156} width={150} height={10} fill="#2a3134" />
      <rect x={140} y={166} width={150} height={6} fill={WHITE} opacity={0.85} />
      <T x={146} y={146} t="pleura" s={7} c={MUTED} a="start" />
      <T x={146} y={182} t="peritoneum" s={7} c={MUTED} a="start" />
      <line x1={250} y1={150} x2={250} y2={172} stroke={DOP} strokeWidth={1.2} />
      <T x={256} y={164} t="Tdi" s={8.5} c={DOP} a="start" />
      <T x={215} y={218} t="DTF = (Tinsp − Texp) / Texp; ≥ 30% favours weaning" s={7.5} c={MUTED} />
    </g>
  </Svg>
);

// ---------- Cardiac Doppler sample positions ----------
export const CardiacGates = () => (
  <Svg h={240} label="Cardiac Doppler sample positions">
    {/* A4C */}
    <g>
      <T x={74} y={14} t="Apical 4 chamber" s={9} b />
      <path d="M74,22 L10,178 A170,170 0 0,0 138,178 Z" fill="#15191c" stroke={LINE} />
      <path d="M74,30 Q100,60 104,112 L80,112 Q80,70 74,40 Z" fill={DARK} stroke="#8d979b" strokeWidth={5} />
      <path d="M72,40 Q50,70 50,112 L68,112 Q68,70 72,40 Z" fill={DARK} stroke="#8d979b" strokeWidth={4} />
      <ellipse cx={92} cy={140} rx={18} ry={22} fill={DARK} stroke="#8d979b" strokeWidth={2} />
      <ellipse cx={58} cy={140} rx={14} ry={20} fill={DARK} stroke="#8d979b" strokeWidth={2} />
      <path d="M80,114 L88,124 M104,114 L98,124" stroke={WHITE} strokeWidth={2} />
      <T x={96} y={84} t="LV" s={8} c={MUTED} /><T x={58} y={84} t="RV" s={8} c={MUTED} />
      <T x={92} y={144} t="LA" s={8} c={MUTED} /><T x={58} y={144} t="RA" s={8} c={MUTED} />
      <Beam x1={74} y1={22} x2={92} y2={122} />
      <Gate x={91} y={118} ang={-10} c={DOP} />
      <T x={140} y={104} t="① Mitral E/A: leaflet tips" s={8} c={DOP} a="end" />
      <Gate x={80} y={113} ang={0} c={CAL} />
      <Gate x={105} y={113} ang={0} c={CAL} />
      <T x={140} y={126} t="② e′: septal + lateral annulus" s={8} c={CAL} a="end" />
      <Beam x1={74} y1={22} x2={63} y2={126} c={RED} />
      <T x={8} y={60} t="③ TR CW" s={8} c={RED} a="start" />
      <Gate x={104} y={160} ang={-30} c={WHITE} />
      <T x={140} y={174} t="④ Pulm. vein: 1–2 cm in" s={8} c={WHITE} a="end" />
    </g>
    {/* A5C */}
    <g>
      <T x={226} y={14} t="Apical 5 chamber" s={9} b />
      <path d="M226,22 L162,178 A170,170 0 0,0 290,178 Z" fill="#15191c" stroke={LINE} />
      <path d="M226,30 Q256,62 256,112 L232,116 Q230,70 226,40 Z" fill={DARK} stroke="#8d979b" strokeWidth={5} />
      <path d="M224,40 Q200,70 202,112 L220,112 Q222,70 224,40 Z" fill={DARK} stroke="#8d979b" strokeWidth={4} />
      <path d="M232,116 Q232,132 228,146 L240,146 Q244,132 246,116 Z" fill={DARK} stroke="#8d979b" strokeWidth={2} />
      <path d="M230,130 L238,124 M246,130 L238,124" stroke={WHITE} strokeWidth={1.8} />
      <ellipse cx={262} cy={150} rx={16} ry={18} fill={DARK} stroke="#8d979b" strokeWidth={2} />
      <T x={246} y={84} t="LV" s={8} c={MUTED} /><T x={234} y={160} t="Ao" s={8} c={MUTED} />
      <Beam x1={226} y1={22} x2={238} y2={140} />
      <Gate x={237} y={117} ang={-6} c={DOP} />
      <T x={168} y={104} t="⑤ LVOT PW:" s={8} c={DOP} a="start" />
      <T x={168} y={114} t="0.5–1 cm below AV" s={8} c={DOP} a="start" />
      <T x={168} y={140} t="⑥ AV CW through" s={8} c={CAL} a="start" />
      <T x={168} y={150} t="the valve (+ other windows)" s={8} c={CAL} a="start" />
    </g>
    <T x={150} y={196} t="Align the cursor with flow (< 20°); colour first, then PW/CW" s={8} c={MUTED} />
    <T x={150} y={208} t="IVRT: CW/PW between LVOT and mitral inflow (A5C)" s={8} c={MUTED} />
    <T x={150} y={222} t="RVOT VTI: PSAX AV level, PW just below the pulmonary valve" s={8} c={MUTED} />
  </Svg>
);
