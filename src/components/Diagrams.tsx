import React, { createContext, useContext, useId } from "react";

/**
 * Original teaching diagrams drawn to look like echo images (not to scale, not real patient images).
 * Each view is drawn twice from the same JSX: an "image" layer (myocardium, blood pools, valves) that
 * gets ultrasound speckle, depth attenuation and near-field clutter, and an "annotation" layer
 * (labels, callipers, Doppler cursors) drawn crisp on top.
 */

const LABEL = "#ffffff";
const CAL = "#F2B33D";
const DOP = "#4FC3B8";
const MUTED = "#9aa6ab";

// Image-layer greys (before speckle)
const MYO = "#98a1a4";      // myocardium
const BRIGHT = "#eef2f3";   // pericardium, annulus, valve, calcium
const SOFT = "#5c6467";     // liver, background tissue
const BLOOD = "#030405";

const FAN = "M150,8 L-4,182 A232,232 0 0,0 304,182 Z";
const FONT = "Carlito, Calibri, 'Segoe UI', system-ui, sans-serif";

type Layer = "img" | "anno";
const LayerCtx = createContext<Layer>("img");
const useLayer = () => useContext(LayerCtx);

/** Shared arrowheads; each svg gets its own copy so diagrams work on their own. */
const Defs: React.FC<{ id: string }> = ({ id }) => (
  <>
    <marker id={`arr-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={CAL} /></marker>
    <marker id={`arrd-${id}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill={DOP} /></marker>
  </>
);
const IdCtx = createContext("x");

const Frame: React.FC<{ children: React.ReactNode; title: string; caption?: string; h?: number; seed?: number }> = ({ children, title, caption, h = 262, seed = 4 }) => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox={`-12 0 324 ${h}`} role="img" aria-label={title} className="w-full h-auto rounded-xl" style={{ background: "#000" }}>
      <defs>
        <Defs id={id} />
        <clipPath id={`clip-${id}`}><path d={FAN} /></clipPath>
        {/* Ultrasound speckle: multiply the drawing by fine grey noise, then soften slightly */}
        <filter id={`spk-${id}`} x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
          {/* 1. warp edges a little so walls look organic, not drawn */}
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves={2} seed={seed + 1} result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale={5} xChannelSelector="R" yChannelSelector="G" result="w" />
          <feGaussianBlur in="w" stdDeviation={0.7} result="wb" />
          {/* 2. speckle: grains elongated across the beam, high contrast */}
          <feTurbulence type="fractalNoise" baseFrequency="0.32 0.75" numOctaves={2} seed={seed} result="n" />
          <feColorMatrix in="n" type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1" result="g0" />
          <feComponentTransfer in="g0" result="g">
            <feFuncR type="linear" slope={3} intercept={-0.95} /><feFuncG type="linear" slope={3} intercept={-0.95} /><feFuncB type="linear" slope={3} intercept={-0.95} />
          </feComponentTransfer>
          <feComposite in="wb" in2="g" operator="arithmetic" k1={1.25} k2={0.32} k3={0} k4={-0.03} result="s" />
          <feGaussianBlur in="s" stdDeviation={0.3} />
        </filter>
        {/* Blood isn't perfectly black: faint noise */}
        <filter id={`haze-${id}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves={1} seed={seed + 3} />
          <feColorMatrix type="matrix" values="0 0 0 0 0.16  0 0 0 0 0.17  0 0 0 0 0.18  0 0 0 0.5 -0.18" />
        </filter>
        <radialGradient id={`att-${id}`} cx="150" cy="8" r="240" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#000" stopOpacity={0} />
          <stop offset="0.55" stopColor="#000" stopOpacity={0.05} />
          <stop offset="1" stopColor="#000" stopOpacity={0.6} />
        </radialGradient>
        <linearGradient id={`edge-${id}`} x1="-4" y1="0" x2="304" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#000" stopOpacity={0.55} />
          <stop offset="0.16" stopColor="#000" stopOpacity={0} />
          <stop offset="0.84" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.55} />
        </linearGradient>
        <radialGradient id={`nf-${id}`} cx="150" cy="8" r="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#dfe5e7" stopOpacity={0.55} />
          <stop offset="1" stopColor="#dfe5e7" stopOpacity={0} />
        </radialGradient>
      </defs>
      <IdCtx.Provider value={id}>
        <g clipPath={`url(#clip-${id})`}>
          <g filter={`url(#spk-${id})`}>
            <path d={FAN} fill="#262b2e" />
            <LayerCtx.Provider value="img">{children}</LayerCtx.Provider>
            <path d={FAN} fill={`url(#nf-${id})`} />
          </g>
          <path d={FAN} filter={`url(#haze-${id})`} opacity={0.6} style={{ mixBlendMode: "screen" }} />
          <path d={FAN} fill={`url(#att-${id})`} />
          <path d={FAN} fill={`url(#edge-${id})`} />
        </g>
        <path d={FAN} fill="none" stroke="#3b4246" strokeWidth={0.8} />
        <LayerCtx.Provider value="anno">{children}</LayerCtx.Provider>
        <circle cx={150} cy={8} r={3} fill={CAL} />
        {caption && <text x={150} y={h - 7} textAnchor="middle" fontSize={10} fill={MUTED} fontFamily={FONT}>{caption}</text>}
      </IdCtx.Provider>
    </svg>
  );
};

// ---------- Image-layer primitives ----------
/** Cavity (blood) with a myocardial wall of thickness w drawn around its edge. */
const Cav: React.FC<{ d: string; w?: number; wall?: string }> = ({ d, w = 9, wall = MYO }) =>
  useLayer() === "img" ? <path d={d} fill={BLOOD} stroke={wall} strokeWidth={w} strokeLinejoin="round" /> : null;
const Wall: React.FC<{ d: string; w?: number; c?: string }> = ({ d, w = 9, c = MYO }) =>
  useLayer() === "img" ? <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" /> : null;
const Fill: React.FC<{ d: string; c?: string; o?: number }> = ({ d, c = SOFT, o = 1 }) =>
  useLayer() === "img" ? <path d={d} fill={c} opacity={o} /> : null;
const Blood: React.FC<{ d: string }> = ({ d }) => (useLayer() === "img" ? <path d={d} fill={BLOOD} /> : null);
const Leaflet: React.FC<{ d: string; w?: number }> = ({ d, w = 2.6 }) =>
  useLayer() === "img" ? <path d={d} fill="none" stroke={BRIGHT} strokeWidth={w} strokeLinecap="round" /> : null;
const Peri: React.FC<{ d: string; w?: number }> = ({ d, w = 4 }) =>
  useLayer() === "img" ? <path d={d} fill="none" stroke={BRIGHT} strokeWidth={w} strokeLinecap="round" opacity={0.9} /> : null;
const Circ: React.FC<{ cx: number; cy: number; r: number; w?: number; fill?: string; stroke?: string }> = ({ cx, cy, r, w = 6, fill = BLOOD, stroke = MYO }) =>
  useLayer() === "img" ? <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={w} /> : null;
const Ell: React.FC<{ cx: number; cy: number; rx: number; ry: number; w?: number; rot?: number }> = ({ cx, cy, rx, ry, w = 5, rot = 0 }) =>
  useLayer() === "img" ? <ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={`rotate(${rot} ${cx} ${cy})`} fill={BLOOD} stroke={MYO} strokeWidth={w} /> : null;

// ---------- Annotation primitives ----------
const L: React.FC<{ x: number; y: number; t: string; a?: "start" | "middle" | "end"; s?: number; c?: string }> = ({ x, y, t, a = "middle", s = 11, c = LABEL }) =>
  useLayer() === "anno" ? (
    <text x={x} y={y} textAnchor={a} fontSize={s} fill={c} fontFamily={FONT} fontWeight={700} style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 3, strokeLinejoin: "round" }}>{t}</text>
  ) : null;
