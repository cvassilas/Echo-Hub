/**
 * Bibliography for every explainer, reference table and view guide.
 * Links go to the guideline page where verified, otherwise to a PubMed search for the exact title.
 */
export interface Reference { cite: string; url: string }

const pm = (title: string) => `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(title)}`;

export const REFERENCES: Record<string, Reference> = {
  lang2015: { cite: "Lang RM, et al. Recommendations for cardiac chamber quantification by echocardiography in adults: an update from the ASE and EACVI. J Am Soc Echocardiogr 2015;28:1–39.", url: pm("Recommendations for cardiac chamber quantification by echocardiography in adults: an update from the American Society of Echocardiography and the European Association of Cardiovascular Imaging") },
  harkness2020: { cite: "Harkness A, et al. Normal reference intervals for cardiac dimensions and function for use in echocardiographic practice: a guideline from the British Society of Echocardiography. Echo Res Pract 2020;7:G1–G18.", url: pm("Normal reference intervals for cardiac dimensions and function for use in echocardiographic practice: a guideline from the British Society of Echocardiography") },
  bsePoster2020: { cite: "British Society of Echocardiography. Normal reference values poster (2020).", url: "https://www.bsecho.org/common/Uploaded%20files/Education/Posters/BSE%20A1%20New%20Normal%20references%20Mar%2020.pdf" },
  bseMds2020: { cite: "Robinson S, et al. A practical guideline for performing a comprehensive transthoracic echocardiogram in adults: the British Society of Echocardiography minimum dataset. Echo Res Pract 2020;7:G59–G93.", url: pm("A practical guideline for performing a comprehensive transthoracic echocardiogram in adults: the British Society of Echocardiography minimum dataset") },
  mitchell2019: { cite: "Mitchell C, et al. Guidelines for performing a comprehensive transthoracic echocardiographic examination in adults: recommendations from the ASE. J Am Soc Echocardiogr 2019;32:1–64.", url: pm("Guidelines for Performing a Comprehensive Transthoracic Echocardiographic Examination in Adults: Recommendations from the American Society of Echocardiography") },
  nagueh2025: { cite: "Nagueh SF, et al. Recommendations for the evaluation of left ventricular diastolic function by echocardiography and for heart failure with preserved ejection fraction diagnosis: an update from the ASE. J Am Soc Echocardiogr 2025.", url: "https://www.asecho.org/wp-content/uploads/2025/07/Left-Ventricular-Diastolic-Function.pdf" },
  nagueh2016: { cite: "Nagueh SF, et al. Recommendations for the evaluation of left ventricular diastolic function by echocardiography: an update from the ASE and EACVI. J Am Soc Echocardiogr 2016;29:277–314.", url: pm("Recommendations for the Evaluation of Left Ventricular Diastolic Function by Echocardiography: An Update from the American Society of Echocardiography and the European Association of Cardiovascular Imaging") },
  nagueh1997: { cite: "Nagueh SF, et al. Doppler tissue imaging: a noninvasive technique for evaluation of left ventricular relaxation and estimation of filling pressures. J Am Coll Cardiol 1997;30:1527–33.", url: pm("Doppler tissue imaging: a noninvasive technique for evaluation of left ventricular relaxation and estimation of filling pressures") },
  rudski2010: { cite: "Rudski LG, et al. Guidelines for the echocardiographic assessment of the right heart in adults (ASE, endorsed by EAE and CSE). J Am Soc Echocardiogr 2010;23:685–713.", url: pm("Guidelines for the echocardiographic assessment of the right heart in adults: a report from the American Society of Echocardiography") },
  humbert2022: { cite: "Humbert M, et al. 2022 ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension. Eur Heart J 2022;43:3618–3731.", url: pm("2022 ESC/ERS Guidelines for the diagnosis and treatment of pulmonary hypertension") },
  chemla2004: { cite: "Chemla D, et al. New formula for predicting mean pulmonary artery pressure using systolic pulmonary artery pressure. Chest 2004;126:1313–7.", url: pm("New formula for predicting mean pulmonary artery pressure using systolic pulmonary artery pressure") },
  zoghbi2017: { cite: "Zoghbi WA, et al. Recommendations for noninvasive evaluation of native valvular regurgitation (ASE, with SCMR). J Am Soc Echocardiogr 2017;30:303–71.", url: pm("Recommendations for Noninvasive Evaluation of Native Valvular Regurgitation") },
  baumgartner2017: { cite: "Baumgartner H, et al. Recommendations on the echocardiographic assessment of aortic valve stenosis: a focused update from the EACVI and ASE. J Am Soc Echocardiogr 2017;30:372–92.", url: pm("Recommendations on the echocardiographic assessment of aortic valve stenosis: a focused update from the European Association of Cardiovascular Imaging and the American Society of Echocardiography") },
  baumgartner2009: { cite: "Baumgartner H, et al. Echocardiographic assessment of valve stenosis: EAE/ASE recommendations for clinical practice. J Am Soc Echocardiogr 2009;22:1–23.", url: pm("Echocardiographic assessment of valve stenosis: EAE/ASE recommendations for clinical practice") },
  vahanian2021: { cite: "Vahanian A, et al. 2021 ESC/EACTS Guidelines for the management of valvular heart disease. Eur Heart J 2022;43:561–632.", url: pm("2021 ESC/EACTS Guidelines for the management of valvular heart disease") },
  praz2025: { cite: "Praz F, Borger MA, et al. 2025 ESC/EACTS Guidelines for the management of valvular heart disease. Eur Heart J 2025.", url: pm("2025 ESC/EACTS Guidelines for the management of valvular heart disease") },
  bseAr2024: { cite: "British Society of Echocardiography. Aortic regurgitation guideline: grading table. Echo Res Pract 2024.", url: "https://echo.biomedcentral.com/articles/10.1186/s44156-024-00067-8/tables/31" },
  adler2015: { cite: "Adler Y, et al. 2015 ESC Guidelines for the diagnosis and management of pericardial diseases. Eur Heart J 2015;36:2921–64.", url: pm("2015 ESC Guidelines for the diagnosis and management of pericardial diseases") },
  quinones2002: { cite: "Quiñones MA, et al. Recommendations for quantification of Doppler echocardiography (ASE Nomenclature and Standards Committee). J Am Soc Echocardiogr 2002;15:167–84.", url: pm("Recommendations for quantification of Doppler echocardiography: a report from the Doppler Quantification Task Force of the Nomenclature and Standards Committee of the American Society of Echocardiography") },
  voigt2015: { cite: "Voigt JU, et al. Definitions for a common standard for 2D speckle tracking echocardiography: consensus document of the EACVI/ASE/Industry Task Force. J Am Soc Echocardiogr 2015;28:183–93.", url: pm("Definitions for a common standard for 2D speckle tracking echocardiography: consensus document of the EACVI/ASE/Industry Task Force to standardize deformation imaging") },
  badano2018: { cite: "Badano LP, et al. Standardization of left atrial, right ventricular, and right atrial deformation imaging using 2D speckle tracking echocardiography. Eur Heart J Cardiovasc Imaging 2018;19:591–600.", url: pm("Standardization of left atrial, right ventricular, and right atrial deformation imaging using two-dimensional speckle tracking echocardiography") },
  pathan2017: { cite: "Pathan F, et al. Normal ranges of left atrial strain by speckle-tracking echocardiography: a systematic review and meta-analysis. J Am Soc Echocardiogr 2017;30:59–70.", url: pm("Normal Ranges of Left Atrial Strain by Speckle-Tracking Echocardiography: A Systematic Review and Meta-Analysis") },
  devereux1986: { cite: "Devereux RB, et al. Echocardiographic assessment of left ventricular hypertrophy: comparison to necropsy findings. Am J Cardiol 1986;57:450–8.", url: pm("Echocardiographic assessment of left ventricular hypertrophy: comparison to necropsy findings") },
  mosteller1987: { cite: "Mosteller RD. Simplified calculation of body-surface area. N Engl J Med 1987;317:1098.", url: pm("Simplified calculation of body-surface area") },
  massie1977: { cite: "Massie BM, et al. Mitral-septal separation: new echocardiographic index of left ventricular function. Am J Cardiol 1977;39:1008–16.", url: pm("Mitral-septal separation: new echocardiographic index of left ventricular function") },
  tei1995: { cite: "Tei C, et al. New index of combined systolic and diastolic myocardial performance: a simple and reproducible measure of cardiac function. J Cardiol 1995;26:357–66.", url: pm("New index of combined systolic and diastolic myocardial performance: a simple and reproducible measure of cardiac function") },
  tello2019: { cite: "Tello K, et al. Validation of the tricuspid annular plane systolic excursion/systolic pulmonary artery pressure ratio for the assessment of right ventricular-arterial coupling in severe pulmonary hypertension. Circ Cardiovasc Imaging 2019;12:e009047.", url: pm("Validation of the Tricuspid Annular Plane Systolic Excursion/Systolic Pulmonary Artery Pressure Ratio for the Assessment of Right Ventricular-Arterial Coupling in Severe Pulmonary Hypertension") },
  chen2001: { cite: "Chen CH, et al. Noninvasive single-beat determination of left ventricular end-systolic elastance in humans. J Am Coll Cardiol 2001;38:2028–34.", url: pm("Noninvasive single-beat determination of left ventricular end-systolic elastance in humans") },
  guarracino2014: { cite: "Guarracino F, et al. Ventriculoarterial decoupling in human septic shock. Crit Care 2014;18:R80.", url: pm("Ventriculoarterial decoupling in human septic shock") },
  abbas2003: { cite: "Abbas AE, et al. A simple method for noninvasive estimation of pulmonary vascular resistance. J Am Coll Cardiol 2003;41:1021–7.", url: pm("A simple method for noninvasive estimation of pulmonary vascular resistance") },
  beaubien2020: { cite: "Beaubien-Souligny W, et al. Quantifying systemic congestion with point-of-care ultrasound: development of the venous excess ultrasound grading system. Ultrasound J 2020;12:16.", url: pm("Quantifying systemic congestion with Point-Of-Care ultrasound: development of the venous excess ultrasound grading system") },
  feissel2001: { cite: "Feissel M, et al. Respiratory changes in aortic blood velocity as an indicator of fluid responsiveness in ventilated patients with septic shock. Chest 2001;119:867–73.", url: pm("Respiratory changes in aortic blood velocity as an indicator of fluid responsiveness in ventilated patients with septic shock") },
  barbier2004: { cite: "Barbier C, et al. Respiratory changes in inferior vena cava diameter are helpful in predicting fluid responsiveness in ventilated septic patients. Intensive Care Med 2004;30:1740–6.", url: pm("Respiratory changes in inferior vena cava diameter are helpful in predicting fluid responsiveness in ventilated septic patients") },
  monnet2006: { cite: "Monnet X, et al. Passive leg raising predicts fluid responsiveness in the critically ill. Crit Care Med 2006;34:1402–7.", url: pm("Passive leg raising predicts fluid responsiveness in the critically ill") },
  lichtenstein2008: { cite: "Lichtenstein DA, Mezière GA. Relevance of lung ultrasound in the diagnosis of acute respiratory failure: the BLUE protocol. Chest 2008;134:117–25.", url: pm("Relevance of lung ultrasound in the diagnosis of acute respiratory failure: the BLUE protocol") },
  volpicelli2012: { cite: "Volpicelli G, et al. International evidence-based recommendations for point-of-care lung ultrasound. Intensive Care Med 2012;38:577–91.", url: pm("International evidence-based recommendations for point-of-care lung ultrasound") },
  soummer2012: { cite: "Soummer A, et al. Ultrasound assessment of lung aeration loss during a successful weaning trial predicts postextubation distress. Crit Care Med 2012;40:2064–72.", url: pm("Ultrasound assessment of lung aeration loss during a successful weaning trial predicts postextubation distress") },
  balik2006: { cite: "Balik M, et al. Ultrasound estimation of volume of pleural fluid in mechanically ventilated patients. Intensive Care Med 2006;32:318–21.", url: pm("Ultrasound estimation of volume of pleural fluid in mechanically ventilated patients") },
  dinino2014: { cite: "DiNino E, et al. Diaphragm ultrasound as a predictor of successful extubation from mechanical ventilation. Thorax 2014;69:423–7.", url: pm("Diaphragm ultrasound as a predictor of successful extubation from mechanical ventilation") },
  boussuges2009: { cite: "Boussuges A, et al. Diaphragmatic motion studied by M-mode ultrasonography: methods, reproducibility, and normal values. Chest 2009;135:391–400.", url: pm("Diaphragmatic motion studied by m-mode ultrasonography: methods, reproducibility, and normal values") },
  aaslid1982: { cite: "Aaslid R, et al. Noninvasive transcranial Doppler ultrasound recording of flow velocity in basal cerebral arteries. J Neurosurg 1982;57:769–74.", url: pm("Noninvasive transcranial Doppler ultrasound recording of flow velocity in basal cerebral arteries") },
  lindegaard1989: { cite: "Lindegaard KF, et al. Cerebral vasospasm diagnosis by means of angiography and blood velocity measurements. Acta Neurochir 1989;100:12–24.", url: pm("Cerebral vasospasm diagnosis by means of angiography and blood velocity measurements") },
  bouzat2011: { cite: "Bouzat P, et al. Transcranial Doppler to screen on admission patients with mild to moderate traumatic brain injury. Neurosurgery 2011;68:1603–9.", url: pm("Transcranial Doppler to screen on admission patients with mild to moderate traumatic brain injury") },
  robba2019: { cite: "Robba C, et al. Brain ultrasonography: methodology, basic and advanced principles and clinical applications. A narrative review. Intensive Care Med 2019;45:913–27.", url: pm("Brain ultrasonography: methodology, basic and advanced principles and clinical applications. A narrative review") },
  robba2018: { cite: "Robba C, et al. Optic nerve sheath diameter measured sonographically as non-invasive estimator of intracranial pressure: a systematic review and meta-analysis. Intensive Care Med 2018;44:1284–94.", url: pm("Optic nerve sheath diameter measured sonographically as non-invasive estimator of intracranial pressure: a systematic review and meta-analysis") },
  dubourg2011: { cite: "Dubourg J, et al. Ultrasonography of optic nerve sheath diameter for detection of raised intracranial pressure: a systematic review and meta-analysis. Intensive Care Med 2011;37:1059–68.", url: pm("Ultrasonography of optic nerve sheath diameter for detection of raised intracranial pressure: a systematic review and meta-analysis") },
  aomrc2008: { cite: "Academy of Medical Royal Colleges. A code of practice for the diagnosis and confirmation of death. 2008.", url: "https://www.aomrc.org.uk/" },
};

