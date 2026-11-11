/** Free lecture series and teaching sites (checked Nov 2026), plus per-topic video searches. */
export interface LinkItem { name: string; url: string; note: string }

export const LECTURE_LINKS: { group: string; items: LinkItem[] }[] = [
  {
    group: "Lecture series",
    items: [
      { name: "Echo at Nepean (YouTube)", url: "https://www.youtube.com/channel/UC_riiLjIoCX90MOOcivG06w", note: "Nepean ICU critical care echo lectures: RV, valves, haemodynamics, TOE." },
      { name: "Nepean ICU education library", url: "https://www.nepeanicu.org/education-library", note: "Recorded talks and course material from Nepean ICU." },
      { name: "TOTEM (Ultrasound for the Generalist)", url: "https://www.generalistultrasound.com/totem/", note: "Trainee Organised Teaching in Echocardiography: talks mapped to the FUSIC Haemodynamics curriculum." },
      { name: "Ultrasound for the Generalist (YouTube)", url: "https://www.youtube.com/channel/UCETv6ViruNBCfNtTUF9QP6Q", note: "UK generalist and FUSIC-oriented ultrasound videos." },
      { name: "Critical Care Echo (SLICE) lectures", url: "https://www.criticalcareecho.com/resources", note: "South London Intensive Care Echo: lectures, including TOTEM recordings." },
      { name: "Utah weekly echo lecture series", url: "https://echo.anesthesia.med.utah.edu", note: "Recorded weekly echo lectures and focused (FOCUS) content." },
    ],
  },
  {
    group: "Teaching sites",
    items: [
      { name: "Toronto PIE: virtual TTE", url: "https://pie.med.utoronto.ca/TTE/index.htm", note: "Interactive 3D model of the standard TTE views." },
      { name: "123sonography", url: "https://123sonography.com", note: "Echo and ultrasound courses, with free lectures and guideline summaries." },
      { name: "Echopedia", url: "https://echopedia.org", note: "Free echo wiki with normal values and technique pages." },
      { name: "LITFL: echo in intensive care", url: "https://litfl.com/ccc/echocardiography-in-intensive-care/", note: "Concise critical care echo summaries and links." },
      { name: "Core Ultrasound", url: "https://coreultrasound.com", note: "POCUS podcast and videos, including VExUS." },
      { name: "Western Sono", url: "https://westernsono.ca", note: "Focused TTE and TOE image acquisition tutorials." },
      { name: "British Society of Echocardiography", url: "https://www.bsecho.org", note: "UK guidelines, minimum dataset and accreditation." },
    ],
  },
];

/** What to search for each Learn topic. */
const TOPIC: Record<string, string> = {
  plax: "parasternal long axis", rvin: "RV inflow view", psax_av: "parasternal short axis aortic valve", psax_mv: "parasternal short axis mitral valve",
  psax_pm: "parasternal short axis papillary muscle", psax_apex: "parasternal short axis apex", a4c: "apical four chamber", a5c: "apical five chamber LVOT VTI",
  a2c: "apical two chamber", a3c: "apical three chamber", sc4c: "subcostal four chamber", ivc: "IVC assessment", ssn: "suprasternal aortic arch",
  vexus_hv: "VExUS hepatic vein Doppler", vexus_pv: "VExUS portal vein Doppler", vexus_irv: "VExUS intrarenal venous Doppler",
  lus: "lung ultrasound", tcd: "transcranial Doppler", onsd: "optic nerve sheath diameter",
  windows: "echo windows", doppler: "Doppler echocardiography basics", inflow: "diastolic function echo", pisa: "PISA mitral regurgitation",
};

const yt = (q: string) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

/** Video links for a topic: Nepean, TOTEM and a general search. */
export function topicVideos(id: string, name: string): LinkItem[] {
  const t = TOPIC[id] || name;
  return [
    { name: "Echo at Nepean", url: yt(`Echo at Nepean ${t}`), note: "" },
    { name: "TOTEM", url: yt(`TOTEM echo ${t}`), note: "" },
    { name: "All lectures", url: yt(`${t} lecture`), note: "" },
  ];
}