const Cal: React.FC<{ x1: number; y1: number; x2: number; y2: number; t?: string; tx?: number; ty?: number; a?: "start" | "middle" | "end" }> = ({ x1, y1, x2, y2, t, tx, ty, a = "start" }) => {
  if (useLayer() !== "anno") return null;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={CAL} strokeWidth={1.6} strokeDasharray="3 3" />
      {[[x1, y1], [x2, y2]].map(([x, y], i) => <path key={i} d={`M${x - 3},${y - 3} L${x + 3},${y + 3} M${x - 3},${y + 3} L${x + 3},${y - 3}`} stroke={CAL} strokeWidth={1.8} />)}
      {t && <text x={tx ?? (x1 + x2) / 2 + 5} y={ty ?? (y1 + y2) / 2 + 3} textAnchor={a} fontSize={10} fill={CAL} fontFamily={FONT} fontWeight={700} style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 3 }}>{t}</text>}
    </g>
  );
};
const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; c?: string }> = ({ x1, y1, x2, y2, c = CAL }) => {
  const id = useContext(IdCtx);
  return useLayer() === "anno" ? <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={c} strokeWidth={2} markerEnd={`url(#${c === DOP ? "arrd" : "arr"}-${id})`} /> : null;
};
/** Doppler cursor from the probe with a sample-volume gate. */
const Beam: React.FC<{ x2: number; y2: number; t?: string; tx?: number; ty?: number; a?: "start" | "middle" | "end"; cw?: boolean }> = ({ x2, y2, t, tx, ty, a = "start", cw }) =>
  useLayer() === "anno" ? (
    <g>
      <line x1={150} y1={8} x2={cw ? 150 + (x2 - 150) * 1.4 : x2} y2={cw ? 8 + (y2 - 8) * 1.4 : y2} stroke={DOP} strokeWidth={1.2} strokeDasharray="2 3" />
      {!cw && <path d={`M${x2 - 5},${y2 - 3} L${x2 + 5},${y2 - 3} M${x2 - 5},${y2 + 3} L${x2 + 5},${y2 + 3}`} stroke={DOP} strokeWidth={1.8} />}
      {t && <text x={tx ?? x2 + 8} y={ty ?? y2 + 3} textAnchor={a} fontSize={10} fill={DOP} fontFamily={FONT} fontWeight={700} style={{ paintOrder: "stroke", stroke: "#000", strokeWidth: 3 }}>{t}</text>}
    </g>
  ) : null;
