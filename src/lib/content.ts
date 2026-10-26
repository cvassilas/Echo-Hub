/**
 * Teaching content for Echo Hub: measurement caveats, view-by-view guides and reference tables.
 * Written for this app from general echocardiography knowledge and the cited society guidelines.
 * Always defer to the current BSE / ASE / EACVI documents and local policy.
 */

export interface Caveat { title: string; points: string[] }

export const CAVEATS: Record<string, Caveat> = {
  diast_invalid: {
    title: "When the diastolic algorithm doesn't apply",
    points: [
      "Mitral stenosis: inflow velocities reflect the stenosis, not LV relaxation. E, E/A and E/e′ are invalid. Use LA size, TR velocity and the clinical picture.",
      "Mitral annular calcification (moderate or worse): e′ is reduced by the calcified annulus and E is raised by mild inflow obstruction, so E/e′ overestimates filling pressure.",
      "Moderate or severe MR: E rises with regurgitant volume. E/e′ is less reliable; a raised E/A with normal e′ may just be the MR. In primary MR, consider IVRT/Ti-e′ if you know the method.",
      "Mitral repair, ring or prosthesis: the annulus no longer moves normally and inflow is altered. Don't use e′ or E/e′.",
      "AF: no A wave. Average 5–10 beats (or use beats after similar R-R intervals). E/septal e′ ≥ 11 supports raised filling pressure; don't grade.",
      "Paced rhythm or LBBB: abnormal septal motion lowers septal e′. Use lateral e′ and be cautious with grading.",
      "Tachycardia or first-degree heart block: E and A fuse. If E at the start of A is > 20 cm/s, E/A is unreliable. Use E/e′, TR velocity and LAVI.",
      "Constrictive pericarditis: medial e′ is often preserved or high (annulus reversus), so E/e′ underestimates filling pressure.",
      "Significant AR (an AR jet into the inflow sample) can contaminate mitral inflow. Check the sample position.",
    ],
  },
  mitral_inflow: {
    title: "Mitral inflow (E and A)",
    points: [
      "A4C, pulsed wave sample volume 1–3 mm at the mitral leaflet tips in diastole, aligned with flow (colour helps).",
      "Low wall filters and sweep 50–100 mm/s. Measure at end-expiration, average 3 beats in sinus rhythm.",
      "Too close to the annulus gives lower E and a different A; too far into the LV underestimates both.",
      "E/A and deceleration time are load dependent: they change with fluids, diuretics, ventilation and age.",
    ],
  },
  eprime: {
    title: "Tissue Doppler e′",
    points: [
      "A4C, PW TDI sample (5–10 mm) within 1 cm of the septal and lateral insertion of the mitral leaflets.",
      "Keep the annulus moving parallel to the beam; angle error underestimates velocity.",
      "Reduce gain and velocity scale (about ±20 cm/s) so the waveform is crisp and not saturated.",
      "Regional wall motion at the base (e.g. basal infarct) lowers that site's e′; prefer the average of septal and lateral.",
      "Normal values fall with age. A septal e′ < 7 in an 80-year-old is common and less meaningful alone.",
    ],
  },
  trv: {
    title: "TR velocity and RVSP",
    points: [
      "Interrogate in several views (RV inflow, PSAX at AV level, A4C, subcostal) and use the highest well-defined envelope.",
      "Use only clear, dense signals. Ignore feathery edges and don't trace noise.",
      "Severe (laminar, free-flowing) TR gives a low velocity with a triangular early-peaking envelope; RVSP is then underestimated.",
      "Agitated saline can enhance a weak TR signal.",
      "RVSP = 4V² + RAP. It estimates systolic PA pressure only if there is no RVOT or pulmonary valve obstruction.",
      "In ventilated patients RAP from the IVC isn't valid, so RVSP is a less reliable estimate.",
    ],
  },
  pvat: {
    title: "RVOT acceleration time",
    points: [
      "PSAX at AV level, PW sample in the RVOT just below the pulmonary valve, aligned with flow.",
      "Measure from onset of flow to peak velocity. < 105 ms suggests raised pulmonary vascular resistance; mid-systolic notching suggests pulmonary vascular disease or PE.",
      "AT shortens with tachycardia (HR > 100) and lengthens with low cardiac output; interpret with heart rate.",
    ],
  },
  ivc_vent: {
    title: "IVC and right atrial pressure",
    points: [
      "Subcostal long axis, measure 1–2 cm from the RA junction (just caudal to the hepatic vein inlet), perpendicular to the IVC long axis.",
      "Use a brief sniff in spontaneously breathing patients; quiet breathing alone underestimates collapse.",
      "Mechanical ventilation: the IVC is usually distended by positive pressure. A small IVC (< 1.2 cm) suggests low RAP, but a large one means little. Don't use the standard RAP table.",
      "Young athletes often have large IVCs with normal RAP.",
      "Make sure you're not measuring the aorta: the IVC enters the RA and shows hepatic vein tributaries.",
      "Raised intra-abdominal pressure compresses the IVC.",
    ],
  },
  ef_visual: {
    title: "Visual ('eyeball') LV function",
    points: [
      "Integrate PLAX, PSAX at mid-papillary level and the apical views. Look at wall thickening, not just endocardial motion.",
      "Experienced readers agree well with quantitative EF, but beginners overcall hyperdynamic function in small, underfilled ventricles.",
      "High inotrope or vasopressor doses and loading conditions change apparent function; document the context.",
      "In AF, judge over several beats.",
    ],
  },
  simpson: {
    title: "Biplane Simpson's volumes and EF",
    points: [
      "Use A4C and A2C with the true apex: the LV should look long and bullet-shaped, and the apex shouldn't move towards the base in systole.",
      "Foreshortening shortens the LV, underestimates volumes and usually overestimates EF.",
      "Trace the blood–tissue interface, include papillary muscles and trabeculae in the cavity, and close the trace at the mitral annulus.",
      "End-diastole: the first frame after mitral valve closure or the largest cavity. End-systole: the frame before mitral opening or the smallest cavity.",
      "Contrast (e.g. SonoVue) improves accuracy when two or more contiguous segments aren't seen.",
    ],
  },
  linear_lv: {
    title: "Linear LV measurements",
    points: [
      "PLAX, at the level of the mitral leaflet tips, perpendicular to the LV long axis. Measure at end-diastole (frame after MV closure).",
      "Avoid off-axis cuts: an oblique line overestimates every dimension. Use 2D-guided callipers rather than blind M-mode if the beam can't be made perpendicular.",
      "Exclude RV trabeculae and the moderator band from the septum, and chordae from the posterior wall.",
      "Linear dimensions assume a symmetrical ventricle. Don't use them for mass or EF when there's regional wall motion abnormality or remodelling.",
    ],
  },
  mapse: {
    title: "MAPSE",
    points: [
      "A4C, M-mode through the lateral mitral annulus, aligned with its motion. Measure total excursion from end-diastole to peak systole.",
      "Long-axis function falls early in many conditions, so a low MAPSE can precede a fall in EF.",
      "Angle dependent, and affected by regional basal dysfunction. The thresholds are pragmatic (used widely in focused echo) rather than from a single guideline.",
    ],
  },
  lvot_d: {
    title: "LVOT diameter: the biggest error source",
    points: [
      "PLAX, zoomed, in mid-systole. Measure inner edge to inner edge, parallel to the aortic valve plane, within about 0.5–1 cm of the annulus.",
      "The diameter is squared in the area calculation: a 1 mm error gives roughly a 10% error in SV and AVA.",
      "Measure 3 times and average. Use the same diameter for serial SV estimates in the same patient.",
      "Calcified annulus or septal bulge makes the LVOT oval; 2D diameter then underestimates the area.",
    ],
  },
  lvot_vti: {
    title: "LVOT VTI",
    points: [
      "A5C (or A3C), PW sample in the LVOT just below the aortic valve, where the closing click is seen but no spectral broadening from the valve.",
      "Align with flow. More than 20° off-axis underestimates VTI.",
      "Trace the modal velocity (the dense envelope). Average 3 beats in sinus rhythm, 5–10 in AF.",
      "Good for tracking response to fluid or inotropes (a 10–15% rise after a fluid challenge or passive leg raise suggests fluid responsiveness), provided the probe position is unchanged.",
      "Sub-aortic obstruction (SAM, septal hypertrophy) invalidates SV from the LVOT; use CW to look for a late-peaking dagger-shaped signal.",
    ],
  },
  rv_size: {
    title: "RV size",
    points: [
      "Use an RV-focused A4C: the apex central, the full RV free wall visible, and the LV apex still in the picture.",
      "Rotating the probe changes RV width a lot. Avoid views that cut through the LVOT (that's A5C) or the coronary sinus.",
      "Basal diameter: maximal transverse dimension in the basal third, at end-diastole.",
      "RV:LV ratio > 1 suggests significant RV dilatation (e.g. acute PE, RV infarct, chronic PH). Ventilated patients with high PEEP can show some RV dilatation.",
    ],
  },
  tapse: {
    title: "TAPSE and RV S′",
    points: [
      "A4C (RV-focused), M-mode or TDI through the lateral tricuspid annulus, aligned with its motion.",
      "Angle dependent; underestimates when the apex is off-axis.",
      "Reflects longitudinal function only. It falls after cardiac surgery or pericardiotomy even when RV function is preserved.",
      "Can be preserved or pseudo-normalised by tethering in severe TR, and overestimated by whole-heart motion (e.g. tamponade).",
    ],
  },
  fac: {
    title: "RV fractional area change",
    points: [
      "Trace RV endocardium at end-diastole and end-systole in the RV-focused A4C, including trabeculae within the cavity.",
      "Needs the whole free wall visible in both frames; a dropout at the free wall makes FAC unreliable.",
      "Includes radial function, so it's less affected than TAPSE after cardiac surgery.",
    ],
  },
  septum: {
    title: "Septal flattening (D-sign)",
    points: [
      "PSAX at papillary muscle level. Look at the shape across the cycle: flattening in diastole suggests RV volume overload; in systole (or throughout) suggests pressure overload.",
      "Eccentricity index > 1.0 at the relevant phase supports the finding. Off-axis cuts can mimic flattening.",
      "Paced rhythm, LBBB and post-cardiac surgery cause abnormal septal motion without RV loading.",
    ],
  },
  la_vol: {
    title: "LA volume",
    points: [
      "Measure at end-systole (frame before MV opening) in LA-focused A4C and A2C views. These aren't the same as the LV-focused views; the LA should be at its longest.",
      "Exclude the pulmonary veins and LA appendage; close the trace across the mitral annulus.",
      "Index to BSA. Anteroposterior diameter from PLAX underestimates enlargement because the LA enlarges asymmetrically.",
      "A dilated LA reflects chronic raised filling pressure (or AF, MR, athletic heart). It isn't a marker of acute change.",
    ],
  },
  ra_area: {
    title: "RA size",
    points: [
      "A4C (RV-focused), end-systole. Trace from the lateral to the septal tricuspid annulus, excluding the IVC, SVC and appendage.",
      "Dilated in chronic RV pressure or volume overload, TR, and AF.",
    ],
  },
  aorta: {
    title: "Aortic root and ascending aorta",
    points: [
      "PLAX, zoomed, end-diastole for the root (ASE leading-edge to leading-edge convention). Some labs use inner edge; be consistent and say which.",
      "Measure perpendicular to the long axis at the sinuses, the sinotubular junction and the proximal ascending aorta (move the probe up a rib space).",
      "Normal size increases with body size and age. Consider indexing or z-scores, especially in small or tall patients.",
    ],
  },
  as_grade: {
    title: "Aortic stenosis grading pitfalls",
    points: [
      "Search for the highest CW velocity from several windows (apical, right parasternal, suprasternal, subcostal). Missing the right parasternal window commonly underestimates.",
      "Discordant grading (AVA < 1.0 cm² but mean gradient < 40 mmHg) is common. First exclude LVOT diameter error and misalignment, then consider low flow (SVi < 35 ml/m²).",
      "Low-flow, low-gradient with reduced EF: dobutamine stress helps separate true severe from pseudo-severe AS. With preserved EF: consider calcium scoring CT.",
      "High-flow states (anaemia, sepsis, AR, fever) raise gradients without severe stenosis; the dimensionless index is flow-independent.",
      "In AF average 5 or more beats.",
    ],
  },
  regurg: {
    title: "Grading regurgitation",
    points: [
      "Don't grade on colour jet area alone. It depends on gain, Nyquist limit (set around 50–70 cm/s), driving pressure and jet direction; eccentric jets look smaller.",
      "Integrate: valve morphology, vena contracta, jet characteristics, PISA (where appropriate), CW density and shape, chamber size and downstream flow (e.g. pulmonary vein or hepatic vein systolic reversal, holodiastolic aortic flow reversal).",
      "Vena contracta: the narrowest neck of the jet, zoomed, in a view perpendicular to the commissures (e.g. PLAX for MR and AR).",
      "Acute severe regurgitation may have a small jet and normal chamber size; the CW signal is dense and may be truncated.",
      "Ventilated or hypotensive patients: lower afterload can make MR look less severe.",
    ],
  },
  ar_pht: {
    title: "AR pressure half-time",
    points: [
      "CW through the AR jet from the apical window, well aligned.",
      "PHT reflects both the AR severity and the LV diastolic pressure. A stiff LV or raised LVEDP shortens PHT; vasodilators also change it.",
      "Use as supportive evidence only. Chronic severe AR with a compliant, dilated LV can still have PHT > 200 ms.",
    ],
  },
  pisa: {
    title: "PISA",
    points: [
      "Zoom on the regurgitant orifice, shift the colour baseline towards the jet direction (about 30–40 cm/s) to enlarge the hemisphere.",
      "Measure the radius from the orifice to the first aliasing line in mid-systole (the same frame as peak regurgitant velocity).",
      "Assumes a hemispherical, single, round orifice. It's less accurate for eccentric jets, multiple jets, and secondary MR with a crescent-shaped orifice (underestimates).",
      "EROA = 2πr² × Va / Vmax; regurgitant volume = EROA × VTI of the regurgitant jet.",
      "In secondary (functional) MR, ESC uses EROA ≥ 0.2 cm² and RVol ≥ 30 ml as severe.",
    ],
  },
  ms_grade: {
    title: "Mitral stenosis",
    points: [
      "Planimetry in PSAX at the leaflet tips (scan from base to tips to find the smallest orifice) is the reference method.",
      "Mean gradient depends on heart rate and flow; always report the HR alongside it.",
      "MVA by pressure half-time (220/PHT) is unreliable immediately after balloon valvotomy, with significant AR, with abnormal LV compliance, and in older patients with calcific (degenerative) MS.",
      "In AF use beats with similar R-R intervals and average.",
    ],
  },
  effusion: {
    title: "Pericardial effusion and tamponade",
    points: [
      "Measure the largest echo-free space in diastole. Report location (circumferential or loculated) and whether it's free or contains fibrin.",
      "Epicardial fat is anterior, often granular and moves with the heart; a pleural effusion lies behind the descending aorta in PLAX, a pericardial effusion in front of it.",
      "Tamponade is a clinical diagnosis. Supportive echo signs: RA systolic collapse lasting more than a third of systole, RV diastolic collapse, plethoric IVC, and exaggerated respiratory variation in mitral (> 25%) and tricuspid (> 40%) inflow.",
      "Post-cardiac surgery, loculated clots can compress single chambers without a large effusion. TOE may be needed.",
      "In ventilated patients respiratory variation patterns reverse and are less reliable.",
    ],
  },
};

