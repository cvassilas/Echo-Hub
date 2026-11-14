import React from "react";

/** Schematic teaching diagrams for VExUS, lung ultrasound, transcranial Doppler and optic nerve sheath. Not to scale. */

const FONT = "Carlito, Calibri, 'Segoe UI', system-ui, sans-serif";
const BG = "#05070a";
const CAL = "#F2B33D";
const DOP = "#4FC3B8";
const MUTED = "#9aa6ab";
const WAVE = "#cfd6d9";
const RED = "#E05A4F";

const T: React.FC<{ x: number; y: number; t: string; s?: number; c?: string; a?: "start" | "middle" | "end"; b?: boolean }> = ({ x, y, t, s = 9.5, c = "#ffffff", a = "middle", b }) => (
  <text x={x} y={y} fontSize={s} fill={c} textAnchor={a} fontFamily={FONT} fontWeight={b ? 700 : 400}>{t}</text>
);

const g = (t: number, mu: number, sig: number) => Math.exp(-(((t - mu) / sig) ** 2) / 2);

/** Spectral trace: f(t) for t in [0,1) per cycle; positive = above the baseline. */
const Trace: React.FC<{ x: number; y: number; w: number; amp: number; f: (t: number) => number; cycles?: number; color?: string }> = ({ x, y, w, amp, f, cycles = 2, color = WAVE }) => {
  const n = 120;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const u = (i / n) * cycles;
    pts.push(`${(x + (i / n) * w).toFixed(1)},${(y - f(u % 1) * amp).toFixed(1)}`);
  }
  return (
    <g>
      <line x1={x} y1={y} x2={x + w} y2={y} stroke="#59656c" strokeWidth={0.8} />
      <path d={`M${x},${y} L${pts.join(" L")} L${x + w},${y} Z`} fill={color} opacity={0.8} stroke="#ffffff" strokeWidth={0.6} />
    </g>
  );
};

const Svg: React.FC<{ h: number; label: string; children: React.ReactNode }> = ({ h, label, children }) => (
  <svg viewBox={`0 0 300 ${h}`} role="img" aria-label={label} className="w-full h-auto rounded-xl" style={{ background: BG }}>{children}</svg>
);

// ---------- VExUS ----------
const HV = [
  (t: number) => 0.25 * g(t, 0.05, 0.04) - 0.9 * g(t, 0.3, 0.08) - 0.55 * g(t, 0.7, 0.08) - 0.04,
  (t: number) => 0.3 * g(t, 0.05, 0.04) - 0.4 * g(t, 0.3, 0.08) - 0.85 * g(t, 0.7, 0.08) - 0.04,
  (t: number) => 0.3 * g(t, 0.05, 0.04) + 0.55 * g(t, 0.3, 0.08) - 0.9 * g(t, 0.7, 0.08),
];
const PV = [
  (t: number) => 0.5 + 0.05 * Math.cos(2 * Math.PI * t),
  (t: number) => 0.5 + 0.1 * Math.cos(2 * Math.PI * t),
  (t: number) => 0.33 + 0.45 * Math.cos(2 * Math.PI * t),
];
const IRV = [
  (t: number) => -0.45 - 0.05 * Math.sin(2 * Math.PI * t),
  (t: number) => -(0.6 * g(t, 0.3, 0.08) + 0.5 * g(t, 0.72, 0.08)),
  (t: number) => -0.75 * g(t, 0.72, 0.1),
];

export const Vexus = () => {
  const cols = [44, 130, 216];
  const rows: [string, ((t: number) => number)[], number, string[]][] = [
    ["Hepatic", HV, 54, ["S > D", "S < D", "S reversed"]],
    ["Portal", PV, 132, ["PF < 30%", "PF 30–49%", "PF ≥ 50%"]],
    ["Renal", IRV, 168, ["Continuous", "Biphasic S + D", "D only"]],
  ];
  return (
    <Svg h={236} label="VExUS Doppler patterns">
      {["Normal", "Mild", "Severe"].map((c, i) => <T key={c} x={cols[i] + 38} y={14} t={c} s={10.5} b c={i === 0 ? "#2FA37A" : i === 1 ? CAL : RED} />)}
      {rows.map(([name, fs, base, notes]) => (
        <g key={name}>
          <T x={4} y={base + 3} t={name} s={9} c={DOP} a="start" />
          {fs.map((f, i) => <Trace key={i} x={cols[i]} y={base} w={76} amp={22} f={f} />)}
          {notes.map((n, i) => <T key={n} x={cols[i] + 38} y={name === "Portal" ? base + 12 : base + 30} t={n} s={8.5} c={MUTED} />)}
        </g>
      ))}
      <T x={150} y={216} t="IVC < 2 cm = grade 0. If ≥ 2 cm: mild only = 1, one severe = 2, two+ severe = 3" s={8.5} c={MUTED} />
      <T x={150} y={229} t="Run an ECG: S is in systole (after the QRS), D in diastole" s={8.5} c={MUTED} />
    </Svg>
  );
};