const Ring: React.FC<{ x: number; y: number; c?: string }> = ({ x, y, c = DOP }) => (useLayer() === "anno" ? <circle cx={x} cy={y} r={4.5} fill="none" stroke={c} strokeWidth={1.6} /> : null);

// ---------- Views ----------
const Plax = () => (
  <Frame title="Parasternal long axis" caption="Linear LV measurements at the mitral leaflet tips" seed={5}>
    {/* chest wall / near field */}
    <Fill d="M60,26 Q150,18 240,30 L250,40 Q150,30 52,38 Z" c="#5e6669" />
    {/* RV free wall and RVOT */}
    <Wall d="M22,46 Q120,34 270,44" w={6} />
    <Blood d="M18,52 Q120,40 280,50 L282,66 Q170,60 18,70 Z" />
    {/* septum continuing into anterior aortic wall */}
    <Wall d="M0,76 Q90,70 176,74 Q200,74 216,70 L300,68" w={11} />
    {/* LV cavity */}
    <Blood d="M0,84 Q90,80 178,82 Q196,98 192,126 Q150,134 60,132 L0,130 Z" />
    {/* posterior wall + pericardium */}
    <Wall d="M0,138 Q100,140 180,134 Q194,132 202,140" w={12} />
    <Peri d="M0,148 Q110,152 196,146 Q236,150 300,168" w={4} />
    {/* aortic root and posterior aortic wall into AMVL */}
    <Blood d="M196,78 L300,74 L300,104 L198,108 Z" />
    <Wall d="M194,110 L300,106" w={7} />
    <Leaflet d="M206,80 Q214,92 210,92 M206,106 Q214,96 210,94" w={2} />
    {/* mitral leaflets (diastole) */}
    <Leaflet d="M192,110 Q176,118 160,124" w={3} />
    <Leaflet d="M200,140 Q190,136 176,132" w={3} />
    {/* LA and descending aorta */}
    <Cav d="M200,114 Q248,108 262,128 Q266,156 232,164 Q204,162 198,142 Z" w={5} />
    <Circ cx={232} cy={182} r={9} w={4} />
    {/* labels */}
    <L x={110} y={62} t="RV" />
    <L x={80} y={112} t="LV" s={13} />
    <L x={252} y={94} t="Ao" />
    <L x={232} y={140} t="LA" />
    <L x={246} y={186} t="DAo" a="start" s={10} />
    <L x={40} y={160} t="Post. wall" s={9} a="start" c={MUTED} />
    <Cal x1={150} y1={82} x2={150} y2={131} t="LVIDd" tx={155} ty={108} />
    <Cal x1={128} y1={70} x2={128} y2={80} t="IVSd" tx={123} ty={66} a="end" />
    <Cal x1={128} y1={133} x2={128} y2={144} t="PWd" tx={123} ty={153} a="end" />
    <Cal x1={190} y1={82} x2={192} y2={108} t="LVOT" tx={186} ty={122} a="end" />
    <Cal x1={226} y1={77} x2={226} y2={106} t="Root" tx={230} ty={120} />
  </Frame>
);