// ---------- Views ----------
export interface Media {
  src: string;
  label: string;
  still?: boolean;
  note?: string;
  marks?: [number, number, string][]; // [x%, y%, text] structure labels
}

export interface ViewGuide {
  id: string;
  name: string;
  group: "Parasternal" | "Apical" | "Subcostal" | "Suprasternal";
  probe: string;
  marker: string;
  structures: string[];
  optimise: string[];
  measure: string[];
  pitfalls: string[];
  diagram: string; // id in Diagrams.tsx
  /** Real images in public/views: loops (.mp4 + .jpg poster) and measured stills (.jpg). Anonymised. */
  media?: Media[];
}

export const VIEWS: ViewGuide[] = [
  {
    id: "plax", name: "Parasternal long axis (PLAX)", group: "Parasternal", diagram: "plax", media: [{ src: "plax", label: "Loop" }, { src: "m_plax_linear", label: "LV dimensions", still: true, note: "IVSd, LVIDd and LVPWd measured at end-diastole, perpendicular to the LV long axis.", marks: [[27, 60, "LV"], [55, 30, "RV"], [57, 48, "Ao"], [61, 72, "LA"]] }, { src: "m_ao_la_mmode", label: "Ao / LA M-mode", still: true, note: "M-mode through the aortic root and LA: root diameter at end-diastole, LA at end-systole." }], 
    probe: "Left sternal edge, 3rd–4th intercostal space. Patient in left lateral decubitus with the left arm up.",
    marker: "Towards the right shoulder (about 10 o'clock).",
    structures: ["RV outflow (anterior)", "Interventricular septum", "LV cavity and posterior wall", "Aortic root and valve", "Mitral valve", "Left atrium", "Descending aorta (behind the LA)"],
    optimise: [
      "Aim for a horizontal LV with the septum and posterior wall parallel. Slide up or down a rib space or tilt to level it.",
      "Rotate slightly until both aortic and mitral valves open fully. If the LV apex is visible, you're probably too low.",
      "Set depth to just beyond the descending aorta (around 16 cm), then reduce to the structure of interest when zooming.",
      "Bring the patient further onto their left side and use end-expiration breath-holds if possible.",
      "Mechanically ventilated: PLAX is often poor; try the subcostal window first.",
    ],
    measure: ["LVIDd/LVIDs, IVSd, LVPWd (at the mitral leaflet tips)", "LVOT diameter (mid-systole, zoomed)", "Aortic root and ascending aorta", "MR and AR vena contracta with colour", "Pericardial and pleural effusion relation to the descending aorta"],
    pitfalls: ["Oblique cut overestimates LV dimensions and wall thickness.", "RV trabeculae or moderator band included in the septum.", "Mistaking a left pleural effusion for a pericardial effusion: pericardial fluid tracks in front of the descending aorta."],
  },
  {
    id: "rvin", name: "RV inflow", group: "Parasternal", diagram: "plax", media: [{ src: "rvin", label: "Loop" }], 
    probe: "From PLAX, tilt the probe tail towards the patient's left shoulder (beam inferomedially).",
    marker: "As PLAX, small rotation clockwise.",
    structures: ["Right atrium", "Tricuspid valve (anterior and posterior leaflets)", "RV inflow", "Coronary sinus and IVC entry"],
    optimise: ["Useful window for TR jets aligned with CW Doppler.", "Adjust tilt until both TV leaflets open fully."],
    measure: ["TR colour and CW velocity"],
    pitfalls: ["Don't mistake the coronary sinus for an effusion."],
  },
  {
    id: "psax_av", name: "PSAX: aortic valve level", group: "Parasternal", diagram: "psax_av",
    probe: "From PLAX, rotate clockwise 90° and tilt towards the right shoulder.",
    marker: "Towards the left shoulder (about 2 o'clock).",
    structures: ["Aortic valve cusps (right, left, non-coronary): the 'Mercedes sign'", "Left and right atria, interatrial septum", "Tricuspid valve", "RVOT, pulmonary valve and main PA"],
    optimise: ["Aim for a round aortic valve with three equal cusps. An oval valve means the cut is oblique.", "Tilt slightly up to open out the RVOT and PA bifurcation."],
    measure: ["AV morphology (bicuspid, calcification)", "RVOT PW: acceleration time and notching", "TR velocity", "Pulmonary valve and PR", "PA diameter"],
    pitfalls: ["A raphe can make a bicuspid valve look trileaflet in diastole. Check the systolic opening shape (fish-mouth)."],
  },
  {
    id: "psax_mv", name: "PSAX: mitral valve level", group: "Parasternal", diagram: "psax_mv", media: [{ src: "psax_mv", label: "Loop" }], 
    probe: "From AV level, tilt the probe tail up so the beam points towards the apex.",
    marker: "As PSAX.",
    structures: ["Anterior and posterior mitral leaflets ('fish mouth')", "Basal LV segments", "RV"],
    optimise: ["Scan up and down to find the leaflet tips (smallest orifice) for MS planimetry."],
    measure: ["MV planimetry for MS", "Origin of MR jets (scallop)", "Basal wall motion"],
    pitfalls: ["Planimetry above the tips overestimates MVA."],
  },
  {
    id: "psax_pm", name: "PSAX: papillary muscle level", group: "Parasternal", diagram: "psax_pm",
    probe: "Tilt further towards the apex until both papillary muscles are seen.",
    marker: "As PSAX.",
    structures: ["Mid LV with anterolateral and posteromedial papillary muscles", "All 3 coronary territories in one view", "RV in cross-section"],
    optimise: ["Aim for a round LV ('doughnut'). An oval LV makes the septum look falsely flat.", "Keep both papillary muscles at the same depth."],
    measure: ["Eyeball LV function and regional wall motion", "Septal shape (D-sign), eccentricity index", "Fractional area change"],
    pitfalls: ["Off-axis cuts mimic septal flattening.", "Hypovolaemia: papillary muscles 'kiss' in systole (end-systolic cavity obliteration)."],
  },
  {
    id: "psax_apex", name: "PSAX: apical level", group: "Parasternal", diagram: "psax_pm",
    probe: "Slide down one rib space and laterally from the papillary level.",
    marker: "As PSAX.",
    structures: ["Apical LV segments"],
    optimise: ["Useful for apical thrombus or apical wall motion abnormality."],
    measure: ["Apical wall motion"],
    pitfalls: ["Near-field clutter can mimic thrombus. Use a higher frequency or contrast."],
  },
  {
    id: "a4c", name: "Apical four chamber (A4C)", group: "Apical", diagram: "a4c", media: [{ src: "a4c", label: "Loop" }, { src: "a4c_rv", label: "RV-focused loop" }, { src: "m_a4c_simpson", label: "Simpson\u2019s trace", still: true, note: "End-diastolic LV trace for biplane Simpson\u2019s: true apex, papillary muscles inside the cavity, closed across the mitral annulus.", marks: [[57, 50, "LV"], [34, 45, "RV"]] }, { src: "m_mv_inflow", label: "Mitral inflow", still: true, note: "PW at the leaflet tips: E and A peaks marked; E/A 1.1." }, { src: "m_tapse", label: "TAPSE", still: true, note: "M-mode through the lateral tricuspid annulus: TAPSE 2.3 cm (normal \u2265 1.7 cm)." }], 
    probe: "At the apex beat (often 5th intercostal space, anterior or mid-axillary line). Patient in steep left lateral position.",
    marker: "Towards the patient's left (about 3 o'clock). UK and US conventions differ in screen orientation; follow your machine's.",
    structures: ["LV, RV, LA, RA", "Mitral and tricuspid valves", "Interventricular and interatrial septa", "Pulmonary veins entering the LA"],
    optimise: [
      "Find the true apex: the LV should be long and bullet-shaped, and the apex should stay still. Slide the probe down and laterally if it looks foreshortened.",
      "Keep the septum vertical in the centre of the sector.",
      "If the LVOT appears you're in A5C: tilt the tail upward to drop it out.",
      "Use the apical cut-out in the bed or a gel pad.",
      "Reduce depth so the atria just fit for LV work. Make separate LA-focused and RV-focused views for those measurements.",
    ],
    measure: ["Biplane Simpson's (with A2C)", "Mitral inflow (E, A, DT)", "Septal and lateral e′, S′", "TAPSE and RV S′ (RV-focused)", "RV basal diameter and RV:LV ratio", "LA and RA area/volume (atrial-focused)", "MR and TR colour; TR CW velocity", "Pericardial effusion"],
    pitfalls: ["Foreshortening underestimates volumes and makes the apex look hypokinetic or normal when it isn't.", "Dropout of the lateral wall: rotate slightly or use contrast.", "RV size varies a lot with probe rotation."],
  },
  {
    id: "a5c", name: "Apical five chamber (A5C)", group: "Apical", diagram: "a5c", media: [{ src: "a5c", label: "Loop" }, { src: "m_lvot_vti", label: "LVOT PW", still: true, note: "PW sample just below the aortic valve: trace the modal velocity for the VTI." }, { src: "m_av_cw", label: "AV CW", still: true, note: "CW through the aortic valve: peak velocity 1.2 m/s, so no stenosis." }], 
    probe: "From A4C, tilt the probe tail down (beam angled anteriorly) until the LVOT and aortic valve appear.",
    marker: "As A4C.",
    structures: ["LVOT and aortic valve between the four chambers"],
    optimise: ["Small tilt only; too much loses the LV apex.", "Align the LVOT parallel to the Doppler beam."],
    measure: ["LVOT PW VTI (stroke volume)", "AV CW velocity and gradients", "AR colour and CW (PHT)", "Dynamic LVOT obstruction (CW, late-peaking)"],
    pitfalls: ["Sample volume too close to the valve gives AV velocities in the 'LVOT' trace.", "Poor alignment underestimates VTI and AS gradients."],
  },
  {
    id: "a2c", name: "Apical two chamber (A2C)", group: "Apical", diagram: "a2c", media: [{ src: "a2c", label: "Loop" }], 
    probe: "From A4C, rotate anticlockwise about 60° until the RV disappears.",
    marker: "Towards the left neck (about 12–1 o'clock).",
    structures: ["LV anterior (right of screen) and inferior (left) walls", "LA and LA appendage", "Mitral valve"],
    optimise: ["Keep the apex still while rotating; check no RV remains.", "Coronary sinus visible in cross-section at the atrioventricular groove is a useful landmark."],
    measure: ["Biplane Simpson's (with A4C)", "Anterior and inferior wall motion", "LA volume (biplane)"],
    pitfalls: ["Under-rotation leaves part of the RV in view and overestimates volumes."],
  },
  {
    id: "a3c", name: "Apical three chamber (A3C, apical long axis)", group: "Apical", diagram: "a5c", media: [{ src: "a3c", label: "Loop" }], 
    probe: "From A2C, rotate anticlockwise a further 60° until the LVOT and aortic valve appear.",
    marker: "Towards the right shoulder (about 10–11 o'clock).",
    structures: ["LV anteroseptal and inferolateral walls", "LVOT and aortic valve", "Mitral valve and LA"],
    optimise: ["Often the best alignment for LVOT and AV Doppler.", "Equivalent to an apical PLAX."],
    measure: ["LVOT VTI and AV CW when A5C is poorly aligned", "MR and AR jets"],
    pitfalls: ["Foreshortening is common; slide laterally to find the true apex."],
  },
  {
    id: "sc4c", name: "Subcostal four chamber", group: "Subcostal", diagram: "sc4c", media: [{ src: "sc4c", label: "Loop" }], 
    probe: "Just below the xiphisternum, probe held from above and nearly flat on the abdomen, beam towards the left shoulder. Bend the patient's knees to relax the abdomen.",
    marker: "Towards the patient's left (about 3 o'clock).",
    structures: ["Liver (near field)", "RV free wall and RA (closest)", "LV, LA", "Interatrial septum (perpendicular to the beam: best view for ASD)", "Pericardium"],
    optimise: ["Often the only useful window in ventilated, post-operative or COPD patients.", "Press firmly and flatten the probe; increase depth (20+ cm).", "Ask for a breath in if the patient can, to bring the heart down."],
    measure: ["Pericardial effusion (especially around the RV)", "RV free wall thickness", "Global function and RV:LV ratio", "Interatrial septum"],
    pitfalls: ["Foreshortened views make the RV look larger than the LV. Don't call RV dilatation from this view alone.", "TAPSE and Doppler are poorly aligned here."],
  },
  {
    id: "ivc", name: "Subcostal IVC", group: "Subcostal", diagram: "ivc",
    probe: "From subcostal 4C, rotate anticlockwise 90° so the marker points to the head, and aim slightly to the patient's right.",
    marker: "Towards the head (12 o'clock).",
    structures: ["IVC entering the RA", "Hepatic veins draining into the IVC", "Liver"],
    optimise: ["Show the IVC entering the RA to avoid confusing it with the aorta (which is to the left, pulsatile, thick-walled and has no hepatic tributaries).", "Use M-mode perpendicular to the IVC, or 2D measurements, 1–2 cm from the RA junction.", "Keep the IVC in plane during respiration; it moves with the diaphragm and can slide out of the cut, mimicking collapse."],
    measure: ["Maximal diameter and percentage collapse with sniff", "Hepatic vein PW flow (systolic reversal in severe TR)"],
    pitfalls: ["Translational movement out of plane looks like collapse.", "Ventilation, raised abdominal pressure and athletes: see the IVC caveat."],
  },
  {
    id: "ssn", name: "Suprasternal notch", group: "Suprasternal", diagram: "ssn",
    probe: "In the suprasternal notch with the neck extended (pillow under the shoulders), beam angled down towards the heart.",
    marker: "Towards the left jaw or ear (about 1 o'clock) for the arch long axis.",
    structures: ["Aortic arch with ascending and descending segments", "Head and neck vessel origins", "Right pulmonary artery in cross-section beneath the arch"],
    optimise: ["Small rotations bring the full arch into one plane."],
    measure: ["CW of the descending aorta (coarctation)", "Holodiastolic flow reversal in severe AR", "AS CW velocity (aligned with ascending aorta)"],
    pitfalls: ["Often uncomfortable or impossible in ventilated patients and those with neck lines."],
  },
];