/** Which references back each explainer (CAVEATS id → reference keys). */
export const CAVEAT_REFS: Record<string, string[]> = {
  strain: ["voigt2015", "badano2018", "pathan2017", "lang2015", "nagueh2025"],
  diast_invalid: ["nagueh2025"], mitral_inflow: ["nagueh2025", "quinones2002"], eprime: ["nagueh2025"],
  trv: ["humbert2022", "rudski2010"], pvat: ["humbert2022"], ivc_vent: ["rudski2010", "lang2015"],
  ef_visual: ["lang2015", "harkness2020"], simpson: ["lang2015", "harkness2020"], linear_lv: ["lang2015", "harkness2020", "devereux1986"],
  mapse: ["bseMds2020"], lvot_d: ["baumgartner2017", "quinones2002"], lvot_vti: ["quinones2002", "monnet2006"],
  rv_size: ["rudski2010", "lang2015", "harkness2020"], tapse: ["rudski2010", "lang2015"], fac: ["rudski2010", "lang2015"], septum: ["rudski2010", "humbert2022"],
  la_vol: ["lang2015", "harkness2020"], ra_area: ["rudski2010", "harkness2020"], aorta: ["harkness2020", "lang2015"],
  as_grade: ["baumgartner2017", "vahanian2021", "praz2025"], regurg: ["zoghbi2017", "praz2025"], ar_pht: ["zoghbi2017", "bseAr2024"], pisa: ["zoghbi2017", "praz2025"],
  ms_grade: ["baumgartner2009", "vahanian2021"], effusion: ["adler2015"],
  rvpa: ["humbert2022", "tello2019"], vac: ["chen2001", "guarracino2014"], vexus: ["beaubien2020"],
  fluid_resp: ["feissel2001", "barbier2004", "monnet2006"], dpdt: ["quinones2002", "rudski2010"], tei: ["tei1995", "rudski2010", "lang2015"], epss: ["massie1977"],
  lus: ["volpicelli2012", "lichtenstein2008"], lus_score: ["soummer2012", "volpicelli2012"], effusion_vol: ["balik2006"], diaphragm: ["dinino2014", "boussuges2009"],
  tcd: ["aaslid1982", "lindegaard1989", "bouzat2011", "robba2019", "aomrc2008"], onsd: ["robba2018", "dubourg2011", "robba2019"],
  pvr: ["abbas2003", "humbert2022"], bsa: ["mosteller1987", "lang2015"], bernoulli: ["quinones2002", "baumgartner2009"], qpqs: ["quinones2002"], svr: ["quinones2002"],
  rwma: ["lang2015"], rv_wall: ["rudski2010", "lang2015"], pv_flow: ["nagueh2025"], pa_size: ["humbert2022"], rhythm: ["nagueh2025", "lang2015"],
  image_quality: ["bseMds2020", "mitchell2019"], reference_ranges: ["harkness2020", "lang2015"],
};

