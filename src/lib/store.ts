/** Local storage for Echo Hub: settings, saved reports and the current draft. Nothing leaves the phone. */
import { useEffect, useState } from "react";
import { Values } from "./echo";

export interface LinkedApp { packageName: string; label: string }
export interface Settings { theme: "dark" | "light"; apps: LinkedApp[]; standard: "BSE" | "ASE"; order: "structure" | "view" }
export interface SavedReport { id: string; label: string; created: number; updated: number; values: Values; text?: string }

const KEY = "echo_hub_v1";
interface Data { settings: Settings; reports: SavedReport[]; draft: { id?: string; label: string; values: Values; text?: string } }
const DEFAULT: Data = { settings: { theme: "dark", apps: [], standard: "BSE", order: "view" }, reports: [], draft: { label: "", values: {} } };

let cache: Data | null = null;
const listeners = new Set<() => void>();

export function getData(): Data {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    cache = raw ? { ...DEFAULT, ...raw, settings: { ...DEFAULT.settings, ...(raw.settings || {}) }, draft: { ...DEFAULT.draft, ...(raw.draft || {}) } } : structuredClone(DEFAULT);
  } catch { cache = structuredClone(DEFAULT); }
  return cache!;
}
function save(next: Data) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* storage full */ }
  listeners.forEach((l) => l());
}
export function useData(): Data {
  const [, set] = useState(0);
  useEffect(() => { const l = () => set((n) => n + 1); listeners.add(l); return () => { listeners.delete(l); }; }, []);
  return getData();
}

export const updateSettings = (p: Partial<Settings>) => { const d = getData(); save({ ...d, settings: { ...d.settings, ...p } }); };
export const setDraft = (p: Partial<Data["draft"]>) => { const d = getData(); save({ ...d, draft: { ...d.draft, ...p } }); };
export const setValue = (k: string, v: string) => { const d = getData(); save({ ...d, draft: { ...d.draft, values: { ...d.draft.values, [k]: v }, text: undefined } }); };
export const newDraft = () => { const d = getData(); save({ ...d, draft: { label: "", values: {} } }); };

export function saveDraftAsReport(): SavedReport {
  const d = getData();
  const now = Date.now();
  const id = d.draft.id || `r-${now}`;
  const existing = d.reports.find((r) => r.id === id);
  const rep: SavedReport = { id, label: d.draft.label || "Untitled study", created: existing?.created || now, updated: now, values: d.draft.values, text: d.draft.text };
  save({ ...d, reports: [rep, ...d.reports.filter((r) => r.id !== id)], draft: { ...d.draft, id } });
  return rep;
}
export const openReport = (id: string) => { const d = getData(); const r = d.reports.find((x) => x.id === id); if (r) save({ ...d, draft: { id: r.id, label: r.label, values: { ...r.values }, text: r.text } }); };
export const deleteReport = (id: string) => { const d = getData(); save({ ...d, reports: d.reports.filter((r) => r.id !== id), draft: d.draft.id === id ? { label: "", values: {} } : d.draft }); };
