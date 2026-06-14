"use client";

import { useSyncExternalStore } from "react";

/**
 * Lightweight scroll store shared across the page (ports the export's inline
 * scroll engine). One set of listeners drives:
 *  - the progress bar (scrollP)
 *  - the header `scrolled` state
 *  - the Walk pinned step index
 *  - the section-nav active index
 *
 * The Three.js garden reads `scrollP` / `pointer` directly each animation frame
 * (via the getters) so it never triggers React renders.
 */
export type ScrollState = {
  scrollP: number;
  scrolled: boolean;
  walkStep: number;
  sectionIndex: number;
};

let state: ScrollState = { scrollP: 0, scrolled: false, walkStep: 0, sectionIndex: 0 };

// mutable — read by the rAF loop in GardenCanvas, never via React
const pointer = { x: 0, y: 0 };
let scrollP = 0;

const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function setScrollState(next: Partial<ScrollState>) {
  const merged = { ...state, ...next };
  if (
    merged.scrollP === state.scrollP &&
    merged.scrolled === state.scrolled &&
    merged.walkStep === state.walkStep &&
    merged.sectionIndex === state.sectionIndex
  ) {
    return;
  }
  state = merged;
  scrollP = merged.scrollP;
  emit();
}

export function setPointer(x: number, y: number) {
  pointer.x = x;
  pointer.y = y;
}

/** Read by the Three.js frame loop. */
export const getScrollP = () => scrollP;
export const getPointer = () => pointer;

export function useScrolled() {
  return useSyncExternalStore(
    subscribe,
    () => state.scrolled,
    () => false,
  );
}

export function useWalkStep() {
  return useSyncExternalStore(
    subscribe,
    () => state.walkStep,
    () => 0,
  );
}

export function useSectionIndex() {
  return useSyncExternalStore(
    subscribe,
    () => state.sectionIndex,
    () => 0,
  );
}

export function useScrollP() {
  return useSyncExternalStore(
    subscribe,
    () => state.scrollP,
    () => 0,
  );
}
