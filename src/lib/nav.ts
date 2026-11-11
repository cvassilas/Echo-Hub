/**
 * Back navigation: open sub-pages and sheets register a "go back" handler while they're shown,
 * so the Android back button (and gestures) closes the top-most one first. Also keeps scroll
 * positions so going back lands where you left.
 */
import { createContext, useContext, useEffect, useRef } from "react";

/** False for screens kept mounted but hidden (inactive tabs): their back handlers are paused. */
export const VisibleCtx = createContext(true);

const stack: { id: number; fn: () => void }[] = [];
let nextId = 1;

/** While `active`, the back button calls `onBack` (latest registered wins). */
export function useBackHandler(active: boolean, onBack: () => void) {
  const fnRef = useRef(onBack);
  fnRef.current = onBack;
  const visible = useContext(VisibleCtx);
  const on = active && visible;
  useEffect(() => {
    if (!on) return;
    const id = nextId++;
    stack.push({ id, fn: () => fnRef.current() });
    return () => { const i = stack.findIndex((x) => x.id === id); if (i >= 0) stack.splice(i, 1); };
  }, [on]);
}

/** Run the top-most back handler. Returns false if nothing was open. */
export function goBack(): boolean {
  const top = stack[stack.length - 1];
  if (!top) return false;
  top.fn();
  return true;
}

/** Scroll the page after React has painted (two frames so images/layout settle). */
export function scrollToAfterPaint(y: number) {
  requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "auto" })));
}
