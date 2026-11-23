/**
 * Where a value measured on a photo goes in the Echo Hub report, and the unit
 * conversion. Report fields keep their own units (some cm, some mm, m/s or cm/s).
 */
import { FIELD } from "../echo";

export type Kind = "distance" | "speed";

export interface Target { key: string; kind: Kind; /** Multiply cm (distance) or m/s (speed) by this to get the field's unit. */ factor: number; dp: number }

const T = (key: string, kind: Kind, factor: number, dp: number): Target => ({ key, kind, factor, dp });

/** 2D or M-mode distances, measured in cm. */
export const DISTANCE_TARGETS: Target[] = [
  T("ivsd", "distance", 1, 2), T("lvidd", "distance", 1, 2), T("lvpwd", "distance", 1, 2), T("lvids", "distance", 1, 2),
  T("lvot_d", "distance", 1, 2), T("ao_sinus", "distance", 1, 2), T("ao_asc", "distance", 1, 2),
  T("ivc_d", "distance", 1, 2), T("rv_basal", "distance", 10, 0), T("rv_mid", "distance", 10, 0), T("rv_wall", "distance", 10, 0),
  T("tapse", "distance", 10, 0), T("mapse", "distance", 10, 0), T("pa_d", "distance", 10, 0), T("eff_depth", "distance", 10, 0),
  T("pl_sep_r", "distance", 10, 0), T("pl_sep_l", "distance", 10, 0),
  T("mr_vc", "distance", 1, 2), T("ar_vc", "distance", 1, 2), T("tr_vc", "distance", 1, 2),
];

/** Single Doppler speeds, measured in m/s. */
export const SPEED_TARGETS: Target[] = [
  T("av_vmax", "speed", 1, 2), T("trv", "speed", 1, 2), T("e", "speed", 100, 0), T("a", "speed", 100, 0),
  T("e_sept", "speed", 100, 1), T("e_lat", "speed", 100, 1), T("rv_s", "speed", 100, 1), T("pv_vmax", "speed", 100, 0), T("pv_vmin", "speed", 100, 0),
];

/** What a whole auto-traced Doppler envelope fills in. */
export interface EnvelopeTarget { id: string; label: string; vmax?: string; meanPg?: string; vti?: string }
export const ENVELOPE_TARGETS: EnvelopeTarget[] = [
  { id: "av", label: "Aortic valve (CW)", vmax: "av_vmax", meanPg: "av_meanpg", vti: "av_vti" },
  { id: "lvot", label: "LVOT (PW)", vti: "lvot_vti" },
  { id: "tr", label: "Tricuspid regurgitation (CW)", vmax: "trv" },
  { id: "mv", label: "Mitral stenosis (CW)", meanPg: "mv_meanpg" },
];

export const TARGET = Object.fromEntries([...DISTANCE_TARGETS, ...SPEED_TARGETS].map((t) => [t.key, t])) as Record<string, Target>;

export const labelOf = (key: string) => FIELD[key]?.label ?? key;
export const unitOf = (key: string) => FIELD[key]?.unit ?? "";

/** Value in the field's unit, as the text the report stores. */
export function toFieldText(key: string, value: number, kind: Kind): string {
  const t = TARGET[key];
  if (!t) throw new Error(`No unit for ${key}`);
  if (t.kind !== kind) throw new Error(`${labelOf(key)} is not a ${kind}.`);
  const v = value * t.factor;
  return String(Math.round(v * 10 ** t.dp) / 10 ** t.dp);
}

/** Plain-number fields the envelope fills (gradient mmHg, VTI cm). */
export function envelopeValues(t: EnvelopeTarget, m: { peakVelocityMs: number; vtiCm?: number; meanGradientMmHg: number }): Record<string, string> {
  const out: Record<string, string> = {};
  if (t.vmax) out[t.vmax] = toFieldText(t.vmax, m.peakVelocityMs, "speed");
  if (t.meanPg) out[t.meanPg] = String(Math.round(m.meanGradientMmHg));
  if (t.vti && m.vtiCm !== undefined) out[t.vti] = String(Math.round(m.vtiCm * 10) / 10);
  return out;
}