// ---------- Lung ----------
let seed = 7;
const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

const Ribs: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => (
  <g>
    {[x + 22, x + w - 22].map((cx) => (
      <g key={cx}>
        <rect x={cx - 9} y={y + 14} width={18} height={h - 14} fill="#000" opacity={0.85} />
        <ellipse cx={cx} cy={y + 14} rx={10} ry={6} fill="#e9eef0" />
      </g>
    ))}
    <line x1={x + 32} y1={y + 24} x2={x + w - 32} y2={y + 24} stroke="#ffffff" strokeWidth={2.4} />
  </g>
);

const Speckle: React.FC<{ x: number; y: number; w: number; h: number; n?: number; o?: number }> = ({ x, y, w, h, n = 90, o = 0.35 }) => {
  seed = Math.round(x + y * 3 + w);
  return <g>{Array.from({ length: n }, (_, i) => <rect key={i} x={x + rnd() * w} y={y + rnd() * h} width={1.6} height={1} fill="#aeb8bc" opacity={o * (0.4 + rnd())} />)}</g>;
};

export const Lung = () => {
  const P = [[6, 20], [154, 20], [6, 132], [154, 132]] as const;
  const w = 140, h = 92;
  return (
    <Svg h={236} label="Lung ultrasound signs">
      <rect x={P[0][0]} y={P[0][1]} width={w} height={h} fill="#14191c" />
      <Speckle x={P[0][0]} y={P[0][1]} w={w} h={20} />
      <Ribs x={P[0][0]} y={P[0][1]} w={w} h={h} />
      {[50, 76].map((dy, i) => <line key={dy} x1={P[0][0] + 32} y1={P[0][1] + dy} x2={P[0][0] + w - 32} y2={P[0][1] + dy} stroke="#ffffff" strokeWidth={1.6} opacity={0.55 - i * 0.2} />)}
      <T x={P[0][0] + w / 2} y={P[0][1] - 5} t="A-lines: normal (PTX if no sliding)" s={9} />

      <rect x={P[1][0]} y={P[1][1]} width={w} height={h} fill="#14191c" />
      <Speckle x={P[1][0]} y={P[1][1]} w={w} h={20} />
      <Ribs x={P[1][0]} y={P[1][1]} w={w} h={h} />
      {[52, 70, 88].map((dx) => <path key={dx} d={`M${P[1][0] + dx - 1},${P[1][1] + 25} L${P[1][0] + dx - 3},${P[1][1] + h} L${P[1][0] + dx + 3},${P[1][1] + h} L${P[1][0] + dx + 1},${P[1][1] + 25} Z`} fill="#ffffff" opacity={0.75} />)}
      <T x={P[1][0] + w / 2} y={P[1][1] - 5} t="B-lines: ≥ 3 per space = interstitial" s={9} />

      {[2, 3].map((k) => {
        const [x, y] = P[k];
        return (
          <g key={k}>
            <rect x={x} y={y} width={w} height={h} fill="#14191c" />
            {Array.from({ length: 8 }, (_, i) => <line key={i} x1={x} y1={y + 4 + i * 3.6} x2={x + w} y2={y + 4 + i * 3.6} stroke="#aeb8bc" strokeWidth={0.9} opacity={0.5} />)}
            <line x1={x} y1={y + 34} x2={x + w} y2={y + 34} stroke="#ffffff" strokeWidth={2.2} />
            {k === 2 ? <Speckle x={x} y={y + 37} w={w} h={h - 39} n={380} o={0.45} /> : Array.from({ length: 15 }, (_, i) => <line key={i} x1={x} y1={y + 39 + i * 3.6} x2={x + w} y2={y + 39 + i * 3.6} stroke="#aeb8bc" strokeWidth={0.9} opacity={0.5} />)}
            <T x={x + w / 2} y={y - 5} t={k === 2 ? "M-mode seashore: sliding present" : "M-mode barcode: no sliding"} s={9} />
          </g>
        );
      })}
      <T x={150} y={232} t="Lung point (sliding meets no sliding) is pathognomonic for pneumothorax" s={8.5} c={CAL} />
    </Svg>
  );
};