const PsaxAv = () => (
  <Frame title="PSAX aortic valve level" caption="Aortic valve 'Mercedes sign' in diastole" seed={7}>
    <Wall d="M44,58 Q150,28 262,64" w={6} />
    <Blood d="M48,64 Q150,36 258,70 L250,92 Q200,80 178,96 L124,96 Q102,84 60,90 Z" />
    {/* aortic root with three cusps */}
    <Circ cx={150} cy={124} r={27} w={7} />
    <Leaflet d="M150,124 L150,98 M150,124 L127,137 M150,124 L173,137" w={2.4} />
    {/* atria */}
    <Cav d="M58,150 Q90,140 120,152 Q132,180 112,200 Q80,206 64,190 Q52,170 58,150 Z" w={5} />
    <Cav d="M162,154 Q200,144 232,156 Q246,180 228,202 Q192,212 168,198 Q156,176 162,154 Z" w={5} />
    {/* RVOT -> PA */}
    <Cav d="M244,92 Q266,110 270,150 L292,152 Q290,110 262,82 Z" w={5} />
    <Leaflet d="M248,96 L258,104 M262,88 L262,100" w={2} />
    {/* TV */}
    <Leaflet d="M58,116 L72,128 M64,96 L74,110" w={2.4} />
    <L x={150} y={64} t="RVOT" />
    <L x={150} y={162} t="AV" s={10} c={MUTED} />
    <L x={90} y={180} t="RA" />
    <L x={198} y={182} t="LA" />
    <L x={280} y={172} t="PA" s={10} />
    <L x={46} y={110} t="TV" s={10} />
    <Beam x2={252} y2={100} t="RVOT PW" tx={236} ty={124} a="end" />
  </Frame>
);

const PsaxPm = () => (
  <Frame title="PSAX papillary muscle level" caption="Round LV = on-axis. D-shaped LV = RV loading" seed={9}>
    <Wall d="M38,58 Q150,26 262,58" w={6} />
    <Blood d="M44,64 Q150,34 256,64 Q238,90 214,98 Q150,76 86,98 Q62,90 44,64 Z" />
    <Circ cx={150} cy={150} r={50} w={20} />
    <Peri d="M88,190 Q150,232 212,190" w={4} />
    <Circ cx={180} cy={170} r={9} w={0} fill={MYO} />
    <Circ cx={124} cy={176} r={9} w={0} fill={MYO} />
    <L x={150} y={62} t="RV" />
    <L x={150} y={146} t="LV" s={13} />
    <L x={150} y={102} t="Septum" s={9} c={MUTED} />
    <L x={202} y={198} t="AL pap" s={9} a="start" />
    <L x={98} y={202} t="PM pap" s={9} a="end" />
  </Frame>
);

