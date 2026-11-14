/**
 * Advanced and non-cardiac point-of-care content: ventriculo-arterial coupling, VExUS,
 * transcranial Doppler, optic nerve sheath / optic nerve Doppler and lung ultrasound.
 * Teaching notes written for this app; cut-offs restated from the cited sources.
 */
import type { Caveat, ViewGuide, RefTable } from "./content";

export const EXTRA_CAVEATS: Record<string, Caveat> = {
  visual_size: {
    title: "Visual (eyeball) estimates",
    points: [
      "Experienced operators' visual estimates of size and function agree reasonably with measurement, and are acceptable in focused scans (e.g. FUSIC); a formal report should measure where possible.",
      "The report labels these as visual estimates. If a chamber is also measured, the measurement drives the summary and the visual estimate is listed alongside.",
      "LV: compare with the expected size for the patient; a small, hyperdynamic LV with end-systolic cavity obliteration suggests underfilling or low afterload.",
      "RV: in A4C the normal RV is smaller than two-thirds of the LV and the LV forms the apex; RV ≥ LV (or the RV forming the apex) suggests severe dilatation.",
      "Atria: in A4C a normal LA is roughly the size of the RA and smaller than the LV; bowing of the interatrial septum shows which side has the higher pressure.",
      "Foreshortened or off-axis views mislead the eye just as they distort measurements.",
    ],
  },
  other_findings: {
    title: "Other findings",
    points: [
      "Use this for anything the structured fields don't cover: intracardiac thrombus, masses, vegetations, devices and lines (pacing wires, ECMO cannulae, Impella), shunts or bubble study results, extracardiac findings.",
      "Thrombus: give the site, size, shape (mural or protruding) and mobility; check with contrast or a second view if unsure, as apical artefact is common. Mobile or protruding thrombus carries a higher embolic risk.",
      "Whatever you write here is added to the report under Other findings and to the summary.",
    ],
  },
  pvr: {
    title: "Pulmonary vascular resistance (Doppler estimate)",
    points: [
      "Abbas 2003: PVR (Wood units) ≈ 10 × TR Vmax (m/s) / RVOT VTI (cm) + 0.16. The ratio TRV/RVOT VTI rises as resistance rises relative to flow.",
      "Distinguishes high PA pressure from high flow (pressure high but PVR normal) versus pulmonary vascular disease. ESC/ERS 2022 uses PVR > 2 WU in the haemodynamic definition of pre-capillary PH.",
      "Less accurate at very high PVR (> 8 WU) and needs a good TR envelope and RVOT PW just below the pulmonary valve.",
    ],
  },
  bsa: {
    title: "Body surface area and indexing",
    points: [
      "Mosteller: BSA = √(height cm × weight kg / 3600). DuBois gives similar values in most adults.",
      "Volumes, mass and valve areas are indexed to BSA so they can be compared between people of different size.",
      "In obesity, BSA indexing under-calls dilatation (it over-corrects). BSE indexes aortic size to height for this reason.",
    ],
  },
  bernoulli: {
    title: "Bernoulli equation",
    points: [
      "Simplified: ΔP = 4V² (V in m/s, ΔP in mmHg). It ignores the proximal velocity, flow acceleration and viscous losses.",
      "Use the modified form 4(V2² − V1²) when the proximal velocity is above about 1.5 m/s (for example LVOT obstruction in series with AS, or high-output states).",
      "Peak instantaneous Doppler gradients are higher than catheter peak-to-peak gradients; mean gradients agree better.",
      "Pressure recovery in a small aorta (< 3 cm) makes Doppler overestimate AS severity.",
    ],
  },
  qpqs: {
    title: "Qp:Qs (shunt ratio)",
    points: [
      "Qp = RVOT area × RVOT VTI (pulmonary flow); Qs = LVOT area × LVOT VTI (systemic flow).",
      "> 1.5 suggests a haemodynamically significant left-to-right shunt (ASD, VSD, PDA); < 1 suggests net right-to-left flow.",
      "Errors in either diameter are squared; the RVOT diameter is the least reliable measurement. Significant regurgitation of the valves used invalidates the calculation.",
    ],
  },
  svr: {
    title: "Systemic vascular resistance",
    points: [
      "SVR = 80 × (MAP − RAP) / cardiac output, in dyn·s/cm⁵. Normal about 800–1200.",
      "Uses the echo cardiac output (LVOT area × VTI × HR), so LVOT diameter errors carry through.",
      "Helpful to describe a shock state (vasodilated vs vasoconstricted) but it's derived, not measured: interpret with the clinical picture.",
    ],
  },
  rwma: {
    title: "Regional wall motion",
    points: [
      "Use the 17-segment model and score each segment: normal, hypokinetic, akinetic or dyskinetic (aneurysmal).",
      "Judge thickening as well as inward motion; tethering and translation can make a passive segment look as if it moves.",
      "Patterns that follow a coronary territory suggest ischaemia; apical ballooning sparing the base suggests Takotsubo; a regional pattern can also follow LBBB, pacing or septal post-operative motion.",
      "Off-axis or foreshortened views create false regional abnormalities, especially at the apex.",
      "Chart layout (bull's-eye, ASE/EACVI): outer ring basal 1–6, middle ring mid 7–12, inner ring apical 13–16, centre apex 17; anterior at the top, septum on the left, lateral on the right.",
      "Wall motion score: normal 1, hypokinetic 2, akinetic 3, dyskinetic (or aneurysmal) 4. Wall motion score index = sum ÷ segments scored; 1.0 is normal and higher means more extensive dysfunction. Segments marked 'not seen' are left out.",
      "Usual territories: LAD 1, 2, 7, 8, 13, 14, 17; RCA 3, 4, 9, 10, 15; LCx 5, 6, 11, 12, 16. Coronary anatomy varies, especially at the apex and inferolateral wall.",
    ],
  },
  rv_wall: {
    title: "RV free wall thickness",
    points: [
      "Measure in diastole in the subcostal view (or PLAX), at the level of the tricuspid chordae, excluding trabeculation and epicardial fat.",
      "> 5 mm suggests RV hypertrophy: chronic pressure load (chronic PH, pulmonary stenosis) or infiltration. Acute pressure load (PE) usually has a thin wall.",
    ],
  },
  pv_flow: {
    title: "Pulmonary vein flow",
    points: [
      "PW sample 1–2 cm into the right upper pulmonary vein from the A4C view, with colour to align.",
      "S/D ratio ≤ 0.67 (systolic blunting) supports raised LA pressure in reduced EF; in normal EF it can be > 0.67 despite raised pressure. Young people normally have prominent D waves.",
      "Ar duration exceeding mitral A duration by > 30 ms suggests raised LV end-diastolic pressure.",
      "AF removes the Ar wave and blunts S without implying raised pressure.",
    ],
  },
  pa_size: {
    title: "Pulmonary artery size",
    points: [
      "Measure the main PA in the PSAX view at end-diastole, midway between the valve and the bifurcation.",
      "ESC/ERS 2022 counts a PA diameter > 25 mm, or larger than the aortic root, as a supporting sign of pulmonary hypertension.",
      "A large PA is common in long-standing PH and doesn't shrink quickly with treatment.",
    ],
  },
  rhythm: {
    title: "Rhythm and heart rate",
    points: [
      "In AF, average measurements over 5–10 beats (or use an index beat after two similar RR intervals). Diastolic grading uses AF-specific criteria and LA strain isn't used.",
      "Fast heart rates fuse E and A waves; slow rates exaggerate stroke volume and VTI. Record the HR with Doppler measurements.",
      "Paced rhythm and LBBB make septal motion and septal e′ unreliable.",
    ],
  },
  image_quality: {
    title: "Image quality and limited studies",
    points: [
      "State the image quality and which views were not obtained; 'not seen' is not the same as 'normal'.",
      "Use contrast when two or more contiguous LV segments are not seen and the answer matters.",
      "A focused (FUSIC-style) scan answers specific questions; it doesn't replace a full departmental study when one is needed.",
    ],
  },
  reference_ranges: {
    title: "Why sex, age and size matter",
    points: [
      "BSE 2020 and ASE/EACVI 2015 give separate male and female ranges for chamber size, mass and function; without sex, grading falls back to the less specific limit or is left ungraded.",
      "Diastolic e′ cut-offs are age-specific (ASE 2025).",
      "Height and weight give BSA for indexing, and height alone for BSE aortic indexing.",
    ],
  },
  rvpa: {
    title: "RV–PA coupling (TAPSE/sPAP)",
    points: [
      "TAPSE/sPAP is a non-invasive stand-in for RV contractility versus its afterload (Ees/Ea). Lower means the RV is struggling against its load.",
      "ESC/ERS 2022: TAPSE/sPAP < 0.55 mm/mmHg adds to the probability of pulmonary hypertension. In PAH, < 0.31 has been linked to RV–PA uncoupling and worse outcome (Tello 2019).",
      "sPAP depends on a good TR envelope and a sensible RAP. Severe TR with laminar flow makes sPAP unreliable (usually too low), which inflates the ratio.",
      "TAPSE is angle- and load-dependent and reflects only longitudinal function. In ventilated patients use the measured CVP for RAP rather than the IVC.",
    ],
  },
  vac: {
    title: "LV–arterial coupling (Ea/Ees)",
    points: [
      "Arterial elastance Ea ≈ end-systolic pressure / stroke volume. End-systolic pressure ≈ 0.9 × systolic BP (arterial line or cuff).",
      "LV end-systolic elastance Ees is best estimated with the single-beat method (Chen 2001), which needs EF, SBP, DBP, stroke volume and the pre-ejection and total ejection times from the LVOT Doppler with an ECG.",
      "The simplified ratio Ea/Ees ≈ ESV/SV assumes the LV's unstressed volume is zero; it tracks the trend but isn't interchangeable with the single-beat value.",
      "Ea/Ees about 0.5–1.0 is coupled (0.5 most efficient, 1.0 most stroke work). Higher values mean uncoupling: either high afterload or poor contractility. In septic shock studies, > 1.36 has been used as uncoupled.",
      "Use biplane Simpson's volumes; foreshortening underestimates ESV and inflates Ees.",
    ],
  },
  vexus: {
    title: "VExUS: venous excess ultrasound",
    points: [
      "Grade only if the IVC is ≥ 2 cm: a small IVC is grade 0 regardless of the Doppler.",
      "Hepatic vein: normal S > D; mild S < D; severe is systolic flow reversal. Portal vein pulsatility fraction (Vmax − Vmin)/Vmax: normal < 30%, mild 30–49%, severe ≥ 50%. Intrarenal vein: normal continuous; mild biphasic (S and D); severe monophasic (D only).",
      "Grade 1: IVC ≥ 2 cm with normal or mild patterns. Grade 2: one severe pattern. Grade 3: two or more severe patterns (Beaubien-Souligny 2020, after cardiac surgery: grade 3 was most strongly linked to AKI).",
      "Always run an ECG trace to time S and D. Without it, hepatic and renal patterns are easy to misread.",
      "Confounders: AF blunts S (S < D) without congestion; severe TR reverses S; cirrhosis and portal hypertension change portal flow; young slim patients can have a pulsatile portal vein; CKD alters renal Doppler.",
      "VExUS describes venous congestion, not volume status or fluid responsiveness. Use it as a trend alongside the clinical picture.",
    ],
  },
  fluid_resp: {
    title: "Respiratory variation tests",
    points: [
      "Valid only in fully ventilated, passive patients in sinus rhythm with tidal volumes about 8 ml/kg and a closed chest. Spontaneous effort, arrhythmia, low tidal volume, raised abdominal pressure and RV failure all cause false results.",
      "Aortic/LVOT peak velocity variation > 12% (Feissel 2001) and IVC distensibility index > 18% (Barbier 2004) predicted fluid responsiveness in those conditions.",
      "In spontaneously breathing patients IVC collapse is a weak predictor. A passive leg raise with a VTI change of 10–15% is more reliable.",
    ],
  },
  dpdt: {
    title: "LV and RV dP/dt",
    points: [
      "LV: on the MR CW envelope, measure the time between 1 m/s and 3 m/s. dP/dt = 32 mmHg / that time. > 1200 mmHg/s normal; < 1000 reduced; < 800 severely reduced.",
      "RV: on the TR envelope, time between 0.5 and 2 m/s. dP/dt = 15 mmHg / that time. < 400 mmHg/s suggests RV systolic dysfunction.",
      "Needs a clean, complete envelope and fast sweep speed (100 mm/s). Load-dependent; not valid in acute severe MR with a large v-wave.",
    ],
  },
  tei: {
    title: "Myocardial performance (Tei) index",
    points: [
      "MPI = (isovolumic contraction time + isovolumic relaxation time) / ejection time, or (valve closure-to-opening time − ejection time) / ejection time.",
      "RV MPI abnormal if > 0.43 by PW Doppler or > 0.54 by tissue Doppler (ASE 2010/2015). LV MPI is normally about 0.39 ± 0.05; higher means worse global function.",
      "Measure both intervals at similar heart rates (ideally the same beat with TDI). Unreliable with irregular rhythm and when RA pressure is high (shortened IVRT pseudo-normalises the RV MPI).",
    ],
  },
  epss: {
    title: "E-point septal separation (EPSS)",
    points: [
      "PLAX M-mode through the anterior mitral leaflet tip: the smallest gap between the E point and the septum.",
      "> 7 mm suggests reduced LV systolic function; quick bedside screen when volumes can't be traced.",
      "Not valid with mitral stenosis, an AR jet hitting the anterior leaflet, septal hypertrophy or an off-axis cut.",
    ],
  },
  lus: {
    title: "Lung ultrasound",
    points: [
      "Normal lung: lung sliding with A-lines. B-lines are vertical, laser-like artefacts arising from the pleural line, reaching the bottom of the screen, moving with sliding and erasing A-lines.",
      "≥ 3 B-lines in one intercostal space is abnormal. Bilateral diffuse B-lines suggest pulmonary oedema or ARDS; focal B-lines suggest pneumonia, contusion or atelectasis.",
      "Absent sliding is not pneumothorax by itself: apnoea, one-lung intubation, pleurodesis, adhesions and severe ARDS also abolish it. A lung point confirms pneumothorax; lung pulse or B-lines rule it out at that spot.",
      "Turn off harmonics, compounding and smoothing filters (use a lung preset); put the focus at the pleural line.",
      "Subcutaneous emphysema hides the pleura (E-lines) and makes LUS unreliable.",
    ],
  },
  lus_score: {
    title: "Lung ultrasound (LUS) score",
    points: [
      "Score 12 regions (upper and lower, anterior, lateral and posterior on each side) from 0 to 3, total 0–36.",
      "0 = A-lines or ≤ 2 B-lines; 1 = ≥ 3 well-separated B-lines; 2 = coalescent B-lines (white lung) in part of the space; 3 = consolidation.",
      "Used to track aeration (recruitment, oedema, pneumonia) over time. Before extubation a score > 17 was linked to post-extubation distress and < 13 to success (Soummer 2012).",
    ],
  },
  effusion_vol: {
    title: "Pleural effusion volume",
    points: [
      "Balik formula: volume (ml) ≈ 20 × maximal separation (mm) between parietal and visceral pleura at the lung base, supine, at end-expiration, probe in the posterior axillary line perpendicular to the chest wall.",
      "It's an estimate (± a few hundred ml); loculation, consolidation and patient position change it.",
    ],
  },
  diaphragm: {
    title: "Diaphragm ultrasound",
    points: [
      "Excursion: curvilinear probe subcostal in the mid-clavicular line, M-mode through the dome during quiet breathing. < 10 mm suggests dysfunction; paradoxical motion on sniff suggests paralysis.",
      "Thickening fraction: linear probe in the zone of apposition (8th–10th space, mid-axillary line). DTF = (end-inspiratory − end-expiratory thickness) / end-expiratory thickness. ≥ 30% was linked to successful extubation (DiNino 2014).",
      "Positive pressure ventilation moves the diaphragm passively: measure excursion and DTF during a spontaneous breathing trial, not on controlled modes.",
    ],
  },
  tcd: {
    title: "Transcranial Doppler",
    points: [
      "Velocities depend on PaCO2, haematocrit, temperature, cardiac output and the insonation angle. Record them with each reading.",
      "MCA mean velocity: 120–200 cm/s with Lindegaard ratio 3–6 suggests vasospasm; > 200 cm/s with ratio > 6 suggests severe vasospasm. High velocity with ratio < 3 is hyperaemia.",
      "Pulsatility index (PSV − EDV)/MFV: normal about 0.6–1.1. A raised PI means raised resistance downstream (raised ICP, hypocapnia, distal stenosis) or a wide pulse pressure such as severe aortic regurgitation. In TBI, PI > 1.25 or EDV < 20 cm/s on admission identified high-risk patients (Bouzat 2011).",
      "A temporal window is absent in about 10–20% of adults, more often in older women.",
      "Oscillating flow or small systolic spikes indicate cerebral circulatory arrest, but in the UK death is diagnosed clinically by neurological criteria; TCD is only an ancillary test.",
    ],
  },
  onsd: {
    title: "Optic nerve sheath diameter",
    points: [
      "Use a linear probe with an ophthalmic or low-power preset (mechanical index ≤ 0.23, TI as low as possible); closed eyelid, plenty of gel, no pressure on the globe. Don't scan a possible open globe injury.",
      "Measure 3 mm behind the globe, perpendicular to the nerve, in a transverse and a sagittal plane in each eye; report the average.",
      "Adult cut-offs for raised ICP vary between studies, roughly 5.0–6.0 mm; > 5.7–5.8 mm is often used. Children: about > 4.0 mm under 1 year and > 4.5 mm over 1 year.",
      "Acoustic shadow from the lamina cribrosa can mimic the sheath: the true sheath has a bright dural border. The sheath may stay dilated for some time after ICP falls.",
    ],
  },
};