// ---------- Reference tables ----------
export interface RefTable { title: string; source: string; head: string[]; rows: string[][]; note?: string }

export const REFS: RefTable[] = [
  {
    title: "LV systolic function (UK)", source: "BSE normal reference intervals 2020",
    head: ["Category", "LVEF"], rows: [["Hyperdynamic", "> 70%"], ["Normal", "≥ 55%"], ["Borderline low", "50–54%"], ["Impaired", "36–49%"], ["Severely impaired", "≤ 35%"]],
    note: "ASE/EACVI 2015 uses normal ≥ 52% (men) and ≥ 54% (women), mildly abnormal 41–51/53%, moderately 30–40%, severely < 30%.",
  },
  {
    title: "LV size and wall thickness", source: "ASE/EACVI chamber quantification 2015",
    head: ["Measure", "Men", "Women"], rows: [
      ["LVIDd (cm)", "4.2–5.8", "3.8–5.2"], ["LVIDs (cm)", "2.5–4.0", "2.2–3.5"], ["IVSd / LVPWd (cm)", "0.6–1.0", "0.6–0.9"],
      ["EDV index (ml/m²)", "34–74", "29–61"], ["ESV index (ml/m²)", "11–31", "8–24"], ["LV mass index, linear (g/m²)", "49–115", "43–95"], ["Relative wall thickness", "≤ 0.42", "≤ 0.42"],
    ],
    note: "RWT > 0.42 with normal mass = concentric remodelling; with raised mass = concentric hypertrophy. Normal RWT with raised mass = eccentric hypertrophy.",
  },
  {
    title: "RV size and function", source: "ASE/EACVI 2015; ASE right heart 2010",
    head: ["Measure", "Abnormal"], rows: [
      ["RV basal diameter", "> 41 mm"], ["RV mid diameter", "> 35 mm"], ["RV:LV basal ratio", "> 0.6 dilated; > 1.0 severely"], ["RV free wall thickness", "> 5 mm"], ["RVOT proximal (PLAX)", "> 35 mm"],
      ["TAPSE", "< 17 mm"], ["RV S′ (TDI)", "< 9.5 cm/s"], ["RV FAC", "< 35%"], ["TAPSE/sPAP", "< 0.55 mm/mmHg (supports PH)"],
    ],
    note: "The RV:LV ratio thresholds are widely used in acute care (e.g. PE) rather than set in a single guideline.",
  },
  {
    title: "Atria", source: "ASE/EACVI 2015; BSE",
    head: ["Measure", "Normal", "Mild", "Moderate", "Severe"], rows: [["LA volume index (ml/m²)", "≤ 34", "35–41", "42–48", "> 48"], ["LA area A4C (cm²)", "≤ 20", "", "", ""], ["RA area A4C (cm²)", "≤ 18", "", "", ""]],
  },
  {
    title: "Aorta (upper limits, approximate)", source: "ASE/EACVI 2015 (mean + 2 SD)",
    head: ["Level", "Men", "Women"], rows: [["Sinuses of Valsalva", "4.0 cm", "3.6 cm"], ["Proximal ascending aorta", "3.8 cm", "3.5 cm"]],
    note: "Size increases with BSA and age; use indexed values or z-scores for borderline cases.",
  },
  {
    title: "Aortic stenosis", source: "EAE/ASE 2009/2017; ESC/EACTS 2021",
    head: ["", "Mild", "Moderate", "Severe"], rows: [["Peak velocity (m/s)", "2.6–2.9", "3.0–3.9", "≥ 4.0"], ["Mean gradient (mmHg)", "< 20", "20–39", "≥ 40"], ["AVA (cm²)", "> 1.5", "1.0–1.5", "< 1.0"], ["AVA index (cm²/m²)", "> 0.85", "0.60–0.85", "< 0.6"], ["Dimensionless index", "> 0.50", "0.25–0.50", "< 0.25"]],
  },
  {
    title: "Aortic regurgitation", source: "ASE regurgitation 2017",
    head: ["", "Mild", "Moderate", "Severe"], rows: [["Vena contracta (cm)", "< 0.3", "0.3–0.6", "> 0.6"], ["Pressure half-time (ms)", "> 500", "200–500", "< 200"], ["EROA (cm²)", "< 0.10", "0.10–0.29", "≥ 0.30"], ["Regurgitant volume (ml)", "< 30", "30–59", "≥ 60"], ["Descending aorta flow reversal", "Brief, early", "Intermediate", "Holodiastolic (end-diastolic velocity > 20 cm/s)"]],
  },
  {
    title: "Mitral regurgitation", source: "ASE regurgitation 2017; ESC/EACTS 2021",
    head: ["", "Mild", "Moderate", "Severe"], rows: [["Vena contracta (cm)", "< 0.3", "0.3–0.69", "≥ 0.7"], ["EROA (cm²), primary", "< 0.20", "0.20–0.39", "≥ 0.40"], ["Regurgitant volume (ml), primary", "< 30", "30–59", "≥ 60"], ["Pulmonary vein flow", "Systolic dominant", "Blunted", "Systolic reversal"]],
    note: "Secondary (functional) MR: ESC 2021 treats EROA ≥ 0.20 cm² or RVol ≥ 30 ml as severe; PISA underestimates crescent-shaped orifices.",
  },
  {
    title: "Mitral stenosis", source: "EAE/ASE 2009 (ACC/AHA 2020 calls MVA ≤ 1.5 cm² severe)",
    head: ["", "Mild", "Moderate", "Severe"], rows: [["MVA (cm²)", "> 1.5", "1.0–1.5", "< 1.0"], ["Mean gradient (mmHg)*", "< 5", "5–10", "> 10"], ["PA systolic pressure (mmHg)", "< 30", "30–50", "> 50"]],
    note: "*At heart rates of 60–80 bpm in sinus rhythm.",
  },
  {
    title: "Tricuspid regurgitation", source: "ASE regurgitation 2017",
    head: ["", "Mild", "Moderate", "Severe"], rows: [["Vena contracta (cm)", "< 0.3", "0.3–0.69", "≥ 0.7"], ["EROA (cm²)", "< 0.20", "0.20–0.39", "≥ 0.40"], ["Hepatic vein flow", "Systolic dominant", "Systolic blunting", "Systolic reversal"], ["CW signal", "Faint, parabolic", "Dense, variable", "Dense, triangular, early peak"]],
  },
  {
    title: "Right atrial pressure from IVC (spontaneous breathing)", source: "ASE right heart 2010",
    head: ["IVC", "Collapse with sniff", "RAP"], rows: [["≤ 2.1 cm", "> 50%", "3 mmHg (0–5)"], ["≤ 2.1 cm", "< 50%", "8 mmHg (5–10)"], ["> 2.1 cm", "> 50%", "8 mmHg (5–10)"], ["> 2.1 cm", "< 50%", "15 mmHg (10–20)"]],
    note: "Not valid in mechanically ventilated patients.",
  },
  {
    title: "Echo probability of pulmonary hypertension", source: "ESC/ERS 2022",
    head: ["Peak TR velocity", "Other PH signs*", "Probability"], rows: [["≤ 2.8 m/s or not measurable", "No", "Low"], ["≤ 2.8 m/s or not measurable", "Yes", "Intermediate"], ["2.9–3.4 m/s", "No", "Intermediate"], ["2.9–3.4 m/s", "Yes", "High"], ["> 3.4 m/s", "Not required", "High"]],
    note: "*Signs from at least two categories. A, ventricles: RV/LV basal ratio > 1.0, septal flattening (LVEI > 1.1). B, pulmonary artery: RVOT AT < 105 ms and/or mid-systolic notching, early diastolic PR velocity > 2.2 m/s, PA diameter > aortic root or > 25 mm. C, IVC and RA: IVC > 21 mm with reduced collapse, RA area > 18 cm². TAPSE/sPAP < 0.55 mm/mmHg also supports PH.",
  },
  {
    title: "Diastolic function, normal LVEF", source: "ASE/EACVI 2016",
    head: ["Criterion", "Abnormal"], rows: [["Average E/e′", "> 14"], ["Septal e′ or lateral e′", "< 7 or < 10 cm/s"], ["TR velocity", "> 2.8 m/s"], ["LA volume index", "> 34 ml/m²"]],
    note: "More than half positive: diastolic dysfunction. Fewer than half: normal. Exactly half: indeterminate.",
  },
  {
    title: "Diastolic function, reduced LVEF or myocardial disease", source: "ASE/EACVI 2016",
    head: ["Mitral inflow", "Next step", "Result"], rows: [
      ["E/A ≤ 0.8 and E ≤ 50 cm/s", "None", "Normal LAP, grade I"],
      ["E/A ≥ 2", "None", "Raised LAP, grade III"],
      ["E/A ≤ 0.8 with E > 50, or E/A 0.8–2", "Check E/e′ > 14, TR > 2.8 m/s, LAVI > 34", "2–3 positive: raised LAP, grade II. 2–3 negative: normal LAP, grade I. Only 2 available and discordant: indeterminate"],
    ],
  },
  {
    title: "Pericardial effusion size", source: "ESC pericardial 2015",
    head: ["Size", "Diastolic depth"], rows: [["Small", "< 10 mm"], ["Moderate", "10–20 mm"], ["Large", "> 20 mm"]],
  },
  {
    title: "Normal Doppler values (adult, approximate)", source: "General reference",
    head: ["Measure", "Typical"], rows: [["LVOT VTI", "18–22 cm"], ["Stroke volume index", "35–65 ml/m²"], ["Cardiac index", "2.5–4.0 L/min/m²"], ["RVOT acceleration time", "> 105 ms"]],
  },
];