const PsaxMv = () => (
  <Frame title="PSAX mitral valve level" caption="Scan to the leaflet tips to planimeter MVA" seed={11}>
    <Wall d="M38,58 Q150,26 262,58" w={6} />
    <Blood d="M44,64 Q150,34 256,64 Q238,90 214,98 Q150,76 86,98 Q62,90 44,64 Z" />
    <Circ cx={150} cy={150} r={54} w={14} />
    <Leaflet d="M108,142 Q150,118 192,142" w={4} />
    <Leaflet d="M110,160 Q150,180 190,160" w={4} />
    <L x={150} y={62} t="RV" />
    <L x={150} y={118} t="AMVL" s={9} />
    <L x={150} y={192} t="PMVL" s={9} />
    {annoShape(<ellipse cx={150} cy={151} rx={24} ry={10} fill="none" stroke={CAL} strokeWidth={1.6} strokeDasharray="3 3" />)}
    <L x={204} y={154} t="Planimetry" s={10} c={CAL} a="start" />
  </Frame>
);

const A4c = () => (
  <Frame title="Apical four chamber" caption="True apex: long, bullet-shaped LV that doesn't move" seed={13}>
    {/* LV (screen right) */}
    <Blood d="M158,28 Q206,58 222,104 Q230,128 228,148 L160,148 L158,40 Z" />
    <Wall d="M157,27 Q206,58 222,104 Q230,128 228,150" w={10} />
    {/* RV (screen left), thinner, shorter */}
    <Blood d="M145,44 Q104,72 86,112 Q78,132 78,142 L146,142 Z" />
    <Wall d="M147,42 Q104,72 86,112 Q78,132 78,144" w={5} />
    <Wall d="M151,22 Q150,90 154,146" w={11} />
    {/* pericardium */}
    <Peri d="M240,96 Q248,140 244,176" />
    <Peri d="M68,108 Q58,140 62,172" w={3} />
    {/* atria */}
    <Blood d="M160,150 L228,150 Q240,184 222,210 Q192,222 168,208 Q156,186 160,150 Z" />
    <Wall d="M228,152 Q242,184 222,210 Q192,222 168,208" w={5} />
    <Blood d="M80,146 L146,144 Q148,182 134,206 Q104,214 84,200 Q72,178 80,146 Z" />
    <Wall d="M80,148 Q70,178 84,200 Q104,214 134,206" w={4} />
    <Wall d="M155,150 Q152,182 152,212" w={3} c={SOFT} />
    {/* valves: TV septal insertion slightly more apical */}
    <Leaflet d="M228,150 L214,170 M160,150 L176,168" w={3} />
    <Leaflet d="M80,144 L94,160 M146,141 L132,156" w={3} />
    {/* pulmonary vein */}
    <Blood d="M206,212 Q214,224 226,232 L234,226 Q222,218 216,208 Z" />
    <L x={196} y={104} t="LV" s={13} />
    <L x={114} y={110} t="RV" s={13} />
    <L x={198} y={188} t="LA" />
    <L x={112} y={184} t="RA" />
    <Cal x1={82} y1={130} x2={144} y2={130} t="RV basal" tx={113} ty={124} a="middle" />
    <Beam x2={194} y2={160} t="Inflow PW" tx={232} ty={140} a="start" />
    <Ring x={228} y={150} />
    <L x={236} y={162} t="lat e′" s={9} c={DOP} a="start" />
    <Ring x={160} y={150} />
    <L x={166} y={140} t="sept e′" s={9} c={DOP} a="start" />
    <Arrow x1={72} y1={150} x2={72} y2={128} />
    <L x={66} y={160} t="TAPSE" s={9} c={CAL} a="end" />
  </Frame>
);

const A5c = () => (
  <Frame title="Apical five chamber" caption="Tilt anteriorly to open the LVOT; align the beam with flow" seed={15}>
    <Blood d="M158,28 Q206,58 222,104 Q230,128 226,144 L196,144 L192,136 L160,136 L158,40 Z" />
    <Wall d="M157,27 Q206,58 222,104 Q230,128 226,146" w={10} />
    <Blood d="M145,44 Q104,72 86,112 Q78,132 78,142 L146,142 Z" />
    <Wall d="M147,42 Q104,72 86,112 Q78,132 78,144" w={5} />
    <Wall d="M151,22 Q150,90 156,136" w={11} />
    {/* LVOT and aortic valve */}
    <Blood d="M160,138 L192,138 L198,176 L162,178 Z" />
    <Wall d="M160,140 L160,182" w={5} />
    <Wall d="M194,140 L200,180" w={5} />
    <Leaflet d="M164,170 L178,162 M196,168 L182,162" w={2.6} />
    <Cav d="M206,156 Q236,150 246,172 Q246,200 222,206 Q204,204 202,184 Z" w={4} />
    <Cav d="M84,152 Q114,146 144,154 Q148,182 134,206 Q104,214 84,200 Q72,178 84,152 Z" w={4} />
    <Peri d="M240,96 Q248,140 252,170" />
    <L x={198} y={102} t="LV" s={13} />
    <L x={114} y={110} t="RV" s={13} />
    <L x={180} y={194} t="AV" s={10} c={MUTED} />
    <L x={226} y={186} t="LA" />
    <L x={112} y={186} t="RA" />
    <Beam x2={176} y2={152} t="LVOT PW" tx={202} ty={150} a="start" />
  </Frame>
);