const VEXUS_FIXES_HV: [string, string][] = [
  ["Can't tell S from D", "Turn on the ECG trace: S comes with the QRS–T (systole), D after the T wave. Slow the sweep to 25–50 mm/s to see several beats."],
  ["Signal fades or jumps with breathing", "Sample at end-expiration (ask for a gentle breath hold) or track the vein through the breath with small tilts."],
  ["Not sure it's a hepatic vein", "Hepatic veins run towards the IVC and have thin, barely visible walls. Portal veins run horizontally from the hilum and have bright, thick walls."],
  ["Aliasing or a noisy trace", "Lower the gain, set the scale to about ±50 cm/s, use a 2–4 mm sample volume and align the beam with the vein."],
];

export const EXTRA_VIEWS: ViewGuide[] = [
  {
    id: "vexus_hv", name: "VExUS: hepatic vein Doppler", group: "VExUS", diagram: "vexus",
    probe: "Phased-array or curvilinear. Subcostal long axis of the IVC, or the right mid-axillary line (transhepatic coronal) when the subcostal window is poor.",
    marker: "Towards the head (subcostal long axis) or the head in the coronal transhepatic view.",
    structures: ["IVC entering the right atrium", "Middle or right hepatic vein joining the IVC", "Liver parenchyma"],
    optimise: ["Find the IVC first and measure its maximum diameter (VExUS needs ≥ 2 cm to grade).", "Colour Doppler to pick out a hepatic vein, then place the PW sample 1–2 cm upstream of where it joins the IVC.", "Keep the beam as parallel to the vein as you can; connect the ECG.", "Record at least three beats at end-expiration."],
    fixes: VEXUS_FIXES_HV,
    measure: ["S and D waves (flow towards the heart, normally below the baseline in this view) and the small reversed a wave", "Normal: S deeper than D. Mild: S smaller than D. Severe: S reversed above the baseline"],
    pitfalls: ["AF removes the a wave and often makes S < D without congestion.", "Severe TR reverses S whatever the venous pressure.", "Cirrhosis stiffens the liver and flattens the waveform."],
  },
  {
    id: "vexus_pv", name: "VExUS: portal vein Doppler", group: "VExUS", diagram: "vexus",
    probe: "Curvilinear or phased-array in the right mid- to posterior-axillary line, 8th–10th intercostal space, coronal plane through the liver.",
    marker: "Towards the head.",
    structures: ["Main and right portal vein at the porta hepatis (bright walls)", "Hepatic artery alongside", "IVC deeper"],
    optimise: ["Colour Doppler with a low scale (about 20–30 cm/s) to find the portal vein entering the liver.", "PW sample volume in the middle of the vessel, beam-to-flow angle under 60°.", "ECG on; record several beats at end-expiration."],
    fixes: [["Hepatic artery signal mixed in", "Shrink the sample volume and move it slightly away from the artery."], ["Flow looks reversed everywhere", "Check the colour map and direction; hepatofugal flow can be portal hypertension rather than congestion."], ["Vessel moves out of the gate with breathing", "Brief breath hold, or record during quiet expiration."]],
    measure: ["Pulsatility fraction = (Vmax − Vmin) / Vmax × 100", "Normal < 30%; mild 30–49%; severe ≥ 50% (including to-and-fro flow)"],
    pitfalls: ["Young, slim, healthy people can have a pulsatile portal vein.", "Portal hypertension and cirrhosis change portal flow independently of the right heart.", "Arteriovenous shunts in the liver cause pulsatility."],
  },
  {
    id: "vexus_irv", name: "VExUS: intrarenal venous Doppler", group: "VExUS", diagram: "vexus",
    probe: "Curvilinear on the right kidney, posterior axillary line, coronal long axis of the kidney. Left lateral tilt helps.",
    marker: "Towards the head.",
    structures: ["Right kidney: cortex, pyramids and sinus", "Interlobar arteries and veins running between the pyramids"],
    optimise: ["Colour Doppler with a low scale (about 10–20 cm/s) and low wall filter to see interlobar vessels.", "Place a 3–5 mm PW gate so the artery (above the baseline) and vein (below) appear together; this lets you time the venous waves.", "ECG on, slow sweep, gentle breath hold."],
    fixes: [["Only the arterial waveform appears", "Widen the gate slightly and lower the scale and wall filter until the venous signal shows below the baseline."], ["Trace is noisy or jumps", "Lower gain, ask for a breath hold, and steady your hand on the patient."], ["Kidney hard to see", "Move more posteriorly, use the liver as a window, or try the left lateral position."]],
    measure: ["Venous pattern: continuous (normal); biphasic with separate S and D (mild); monophasic D only (severe)"],
    pitfalls: ["The hardest VExUS site; obesity and bowel gas often prevent it.", "Chronic kidney disease and renal artery stenosis change the waveforms.", "Without an ECG, biphasic flow is easily mistaken for monophasic."],
  },
  {
    id: "lus", name: "Lung ultrasound", group: "Other", diagram: "lung",
    probe: "Curvilinear or phased-array for B-lines, consolidation and effusion (depth 12–18 cm). Linear for the pleural line and pneumothorax (depth 4–6 cm). Longitudinal across two ribs ('bat sign').",
    marker: "Towards the head.",
    structures: ["Ribs with posterior acoustic shadows", "Pleural line just below the ribs", "A-lines, B-lines and the lung beneath", "Diaphragm, liver or spleen at the bases"],
    optimise: ["Lung preset: harmonics, compounding and smoothing off; focus at the pleural line.", "Scan systematically: upper and lower anterior, lateral (PLAPS point), and posterior on each side.", "Use M-mode through the pleural line when sliding is doubtful.", "For pneumothorax scan the least dependent area first (anterior chest when supine), then move laterally to find a lung point."],
    fixes: [["Pleural line hard to find", "Find two ribs and their shadows first; the pleural line is the bright line about half a centimetre below the rib tops."], ["Unsure if sliding is present", "Use M-mode: seashore = sliding, barcode = no sliding. Reduce depth and use the linear probe."], ["Short comet tails mistaken for B-lines", "True B-lines reach the bottom of the screen and erase A-lines; Z-lines and comet tails fade quickly."], ["Can't see posterior lung in a supine patient", "Roll slightly or slide the probe as far posterior as possible at the PLAPS point."]],
    measure: ["LUS score (12 regions, 0–36)", "Effusion depth for the Balik volume", "Diaphragm excursion and thickening fraction", "BLUE protocol profile"],
    pitfalls: ["Subcutaneous emphysema, dressings and obesity hide the pleura.", "Absent sliding has many causes besides pneumothorax.", "B-lines are not specific: oedema, ARDS, pneumonia, fibrosis and contusion all cause them; look at the pattern and the pleura."],
    signs: [
      ["Bat sign", "Two ribs with the pleural line between them: the starting landmark."],
      ["Lung sliding / seashore sign", "Shimmering pleural line; on M-mode, waves above and sand below. Rules out pneumothorax at that point."],
      ["Barcode (stratosphere) sign", "M-mode horizontal lines throughout: no sliding. Pneumothorax, apnoea, one-lung intubation or adhesions."],
      ["Lung point", "The edge where sliding meets no sliding. Pathognomonic for pneumothorax (about 100% specific)."],
      ["Lung pulse", "Heartbeat transmitted to a still pleura: lung is up against the wall, so no pneumothorax there (seen in apnoea, one-lung intubation)."],
      ["A-lines", "Horizontal repeats of the pleural line: normal aeration (or pneumothorax if there's no sliding)."],
      ["B-lines", "≥ 3 per space = interstitial syndrome. Diffuse and bilateral with smooth pleura: cardiogenic oedema. Patchy with thickened, irregular pleura and spared areas: ARDS."],
      ["White lung", "Coalescent B-lines filling the space: severe loss of aeration."],
      ["Shred (fractal) sign", "Irregular deep border between consolidated and aerated lung: non-translobar consolidation."],
      ["Tissue-like sign (hepatisation)", "Lung looks like liver: consolidation."],
      ["Dynamic air bronchogram", "Bright dots moving with breathing inside consolidation: pneumonia (open airway), not obstructive atelectasis."],
      ["Static air bronchogram", "Fixed bright dots: atelectasis or pneumonia."],
      ["Quad sign", "Effusion bounded by the pleural line, two rib shadows and the lung line."],
      ["Sinusoid sign", "M-mode: the lung line moves towards the pleural line in inspiration: free effusion."],
      ["Spine sign", "Vertebral bodies visible above the diaphragm: effusion or consolidation (aerated lung normally hides them)."],
      ["Curtain sign", "Aerated lung sliding down over the costophrenic recess on inspiration: normal."],
      ["Plankton sign", "Swirling echoes in an effusion: exudate, empyema or haemothorax."],
      ["Jellyfish sign", "Collapsed lung flapping within a large effusion."],
      ["BLUE protocol (Lichtenstein)", "A-profile + DVT: PE. B-profile: pulmonary oedema. A′ profile + lung point: pneumothorax. B′, A/B or C profile, or A-profile + PLAPS without DVT: pneumonia. A-profile, no DVT, no PLAPS: COPD/asthma."],
    ],
  },
  {
    id: "tcd", name: "Transcranial Doppler (TCD / TCCD)", group: "Other", diagram: "tcd",
    probe: "Phased-array 1–2 MHz with a transcranial preset. Transtemporal window just above the zygomatic arch, in front of the ear; suboccipital (transforaminal) at the base of the skull; transorbital only with reduced power.",
    marker: "Anterior (towards the eye) for the transtemporal axial view.",
    structures: ["Butterfly-shaped midbrain (cerebral peduncles) as the landmark", "Circle of Willis on colour: MCA towards the probe at 45–65 mm, ACA away at 60–75 mm, PCA wrapping the peduncle", "Basilar and vertebral arteries from the suboccipital window, flow away, 60–100 mm deep"],
    optimise: ["Start at the posterior temporal window and slide anteriorly until the peduncles appear; then add colour.", "Sample volume about 10 mm; keep the beam as aligned with the vessel as possible and don't angle-correct (or record if you do).", "Set the scale so the whole envelope fits; trace PSV, EDV and mean.", "Record PaCO2, haematocrit, temperature and MAP with every reading."],
    fixes: [["No signal through the temple", "Try the anterior, middle and posterior parts of the window; increase power and gain; use colour mode. Some patients have no window."], ["Not sure which vessel", "Use depth and direction: MCA towards the probe at 45–65 mm; at the ICA terminus (60–65 mm) flow splits towards (MCA) and away (ACA)."], ["Velocities vary a lot between readings", "Same window, depth and angle each time, and note PaCO2: a change of 1 kPa shifts velocity by roughly 20–30%."]],
    measure: ["MCA mean flow velocity, PSV and EDV", "Pulsatility index (Gosling)", "Lindegaard ratio (MCA mean / extracranial ICA mean from the submandibular window)", "Side-to-side differences", "Waveform pattern (normal, high resistance, oscillating, systolic spikes)"],
    pitfalls: ["Angle errors underestimate velocity.", "Velocities rise with anaemia, fever, hypercapnia and high cardiac output (hyperaemia), mimicking vasospasm.", "TCD is an ancillary test only for brain death in the UK."],
  },
  {
    id: "onsd", name: "Optic nerve sheath and optic nerve Doppler", group: "Other", diagram: "onsd",
    probe: "Linear 7.5–15 MHz, ophthalmic or small-parts preset at low power (MI ≤ 0.23). Eyelid closed, thick gel layer (or a clear film dressing first), hand resting on the forehead or nose so there's no pressure on the eye.",
    marker: "Towards the patient's right (transverse) or head (sagittal).",
    structures: ["Globe (anechoic) with lens anteriorly", "Retina and optic disc at the back of the globe", "Optic nerve: dark band behind the globe, surrounded by the brighter sheath", "Central retinal artery and vein in the nerve (colour Doppler)"],
    optimise: ["Ask the patient to look straight ahead (if awake); keep the nerve centred and straight.", "Measure 3 mm behind the globe, perpendicular to the nerve, across the sheath.", "Two planes per eye (transverse and sagittal), both eyes; average the four.", "For Doppler: colour box 2–3 mm behind the globe within the nerve, low scale and wall filter, then PW on the central retinal artery and vein."],
    fixes: [["Nerve looks curved or tapered", "You're off-axis: tilt and rotate slightly until the nerve runs straight back with parallel edges."], ["Dark shadow behind the disc looks like the nerve", "That's acoustic shadow from the lamina cribrosa; the true sheath has bright dural borders. Change angle; shadows move, the nerve doesn't."], ["Patient moving the eye", "Wait for a still moment or use cine and review frame by frame."]],
    measure: ["ONSD (average of four measurements)", "Central retinal artery PSV, EDV and resistive index", "Absent central retinal artery flow or a bright 'retrobulbar spot sign' in central retinal artery occlusion", "Disc elevation (papilloedema)"],
    pitfalls: ["Too much pressure on the globe distorts the measurement and is unsafe.", "Normal values vary between populations and studies; trends in the same patient are more useful than a single number.", "ONSD lags behind falls in ICP."],
  },
];

