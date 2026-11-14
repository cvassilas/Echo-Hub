/** Clinical teaching topics (not tied to a single view). */
import type { RefTable } from "./content";

export interface Topic {
  id: string;
  title: string;
  summary: string;
  diagram?: string;
  table?: RefTable;
  sections: { title: string; items: string[]; color?: string }[];
  refs: string[];
}

export const TOPICS: Topic[] = [
  {
    id: "constriction",
    title: "Constrictive pericarditis vs restrictive cardiomyopathy",
    summary: "Both cause heart failure with a small, stiff-filling heart, big atria, a plethoric IVC and raised venous pressure, often with a normal EF. Constriction is a pericardial problem: filling is limited by a rigid shell, so the two ventricles compete for space and filling swings with breathing. Restriction is a myocardial problem: the muscle itself is stiff, so relaxation is poor and filling doesn't vary much with respiration. The distinction matters because constriction can be cured by pericardiectomy.",
    diagram: "constriction",
    table: {
      title: "Echo features side by side", source: "ASE 2013 pericardial disease; Mayo criteria (Welch 2014); ASE 2025 diastology",
      head: ["Feature", "Constriction", "Restriction"],
      rows: [
        ["Septal motion", "Respirophasic shift towards the LV on inspiration; diastolic 'bounce'", "Normal, no respiratory shift"],
        ["Mitral E respiratory variation", "Usually > 25% (falls on inspiration)", "< 10–15%"],
        ["Tricuspid E respiratory variation", "Usually > 40% (rises on inspiration)", "Little"],
        ["Septal (medial) e′", "Normal or high, ≥ 9 cm/s", "Low, often < 6–7 cm/s"],
        ["Septal vs lateral e′", "Septal > lateral ('annulus reversus')", "Both low; lateral ≥ septal"],
        ["E/e′ and filling pressure", "E/e′ may be low despite high pressure ('annulus paradoxus')", "E/e′ high, tracks pressure"],
        ["Hepatic vein", "Expiratory diastolic flow reversal (ratio ≥ 0.79)", "Inspiratory diastolic flow reversal"],
        ["Mitral inflow", "Restrictive pattern possible (E/A > 1.5, short DT) but varies with breathing", "Restrictive: E/A > 2, DT < 160 ms, fixed"],
        ["Pericardium", "Thickened or calcified (often > 4 mm on CT/MRI; echo is poor at this)", "Normal"],
        ["Myocardium and atria", "Normal wall thickness; atria mildly enlarged", "Often thick walls (amyloid), big atria, small effusion common"],
        ["Strain (speckle tracking)", "Longitudinal strain preserved; circumferential reduced; lateral wall strain < septal", "Longitudinal strain reduced; apical sparing in amyloid"],
        ["Pulmonary pressure", "Usually only mildly raised", "Often raised (sPAP > 50 mmHg)"],
      ],
    },
    sections: [
      {
        title: "Mayo Clinic echo criteria (Welch 2014)", color: "#F2B33D",
        items: [
          "1. Respiration-related ventricular septal shift.",
          "2. Septal (medial) e′ ≥ 9 cm/s.",
          "3. Hepatic vein expiratory diastolic reversal ratio ≥ 0.79 (reversal velocity ÷ forward diastolic velocity, in expiration).",
          "Septal shift plus either of the other two: sensitivity 87%, specificity 91% for constriction against surgical or catheter confirmation. All three together raise specificity to 97% (sensitivity falls to 64%).",
        ],
      },
      {
        title: "How to look", color: "var(--c-teal)",
        items: [
          "Connect a respirometer trace (or watch the ECG baseline and the patient's breathing) and use a slow sweep (25–50 mm/s) to see several breaths.",
          "Septal motion: PLAX/PSAX and A4C, and M-mode through the septum. Look for the inspiratory leftward shift and the early diastolic 'bounce'.",
          "Mitral and tricuspid inflow: PW at the leaflet tips. Measure the first beat after inspiration and after expiration: variation = (expiratory E − inspiratory E) ÷ expiratory E.",
          "Tissue Doppler at the septal and lateral mitral annulus: compare e′ values.",
          "Hepatic vein PW (subcostal) with respiration: note diastolic flow reversal in expiration (constriction) or inspiration (restriction).",
          "IVC: plethoric with little collapse in both, so it doesn't separate them.",
          "If available: global and regional longitudinal strain, and a careful look at pericardial thickness and calcification.",
        ],
      },
      {
        title: "Restrictive cardiomyopathy clues", color: "#E05A4F",
        items: [
          "Causes: amyloidosis (most common in older adults), sarcoidosis, haemochromatosis, Fabry disease, radiation, idiopathic, endomyocardial fibrosis.",
          "Amyloid red flags: increased wall thickness with low-voltage ECG, granular 'sparkling' myocardium (non-specific with harmonics), thick valves and interatrial septum, small pericardial effusion, apical sparing of longitudinal strain (apex-to-base ratio > 1), low stroke volume despite normal EF.",
          "Diastology: grade 3 pattern that stays restrictive with no respiratory variation; very low e′ at both annuli.",
        ],
      },
      {
        title: "Pitfalls and mixed pictures", color: "#9aa6ab",
        items: [
          "Respiratory variation is lost in AF, with very high filling pressures, and in mechanically ventilated patients; and is exaggerated in COPD/asthma, large PE, RV infarction, obesity and tamponade.",
          "COPD can mimic constriction, but in COPD the SVC flow rises markedly with inspiration, and in constriction it doesn't.",
          "Effusive-constrictive pericarditis: RA pressure stays high after the effusion is drained.",
          "Radiation can cause both constriction and myocardial restriction in the same patient.",
          "Mitral annular calcification, prosthetic rings or lateral wall infarction affect e′ and can confuse the annulus reversus pattern.",
          "Echo suggests the diagnosis; confirm with CT/MRI (pericardial thickness, inflammation, septal bounce on real-time cine) and, if needed, simultaneous left- and right-heart catheterisation (ventricular interdependence, discordant LV/RV systolic pressures with respiration in constriction).",
        ],
      },
    ],
    refs: ["klein2013", "welch2014", "adler2015", "nagueh2025", "phelan2012"],
  },
];