/** Reference tables (by title prefix) → references. */
export const TABLE_REFS: [string, string[]][] = [
  ["LV systolic function", ["harkness2020", "bsePoster2020", "lang2015"]],
  ["LV size: BSE", ["harkness2020", "bsePoster2020"]],
  ["LV size: ASE", ["lang2015"]],
  ["RV and atria", ["harkness2020", "lang2015", "rudski2010"]],
  ["Aorta", ["harkness2020", "lang2015"]],
  ["Aortic stenosis", ["baumgartner2009", "baumgartner2017", "vahanian2021"]],
  ["Aortic regurgitation", ["zoghbi2017", "bseAr2024"]],
  ["Mitral regurgitation", ["zoghbi2017", "praz2025"]],
  ["Mitral stenosis", ["baumgartner2009", "vahanian2021"]],
  ["Tricuspid regurgitation", ["zoghbi2017"]],
  ["Right atrial pressure", ["rudski2010", "lang2015"]],
  ["Echo probability of pulmonary hypertension", ["humbert2022"]],
  ["Diastolic function", ["nagueh2025"]],
  ["Strain", ["voigt2015", "badano2018", "pathan2017", "lang2015"]],
  ["Pericardial effusion", ["adler2015"]],
  ["Normal Doppler values", ["quinones2002", "lang2015"]],
  ["VExUS", ["beaubien2020"]],
  ["Coupling and advanced", ["humbert2022", "tello2019", "chen2001", "guarracino2014", "abbas2003", "feissel2001", "barbier2004", "rudski2010", "massie1977"]],
  ["Transcranial Doppler", ["aaslid1982", "lindegaard1989", "bouzat2011", "robba2019"]],
  ["Optic nerve sheath", ["robba2018", "dubourg2011"]],
  ["Lung and diaphragm", ["lichtenstein2008", "soummer2012", "balik2006", "dinino2014", "boussuges2009"]],
];
export const tableRefs = (title: string) => TABLE_REFS.find(([p]) => title.startsWith(p))?.[1] || [];

/** View guides → references. */
export const viewRefs = (id: string, group: string): string[] =>
  id.startsWith("vexus") ? ["beaubien2020"] : id === "lus" ? ["volpicelli2012", "lichtenstein2008"] : id === "tcd" ? ["robba2019", "aaslid1982"] : id === "onsd" ? ["robba2018", "robba2019"]
  : group ? ["bseMds2020", "mitchell2019", "lang2015"] : [];