export const EXTRA_REFS: RefTable[] = [
  {
    title: "VExUS grading", source: "Beaubien-Souligny et al., Ultrasound J 2020",
    head: ["Site", "Normal", "Mild", "Severe"],
    rows: [
      ["IVC", "< 2 cm: grade 0", "≥ 2 cm: grade using Doppler", ""],
      ["Hepatic vein", "S > D", "S < D", "S reversal"],
      ["Portal vein pulsatility", "< 30%", "30–49%", "≥ 50%"],
      ["Intrarenal vein", "Continuous", "Biphasic (S and D)", "Monophasic (D only)"],
    ],
    note: "Grade 1: IVC ≥ 2 cm with normal or mild patterns. Grade 2: one severe. Grade 3: two or more severe.",
  },
  {
    title: "Coupling and advanced haemodynamics", source: "ESC/ERS 2022; Tello 2019; Chen 2001; Abbas 2003; ASE 2015",
    head: ["Measure", "Normal", "Abnormal"],
    rows: [
      ["TAPSE/sPAP", "≥ 0.55 mm/mmHg", "< 0.55 (PH probability); < 0.31 uncoupled in PAH"],
      ["Ea/Ees (LV–arterial)", "≈ 0.5–1.0", "> 1.0 uncoupled; > 1.36 used in septic shock studies"],
      ["PVR (Doppler estimate)", "≤ 2 WU", "> 2 WU (ESC 2022 PH definition)"],
      ["SVR", "800–1200 dyn·s/cm⁵", "< 800 vasodilated; > 1200 vasoconstricted"],
      ["LV dP/dt (MR)", "> 1200 mmHg/s", "< 1000 reduced; < 800 severe"],
      ["RV dP/dt (TR)", "≥ 400 mmHg/s", "< 400"],
      ["RV MPI (Tei)", "≤ 0.43 PW / ≤ 0.54 TDI", "Higher"],
      ["EPSS", "≤ 7 mm", "> 7 mm suggests reduced EF"],
      ["Aortic Vpeak variation (ventilated)", "", "> 12% predicts fluid responsiveness"],
      ["IVC distensibility (ventilated)", "", "> 18% predicts fluid responsiveness"],
    ],
  },
  {
    title: "Transcranial Doppler", source: "Lindegaard 1989; Aaslid; Bouzat 2011; consensus reviews",
    head: ["Measure", "Value", "Meaning"],
    rows: [
      ["MCA mean velocity (adult)", "≈ 35–90 cm/s", "Normal range (falls with age)"],
      ["MCA mean", "120–200 cm/s + LR 3–6", "Mild–moderate vasospasm"],
      ["MCA mean", "> 200 cm/s + LR > 6", "Severe vasospasm"],
      ["Lindegaard ratio", "< 3 with high velocity", "Hyperaemia"],
      ["Pulsatility index", "0.6–1.1", "Normal; > 1.2 raised distal resistance"],
      ["TBI on admission", "PI > 1.25 or EDV < 20 cm/s", "High risk of secondary deterioration"],
      ["Cerebral circulatory arrest", "Oscillating flow or systolic spikes", "Ancillary only in the UK"],
    ],
  },
  {
    title: "Optic nerve sheath diameter", source: "Systematic reviews; cut-offs vary",
    head: ["Group", "Suggests raised ICP"],
    rows: [["Adults", "> 5.0–6.0 mm (often > 5.7 mm)"], ["Children > 1 year", "> 4.5 mm"], ["Infants < 1 year", "> 4.0 mm"]],
    note: "Measure 3 mm behind the globe, two planes per eye, average of four.",
  },
  {
    title: "Lung and diaphragm", source: "Lichtenstein (BLUE); Soummer 2012; Balik 2006; DiNino 2014",
    head: ["Measure", "Value", "Meaning"],
    rows: [
      ["B-lines per space", "≥ 3", "Interstitial syndrome"],
      ["LUS score (0–36)", "> 17 / < 13", "Post-extubation distress likely / unlikely"],
      ["Effusion volume", "≈ 20 × separation (mm)", "Balik estimate in ml"],
      ["Diaphragm excursion (quiet)", "< 10 mm", "Dysfunction"],
      ["Diaphragm thickening fraction", "≥ 30%", "Associated with extubation success"],
    ],
  },
];

