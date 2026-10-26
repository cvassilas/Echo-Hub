import React, { useEffect, useState } from "react";
import { Moon, Sun, Check, Plus, Trash2, ExternalLink, Search } from "lucide-react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { useData, updateSettings, LinkedApp } from "../lib/store";
import { appVersion, checkForUpdate, installUpdate, updatesEnabled, UpdateInfo } from "../lib/updates";
import { card, inputCls, Sheet, SectionTitle } from "./ui";

interface AppLauncherPlugin {
  listApps(): Promise<{ apps: { packageName: string; label: string; system: boolean }[] }>;
  getIcon(o: { packageName: string }): Promise<{ dataUrl: string }>;
  open(o: { packageName: string }): Promise<void>;
}
const AppLauncher = registerPlugin<AppLauncherPlugin>("AppLauncher");

export const AppsCard: React.FC = () => {
  const { settings } = useData();
  const [picking, setPicking] = useState(false);
  const [icons, setIcons] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const native = Capacitor.isNativePlatform();
  useEffect(() => {
    if (!native) return;
    settings.apps.forEach((a) => { if (!icons[a.packageName]) AppLauncher.getIcon({ packageName: a.packageName }).then((r) => setIcons((m) => ({ ...m, [a.packageName]: r.dataUrl }))).catch(() => {}); });
  }, [settings.apps, native]);

  return (
    <div className={`${card} p-4 space-y-3`}>
      <SectionTitle>Your echo apps</SectionTitle>
      {!native && <p className="text-[11px] text-[var(--c-muted)]">Opening other apps works in the Android app only.</p>}
      {native && settings.apps.length === 0 && <p className="text-[11px] text-[var(--c-muted)]">Add EchoCardio, EchoCalc, the ASE guide and others here to open them in one tap.</p>}
      <div className="grid grid-cols-4 gap-2">
        {settings.apps.map((a) => (
          <button key={a.packageName} type="button" onClick={() => AppLauncher.open({ packageName: a.packageName }).catch((e) => setErr(e?.message || "Couldn't open it"))}
            className="flex flex-col items-center gap-1 p-1.5 rounded-xl bg-[var(--c-bg)] border border-[var(--c-border)]">
            {icons[a.packageName] ? <img src={icons[a.packageName]} alt="" className="w-11 h-11 rounded-xl" /> : <span className="w-11 h-11 rounded-xl bg-[var(--c-surface2)] flex items-center justify-center"><ExternalLink className="w-4 h-4 text-[var(--c-muted)]" /></span>}
            <span className="text-[10px] font-semibold text-[var(--c-text)] text-center leading-tight line-clamp-2">{a.label}</span>
          </button>
        ))}
        {native && (
          <button type="button" onClick={() => setPicking(true)} className="flex flex-col items-center justify-center gap-1 p-1.5 rounded-xl border border-dashed border-[var(--c-border2)] text-[var(--c-teal)] min-h-[76px]">
            <Plus className="w-5 h-5" /><span className="text-[10px] font-bold">Add</span>
          </button>
        )}
      </div>
      {err && <p className="text-[11px] text-red-400">{err}</p>}
      {picking && <AppPicker onClose={() => setPicking(false)} />}
    </div>
  );
};

const AppPicker: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { settings } = useData();
  const [apps, setApps] = useState<{ packageName: string; label: string; system: boolean }[] | null>(null);
  const [q, setQ] = useState("echo");
  useEffect(() => { AppLauncher.listApps().then((r) => setApps(r.apps.sort((a, b) => a.label.localeCompare(b.label)))).catch(() => setApps([])); }, []);
  const chosen = new Set(settings.apps.map((a) => a.packageName));
  const toggle = (a: LinkedApp) => updateSettings({ apps: chosen.has(a.packageName) ? settings.apps.filter((x) => x.packageName !== a.packageName) : [...settings.apps, { packageName: a.packageName, label: a.label }] });
  const ql = q.trim().toLowerCase();
  const list = (apps || []).filter((a) => !ql || a.label.toLowerCase().includes(ql) || a.packageName.toLowerCase().includes(ql));
  return (
    <Sheet title="Add apps" onClose={onClose}>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--c-muted)]" />
        <input aria-label="Search installed apps" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search installed apps" className={`${inputCls} pl-9`} />
      </div>
      {apps === null && <p className="text-xs text-[var(--c-muted)]">Loading installed apps…</p>}
      {apps && list.length === 0 && <p className="text-xs text-[var(--c-muted)]">No match. Try part of the name, e.g. "calc" or "ASE".</p>}
      <div className="space-y-1.5">
        {list.map((a) => (
          <button key={a.packageName} type="button" onClick={() => toggle(a)} className="w-full flex items-center justify-between gap-2 bg-[var(--c-bg)] border border-[var(--c-border)] rounded-xl px-3 py-2.5 text-left">
            <span className="min-w-0"><span className="block text-sm font-semibold text-[var(--c-text)] truncate">{a.label}</span><span className="block text-[10px] text-[var(--c-muted)] truncate">{a.packageName}</span></span>
            {chosen.has(a.packageName) ? <Check className="w-5 h-5 text-[var(--c-teal)] shrink-0" /> : <Plus className="w-5 h-5 text-[var(--c-muted)] shrink-0" />}
          </button>
        ))}
      </div>
    </Sheet>
  );
};