const A2c = () => (
  <Frame title="Apical two chamber" caption="No RV in view; anterior wall right, inferior left" seed={17}>
    <Blood d="M150,26 Q206,60 222,108 Q228,130 226,148 L84,148 Q82,128 88,108 Q100,60 150,26 Z" />
    <Wall d="M84,150 Q82,128 88,108 Q100,60 150,25 Q206,60 222,108 Q228,130 226,150" w={10} />
    <Peri d="M72,104 Q62,140 68,172" w={3} />
    <Peri d="M238,104 Q248,140 242,172" w={3} />
    <Blood d="M86,150 L224,150 Q230,186 206,210 Q150,224 104,208 Q80,184 86,150 Z" />
    <Wall d="M224,152 Q232,186 206,210 Q150,224 104,208 Q80,184 86,152" w={5} />
    <Leaflet d="M86,150 L104,168 M224,150 L206,168" w={3} />
    <Circ cx={232} cy={176} r={7} w={3} />
    <L x={155} y={98} t="LV" s={13} />
    <L x={155} y={190} t="LA" />
    <L x={102} y={128} t="Inferior" s={9} c={MUTED} />
    <L x={208} y={128} t="Anterior" s={9} c={MUTED} />
    <L x={244} y={188} t="CS" s={9} a="start" />
  </Frame>
);

const Sc4c = () => (
  <Frame title="Subcostal four chamber" caption="Often the best window when ventilated" seed={19}>
    {/* liver */}
    <Fill d="M-10,8 L310,8 L310,66 Q150,86 -10,58 Z" c="#6a7275" />
    <Peri d="M40,78 Q150,64 262,92" w={4} />
    {/* RV nearest the probe */}
    <Cav d="M58,86 Q160,72 250,98 L238,122 Q160,104 76,114 Z" w={5} />
    <Wall d="M70,118 Q160,108 238,126" w={10} />
    <Cav d="M80,128 Q160,118 234,134 L250,182 Q168,198 92,172 Z" w={10} />
    <Peri d="M96,184 Q170,206 254,190" w={3} />
    <Cav d="M38,128 Q64,118 78,140 Q80,168 58,176 Q36,170 32,150 Z" w={4} />
    <Cav d="M80,190 Q108,180 128,198 Q126,220 100,226 Q80,222 76,206 Z" w={4} />
    <L x={60} y={40} t="Liver" c={MUTED} />
    <L x={160} y={102} t="RV" />
    <L x={170} y={160} t="LV" s={13} />
    <L x={56} y={152} t="RA" />
    <L x={102} y={210} t="LA" />
    <Cal x1={196} y1={80} x2={196} y2={92} t="RV free wall" tx={200} ty={76} />
  </Frame>
);

const Ivc = () => (
  <Frame title="Subcostal IVC" caption="Measure 1–2 cm from the RA, perpendicular to the IVC" seed={21}>
    <Fill d="M-10,8 L310,8 L310,226 L-10,226 Z" c="#646c6f" />
    <Peri d="M-10,118 Q120,108 210,114 Q240,112 262,98" w={3} />
    <Blood d="M-10,124 Q100,116 206,120 Q238,122 262,106 L276,138 Q240,150 206,148 Q100,152 -10,154 Z" />
    <Peri d="M-10,158 Q110,156 206,152 Q244,152 278,142" w={3} />
    <Blood d="M108,86 Q122,100 128,120 L142,120 Q134,96 120,80 Z" />
    <Cav d="M262,96 Q300,96 310,130 Q300,166 270,162 Z" w={4} />
    <L x={60} y={60} t="Liver" c={MUTED} />
    <L x={60} y={142} t="IVC" />
    <L x={286} y={134} t="RA" s={10} />
    <L x={146} y={98} t="Hepatic v." s={9} a="start" />
    <Cal x1={204} y1={121} x2={204} y2={149} t="IVC" tx={208} ty={176} />
  </Frame>
);