// ---------- Transcranial Doppler ----------
const TCD: [string, string, (t: number) => number][] = [
  ["Normal", "PI ≈ 0.9", (t) => 0.4 + 0.15 * (1 - t) + 0.5 * g(t, 0.14, 0.05) + 0.1 * g(t, 0.38, 0.05)],
  ["High resistance", "PI > 1.2: raised ICP?", (t) => 0.05 + 0.12 * (1 - t) + 0.85 * g(t, 0.12, 0.045) + 0.08 * g(t, 0.35, 0.04)],
  ["Oscillating flow", "Forward in systole, back in diastole", (t) => 0.75 * g(t, 0.14, 0.05) - 0.5 * g(t, 0.45, 0.12)],
  ["Systolic spikes", "Small, brief forward flow only", (t) => 0.4 * g(t, 0.12, 0.028)],
];

export const Tcd = () => {
  const pos = [[10, 58], [156, 58], [10, 150], [156, 150]] as const;
  return (
    <Svg h={206} label="Transcranial Doppler waveforms">
      {TCD.map(([name, note, f], i) => (
        <g key={name}>
          <T x={pos[i][0] + 67} y={pos[i][1] - 44} t={name} s={10} b c={i < 2 ? "#ffffff" : RED} />
          <Trace x={pos[i][0]} y={pos[i][1]} w={134} amp={34} f={f} />
          <T x={pos[i][0] + 67} y={pos[i][1] + 22} t={note} s={8.5} c={MUTED} />
        </g>
      ))}
      <T x={150} y={198} t="MCA from the temporal window: flow towards the probe at 45–65 mm" s={8.5} c={DOP} />
    </Svg>
  );
};

// ---------- Optic nerve sheath ----------
export const Onsd = () => (
  <Svg h={214} label="Optic nerve sheath diameter">
    <rect x={0} y={0} width={300} height={214} fill="#0b0f11" />
    <Speckle x={0} y={120} w={300} h={94} n={420} o={0.5} />
    <rect x={95} y={4} width={110} height={10} rx={3} fill="#3c4a50" />
    <T x={150} y={12} t="Linear probe on closed eyelid" s={8} c="#dfe6e8" />
    <circle cx={150} cy={70} r={50} fill="#020304" stroke="#46525a" strokeWidth={1} />
    <path d="M122,34 Q150,48 178,34" stroke="#e9eef0" strokeWidth={1.6} fill="none" />
    <T x={150} y={30} t="lens" s={8} c={MUTED} />
    <path d="M139,119 L136,206 L164,206 L161,119 Z" fill="#cdd5d8" opacity={0.55} />
    <path d="M143,119 L141,206 L159,206 L157,119 Z" fill="#05070a" />
    <line x1={139} y1={119} x2={136} y2={206} stroke="#ffffff" strokeWidth={1.4} />
    <line x1={161} y1={119} x2={164} y2={206} stroke="#ffffff" strokeWidth={1.4} />
    <circle cx={149} cy={128} r={2.2} fill={RED} /><circle cx={152} cy={131} r={2} fill="#3d7fd9" />
    <line x1={184} y1={120} x2={184} y2={140} stroke={CAL} strokeWidth={1.2} />
    <line x1={180} y1={120} x2={188} y2={120} stroke={CAL} /><line x1={180} y1={140} x2={188} y2={140} stroke={CAL} />
    <T x={192} y={133} t="3 mm behind globe" s={9} c={CAL} a="start" />
    <line x1={137} y1={140} x2={163} y2={140} stroke={CAL} strokeWidth={1.4} />
    <T x={130} y={143} t="ONSD" s={9.5} c={CAL} a="end" b />
    <T x={150} y={163} t="nerve" s={8} c={MUTED} />
    <T x={108} y={128} t="CRA / CRV" s={8} c={MUTED} a="end" />
    <line x1={110} y1={126} x2={146} y2={128} stroke={MUTED} strokeWidth={0.6} />
    <T x={240} y={180} t="Measure across the sheath," s={8.5} c="#dfe6e8" />
    <T x={240} y={191} t="2 planes × 2 eyes, average" s={8.5} c="#dfe6e8" />
  </Svg>
);