export const EXTRA_FORMULAE: { name: string; formula: string; note?: string }[] = [
  { name: "RV–PA coupling", formula: "TAPSE (mm) / sPAP (mmHg)" },
  { name: "Arterial elastance", formula: "Ea = 0.9 × SBP / SV" },
  { name: "Ees (single beat, Chen 2001)", formula: "Ees = [DBP − ENd(est) × 0.9 × SBP] / [ENd(est) × SV]", note: "ENd(est) = 0.0275 − 0.165 × EF + 0.3656 × DBP/SBP + 0.515 × ENd(avg); ENd(avg) is a polynomial of pre-ejection time / total systolic time." },
  { name: "Simplified Ea/Ees", formula: "Ea/Ees ≈ ESV / SV" },
  { name: "PVR (Abbas 2003)", formula: "PVR (WU) ≈ 10 × TR Vmax (m/s) / RVOT VTI (cm) + 0.16" },
  { name: "SVR", formula: "SVR = 80 × (MAP − RAP) / CO" },
  { name: "LV dP/dt", formula: "32 mmHg / time from 1 to 3 m/s on MR CW" },
  { name: "RV dP/dt", formula: "15 mmHg / time from 0.5 to 2 m/s on TR CW" },
  { name: "Myocardial performance index", formula: "(IVCT + IVRT) / ET" },
  { name: "Portal pulsatility fraction", formula: "(Vmax − Vmin) / Vmax × 100" },
  { name: "Pulsatility index (Gosling)", formula: "PI = (PSV − EDV) / mean velocity" },
  { name: "Resistive index", formula: "RI = (PSV − EDV) / PSV" },
  { name: "Lindegaard ratio", formula: "MCA mean velocity / extracranial ICA mean velocity" },
  { name: "Pleural effusion volume (Balik)", formula: "V (ml) ≈ 20 × separation (mm)" },
  { name: "Diaphragm thickening fraction", formula: "(Tinsp − Texp) / Texp × 100" },
  { name: "LA pressure (Nagueh 1997)", formula: "PCWP ≈ 1.24 × E/e′ + 1.9", note: "Rough estimate; less reliable in many ICU settings." },
];