// ---------- Formulae ----------
export const FORMULAE: { name: string; formula: string; note?: string }[] = [
  { name: "Body surface area (Mosteller)", formula: "BSA = √(height cm × weight kg / 3600)" },
  { name: "LVOT area", formula: "π × (LVOT diameter / 2)²", note: "Diameter error is squared." },
  { name: "Stroke volume", formula: "SV = LVOT area × LVOT VTI" },
  { name: "Cardiac output", formula: "CO = SV × HR" },
  { name: "Simplified Bernoulli", formula: "ΔP = 4V²", note: "V in m/s, ΔP in mmHg." },
  { name: "RVSP", formula: "RVSP = 4 × (TR Vmax)² + RAP" },
  { name: "Mean PAP (Chemla)", formula: "mPAP ≈ 0.61 × sPAP + 2" },
  { name: "Continuity equation (AVA)", formula: "AVA = LVOT area × LVOT VTI / AV VTI" },
  { name: "Dimensionless index", formula: "DVI = LVOT VTI / AV VTI" },
  { name: "PISA EROA", formula: "EROA = 2πr² × Va / Vmax" },
  { name: "Regurgitant volume", formula: "RVol = EROA × VTI of regurgitant jet" },
  { name: "MVA by pressure half-time", formula: "MVA = 220 / PHT" },
  { name: "LV mass (ASE linear)", formula: "0.8 × 1.04 × [(IVSd + LVIDd + LVPWd)³ − LVIDd³] + 0.6 g" },
  { name: "Relative wall thickness", formula: "RWT = 2 × LVPWd / LVIDd" },
  { name: "EF", formula: "EF = (EDV − ESV) / EDV × 100" },
  { name: "RV fractional area change", formula: "FAC = (EDA − ESA) / EDA × 100" },
  { name: "LA volume (area-length)", formula: "LAV = 0.85 × A4C area × A2C area / shortest length" },
  { name: "Qp:Qs", formula: "(RVOT area × RVOT VTI) / (LVOT area × LVOT VTI)" },
];