const Ssn = () => (
  <Frame title="Suprasternal notch" caption="CW in the descending aorta: coarctation, AR flow reversal" seed={23}>
    <Cav d="M36,176 Q56,72 150,60 Q244,72 264,176 L240,178 Q224,96 150,86 Q78,96 60,176 Z" w={5} />
    <Wall d="M110,66 L100,20 M150,60 L150,14 M190,66 L200,22" w={8} />
    <Ell cx={150} cy={132} rx={20} ry={14} w={4} />
    <L x={52} y={196} t="Asc Ao" />
    <L x={250} y={196} t="Desc Ao" />
    <L x={150} y={136} t="RPA" s={10} />
    <Beam x2={226} y2={128} t="CW" tx={232} ty={118} a="start" cw />
  </Frame>
);

/** Raw annotation shape (only drawn on the annotation layer). */
function annoShape(el: React.ReactElement) { return <AnnoOnly>{el}</AnnoOnly>; }
const AnnoOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (useLayer() === "anno" ? <>{children}</> : null);

// ---------- Concepts ----------
const Windows = () => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 300 260" role="img" aria-label="Acoustic windows" className="w-full h-auto rounded-xl" style={{ background: "#05070a" }}>
      <defs><Defs id={id} /></defs>
      <LayerCtx.Provider value="anno">
        <path d="M90,20 Q150,6 210,20 L232,80 L228,200 Q150,232 72,200 L68,80 Z" fill="#2b3439" stroke="#8a979e" />
        <line x1={150} y1={22} x2={150} y2={150} stroke="#8a979e" strokeWidth={6} />
        <path d="M136,150 L150,166 L164,150" fill="#8a979e" />
        {[48, 70, 92, 114, 136].map((y) => <path key={y} d={`M80,${y + 4} Q115,${y - 6} 146,${y} M154,${y} Q185,${y - 6} 220,${y + 4}`} stroke="#3e4a50" fill="none" strokeWidth={4} />)}
        <path d="M150,96 Q190,90 196,128 Q182,150 150,146 Z" fill="#7a2f2f" opacity={0.7} />
        {([[150, 14, "Suprasternal"], [134, 84, "Parasternal"], [188, 140, "Apical"], [150, 178, "Subcostal"]] as const).map(([x, y, t]) => (
          <g key={t}>
            <circle cx={x} cy={y} r={7} fill="none" stroke={CAL} strokeWidth={2.4} />
            <L x={x + (t === "Parasternal" ? -12 : 12)} y={y + 4} t={t} a={t === "Parasternal" ? "end" : "start"} s={11} c={CAL} />
          </g>
        ))}
        <L x={150} y={248} t="Left lateral position for parasternal and apical windows" s={10} c={MUTED} />
      </LayerCtx.Provider>
    </svg>
  );
};

const DopplerAngle = () => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 300 220" role="img" aria-label="Doppler angle" className="w-full h-auto rounded-xl" style={{ background: "#05070a" }}>
      <defs><Defs id={id} /></defs>
      <IdCtx.Provider value={id}>
        <LayerCtx.Provider value="anno">
          <line x1={40} y1={160} x2={270} y2={160} stroke="#8a979e" strokeWidth={10} strokeLinecap="round" />
          <line x1={60} y1={160} x2={250} y2={160} stroke={BLOOD} strokeWidth={6} />
          <Arrow x1={100} y1={160} x2={220} y2={160} />
          <L x={160} y={184} t="True flow velocity V" c={CAL} />
          <Arrow x1={80} y1={30} x2={160} y2={160} c={DOP} />
          <path d="M128,108 A40,40 0 0,1 146,150" fill="none" stroke={LABEL} />
          <L x={146} y={128} t="θ" s={14} a="start" />
          <L x={60} y={24} t="Doppler beam" c={DOP} a="start" />
          <L x={150} y={208} t="Measured = V × cos θ: 20° → 6% low, 30° → 13%, 60° → 50%" s={10} c={MUTED} />
        </LayerCtx.Provider>
      </IdCtx.Provider>
    </svg>
  );
};

