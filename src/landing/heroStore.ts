"use client";
import { create } from "zustand";

/** Which material the hero chair shows in the styles section. A chip click overrides scroll until scroll moves on. */
export const useHero = create<{
  scrollMaterial: number;
  chip: number | null;
  available: number; // how many material variants exist
  ready: boolean;
  setScrollMaterial: (m: number) => void;
  pick: (m: number) => void;
}>((set, get) => ({
  scrollMaterial: 0,
  chip: null,
  available: 1,
  ready: false,
  setScrollMaterial: (m) => get().scrollMaterial !== m && set({ scrollMaterial: m, chip: null }),
  pick: (m) => set({ chip: m }),
}));

export const activeMaterial = () => {
  const s = useHero.getState();
  return Math.min(s.chip ?? s.scrollMaterial, s.available - 1);
};