// ---------- Constriction vs restriction ----------
const inflowPath = (x: number, y: number, w: number, amp: number, eAmp: (k: number) => number, aAmp: number) => {
  const beats = 5, pts: string[] = [];
  for (let i = 0; i <= 200; i++) {
    const u = (i / 200) * beats, k = Math.floor(u), t = u - k;
    const f = eAmp(Math.min(k, beats - 1)) * g(t, 0.25, 0.07) + aAmp * g(t, 0.62, 0.06);
    pts.push(`${(x + (i / 200) * w).toFixed(1)},${(y - f * amp).toFixed(1)}`);
  }
  return `M${x},${y} L${pts.join(" L")} L${x + w},${y} Z`;
};

export const Constriction = () => {
  const cols = [[8, "Constriction", "#F2B33D"], [156, "Restriction", RED]] as const;
  return (
    <Svg h={250} label="Constriction versus restriction Doppler patterns">
      {cols.map(([x, name, c], ci) => (
        <g key={name}>
          <T x={x + 68} y={14} t={name} s={10.5} b c={c} />
          {/* respiration trace */}
          <path d={Array.from({ length: 61 }, (_, i) => { const px = (i / 60) * 136; return `${i ? "L" : "M"}${x + px},${30 - 6 * Math.cos((2 * Math.PI * (px - 13.6)) / 54.4)}`; }).join(" ")} stroke={DOP} strokeWidth={1.2} fill="none" />
          {[13.6, 40.8, 68, 95.2, 122.4].map((cx, i) => <T key={cx} x={x + cx} y={46} t={i % 2 ? "exp" : "insp"} s={7.5} c={DOP} />)}
          <line x1={x} y1={98} x2={x + 136} y2={98} stroke="#59656c" strokeWidth={0.8} />
          <path d={inflowPath(x, 98, 136, 44, (k) => (ci === 0 ? ([0.6, 1, 0.65, 1, 0.62][k]) : 1), ci === 0 ? 0.45 : 0.18)} fill={WAVE} opacity={0.8} stroke="#ffffff" strokeWidth={0.6} />
          <T x={x + 68} y={112} t={ci === 0 ? "Mitral E falls > 25% on inspiration" : "Tall E, tiny A, no variation"} s={8} c={MUTED} />
          {/* e′ bars */}
          <T x={x + 68} y={132} t="Tissue Doppler e′ (cm/s)" s={8.5} c="#dfe6e8" />
          {[["septal", ci === 0 ? 13 : 4], ["lateral", ci === 0 ? 9 : 5]].map(([lab, val], i) => (
            <g key={lab as string}>
              <rect x={x + 30 + i * 46} y={196 - (val as number) * 3.2} width={26} height={(val as number) * 3.2} rx={3} fill={i === 0 ? c : "#7D8E97"} opacity={0.85} />
              <T x={x + 43 + i * 46} y={208} t={lab as string} s={8} c={MUTED} />
              <T x={x + 43 + i * 46} y={192 - (val as number) * 3.2} t={`${val}`} s={8.5} c="#ffffff" />
            </g>
          ))}
          <T x={x + 68} y={224} t={ci === 0 ? "Septal ≥ 9 and > lateral (reversus)" : "Both low (often < 6–7 cm/s)"} s={8} c={MUTED} />
        </g>
      ))}
      <line x1={150} y1={6} x2={150} y2={232} stroke="#2b3438" />
      <T x={150} y={245} t="Hepatic vein reversal: in expiration = constriction; in inspiration = restriction" s={7.8} c={DOP} />
    </Svg>
  );
};