const Pisa = () => {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 300 230" role="img" aria-label="PISA" className="w-full h-auto rounded-xl" style={{ background: "#05070a" }}>
      <defs><Defs id={id} /></defs>
      <IdCtx.Provider value={id}>
        <LayerCtx.Provider value="anno">
          <rect x={0} y={0} width={300} height={120} fill="#0b2a52" />
          <rect x={0} y={128} width={300} height={102} fill="#5a1414" opacity={0.6} />
          <line x1={0} y1={124} x2={136} y2={124} stroke="#e8edf0" strokeWidth={6} />
          <line x1={164} y1={124} x2={300} y2={124} stroke="#e8edf0" strokeWidth={6} />
          <path d="M100,124 A50,50 0 0,1 200,124" fill="#d64b2a" opacity={0.85} />
          <path d="M118,124 A32,32 0 0,1 182,124" fill="#f3d23a" opacity={0.9} />
          <Arrow x1={150} y1={124} x2={150} y2={74} />
          <L x={156} y={98} t="r" s={14} c={CAL} a="start" />
          <path d="M140,128 Q150,190 136,226 M160,128 Q150,190 164,226" stroke="#f08b6a" strokeWidth={3} fill="none" />
          <L x={20} y={44} t="LV (blue: flow towards probe)" s={10} a="start" />
          <L x={20} y={162} t="LA" a="start" />
          <L x={206} y={100} t="Aliasing line = Va" s={10} a="start" c="#f3d23a" />
          <L x={150} y={22} t="EROA = 2πr² × Va / Vmax" s={12} c={CAL} />
        </LayerCtx.Provider>
      </IdCtx.Provider>
    </svg>
  );
};

/** Spectral Doppler-style traces: filled grey envelopes on a dark background. */
const Spectral: React.FC<{ x: number; y: number; peaks: [number, number]; down?: boolean; label?: string }> = ({ x, y, peaks, down, label }) => {
  const s = down ? 1 : -1;
  const [p1, p2] = peaks;
  const d = `M${x + 2},${y} C${x + 8},${y + s * p1 * 1.1} ${x + 14},${y + s * p1} ${x + 26},${y} M${x + 32},${y} C${x + 37},${y + s * p2 * 1.1} ${x + 42},${y + s * p2} ${x + 54},${y}`;
  return (
    <g>
      <line x1={x} y1={y} x2={x + 62} y2={y} stroke="#59656c" />
      <path d={d} fill="#cfd6d9" opacity={0.85} stroke="#ffffff" strokeWidth={0.8} />
      {label && <L x={x + 31} y={y + (down ? 44 : 22)} t={label} s={10} />}
    </g>
  );
};
const Inflow = () => (
  <svg viewBox="0 0 300 214" role="img" aria-label="Diastolic filling patterns" className="w-full h-auto rounded-xl" style={{ background: "#05070a" }}>
    <LayerCtx.Provider value="anno">
      <L x={6} y={18} t="Mitral inflow PW (E, A)" s={10} c={DOP} a="start" />
      <L x={6} y={118} t="Annular TDI (e′, a′)" s={10} c={CAL} a="start" />
      {([[8, [62, 40], [26, 16], "Normal"], [80, [34, 60], [12, 20], "Grade I"], [152, [62, 40], [12, 18], "Grade II"], [224, [74, 20], [10, 8], "Grade III"]] as const).map(([x, inflow, tdi, label]) => (
        <g key={label}>
          <Spectral x={x} y={96} peaks={inflow as unknown as [number, number]} />
          <Spectral x={x} y={130} peaks={tdi as unknown as [number, number]} down label={label} />
        </g>
      ))}
      <L x={150} y={206} t="Grade II looks normal on inflow: low e′ and high E/e′ unmask it" s={9.5} c={MUTED} />
    </LayerCtx.Provider>
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
