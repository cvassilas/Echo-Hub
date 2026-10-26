import React, { useEffect, useState } from "react";
import { FileText, Calculator, GraduationCap, BookOpen, LayoutGrid } from "lucide-react";
import { useData } from "./lib/store";
import { checkForUpdate, installUpdate, UpdateInfo } from "./lib/updates";
import { ReportScreen } from "./components/ReportScreen";
import { CalcScreen } from "./components/CalcScreen";
import { LearnScreen } from "./components/LearnScreen";
import { RefScreen } from "./components/RefScreen";
import { MoreScreen } from "./components/MoreScreen";

type Tab = "report" | "calc" | "learn" | "ref" | "more";
const TITLES: Record<Tab, string> = { report: "Echo report", calc: "Calculators", learn: "Views and tips", ref: "Reference values", more: "Apps and settings" };
const TAB_KEY = "echo_hub_tab";

export default function App() {
  const { settings } = useData();
  const [tab, setTabState] = useState<Tab>(() => { try { return (localStorage.getItem(TAB_KEY) as Tab) || "report"; } catch { return "report"; } });
  const setTab = (t: Tab) => { setTabState(t); try { localStorage.setItem(TAB_KEY, t); } catch { /* */ } window.scrollTo(0, 0); };
  const [update, setUpdate] = useState<UpdateInfo | null>(null);

  useEffect(() => { document.documentElement.classList.toggle("theme-light", settings.theme === "light"); }, [settings.theme]);
  useEffect(() => { const t = setTimeout(() => { checkForUpdate(false).then(setUpdate).catch(() => {}); }, 4000); return () => clearTimeout(t); }, []);

  const tabs: Array<[Tab, string, React.ElementType]> = [
    ["report", "Report", FileText], ["calc", "Calcs", Calculator], ["learn", "Learn", GraduationCap], ["ref", "Values", BookOpen], ["more", "Apps", LayoutGrid],
  ];

  return (
    <div className="min-h-screen bg-[var(--c-bg)] text-[var(--c-text)] font-sans">
      <main className="w-full max-w-md mx-auto px-4 pt-4 pb-32 space-y-3">
        <header className="pt-3 pb-1 px-1">
          <p className="text-[13px] font-semibold text-[var(--c-teal)]">Echo Hub</p>
          <h1 className="text-[30px] leading-9 font-normal text-[var(--c-text)]">{TITLES[tab]}</h1>
        </header>
        {tab === "report" && <ReportScreen />}
        {tab === "calc" && <CalcScreen />}
        {tab === "learn" && <LearnScreen />}
        {tab === "ref" && <RefScreen />}
        {tab === "more" && <MoreScreen />}
      </main>

      {update && (
        <div className="fixed left-3 right-3 bottom-[96px] z-50 bg-[var(--c-surface3)] rounded-2xl p-3 shadow-2xl flex items-center gap-2 max-w-md mx-auto">
          <span className="flex-1 text-xs font-bold">Update {update.latest} available</span>
          <button type="button" onClick={() => installUpdate(update).catch(() => {})} className="bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold rounded-xl px-3 py-2">Install</button>
          <button type="button" onClick={() => setUpdate(null)} aria-label="Dismiss" className="text-[var(--c-muted)] px-1">✕</button>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[var(--c-surface)] z-50 pb-[env(safe-area-inset-bottom)]">
        <div className="flex justify-around h-20 pt-3">
          {tabs.map(([t, label, Icon]) => {
            const on = tab === t;
            return (
              <button key={t} type="button" onClick={() => setTab(t)} className="flex-1 flex flex-col items-center gap-1">
                <span className={`m3-press w-16 h-8 rounded-full flex items-center justify-center transition-colors ${on ? "bg-[var(--c-tonal)] text-[var(--c-on-tonal)]" : "text-[var(--c-text2)]"}`}>
                  <Icon className="w-6 h-6" strokeWidth={on ? 2.2 : 1.8} />
                </span>
                <span className={`text-[12.5px] ${on ? "font-bold text-[var(--c-text)]" : "font-semibold text-[var(--c-text2)]"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