export const MoreScreen: React.FC = () => {
  const { settings } = useData();
  const [version, setVersion] = useState("");
  const [upd, setUpd] = useState<UpdateInfo | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => { appVersion().then(setVersion); }, []);
  return (
    <div className="space-y-3">
      <AppsCard />
      <div className={`${card} p-4 space-y-3`}>
        <SectionTitle>Appearance</SectionTitle>
        <div className="grid grid-cols-2 gap-2">
          {([["dark", "Dark", Moon], ["light", "Light", Sun]] as const).map(([v, l, Icon]) => (
            <button key={v} type="button" onClick={() => updateSettings({ theme: v })}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-xs font-bold ${settings.theme === v ? "border-[var(--c-teal)] bg-[var(--c-teal)]/15 text-[var(--c-teal)]" : "border-[var(--c-border)] text-[var(--c-muted)]"}`}>
              <Icon className="w-4 h-4" /> {l}
            </button>
          ))}
        </div>
      </div>
      {Capacitor.isNativePlatform() && (
        <div className={`${card} p-4 space-y-2`}>
          <SectionTitle>Updates</SectionTitle>
          <div className="flex justify-between text-xs"><span className="text-[var(--c-muted)]">Installed version</span><span className="font-semibold text-[var(--c-text)]">{version || "–"}</span></div>
          {updatesEnabled() ? (upd ? (
            <button type="button" onClick={() => installUpdate(upd).catch((e) => setMsg(e?.message))} className="w-full py-2.5 rounded-xl bg-[var(--c-accent)] text-[var(--c-bg)] text-xs font-bold">Install {upd.latest}</button>
          ) : (
            <button type="button" onClick={async () => { setMsg(null); try { const u = await checkForUpdate(true); setUpd(u); if (!u) setMsg("You're on the latest version."); } catch (e: any) { setMsg(e?.message || "Couldn't check."); } }} className="w-full py-2.5 rounded-xl border border-[var(--c-border)] text-[var(--c-text)] text-xs font-bold">Check for updates</button>
          )) : <p className="text-[11px] text-[var(--c-muted)]">Off in this build. Add the APP_GH_TOKEN secret to the Echo-Hub repo and rebuild.</p>}
          {msg && <p className="text-[11px] text-[var(--c-muted)]">{msg}</p>}
        </div>
      )}
      <div className={`${card} p-4 space-y-2`}>
        <SectionTitle>About</SectionTitle>
        <p className="text-[12px] leading-snug text-[var(--c-text2)]">Echo Hub is a teaching and reporting aid. Reference values are restated from BSE, ASE/EACVI, ESC/ERS and related guidelines; tips and diagrams were written for this app. It isn't a medical device: check measurements and conclusions against current guidelines and your own clinical judgement.</p>
        <p className="text-[12px] leading-snug text-[var(--c-text2)]">Reports and settings stay on this phone. Don't enter patient names or hospital numbers.</p>
        <button type="button" onClick={() => { if (confirm("Delete all saved reports and settings on this phone?")) { localStorage.removeItem("echo_hub_v1"); location.reload(); } }} className="w-full py-2 text-xs font-bold text-red-400 flex items-center justify-center gap-1"><Trash2 className="w-4 h-4" /> Delete all data on this phone</button>
      </div>
    </div>
  );
};
