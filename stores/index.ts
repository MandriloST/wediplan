"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BudgetPlan, RegionId } from "@/lib/types";
import { computeCaps } from "@/lib/budget";

/* ---------------- Compare (max 4, oldest replaced, toast) ---------------- */

interface CompareState {
  ids: string[];
  dismissed: boolean; // tray dismissed until next change
  toast: string | null;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  dismissTray: () => void;
  clearToast: () => void;
}

export const useCompare = create<CompareState>()(
  persist(
    (set, get) => ({
      ids: [],
      dismissed: false,
      toast: null,
      toggle: (id) => {
        const { ids } = get();
        if (ids.includes(id)) {
          set({ ids: ids.filter((x) => x !== id), dismissed: false });
          return;
        }
        if (ids.length >= 4) {
          // cap at 4 — oldest replaced with a toast (README)
          set({
            ids: [...ids.slice(1), id],
            dismissed: false,
            toast: "Maksimalno 4 za usporedbu — najstariji odabir je zamijenjen.",
          });
          return;
        }
        set({ ids: [...ids, id], dismissed: false });
      },
      remove: (id) => set((s) => ({ ids: s.ids.filter((x) => x !== id) })),
      clear: () => set({ ids: [] }),
      dismissTray: () => set({ dismissed: true }),
      clearToast: () => set({ toast: null }),
    }),
    { name: "wediplan.compare", partialize: (s) => ({ ids: s.ids }) }
  )
);

/* ---------------- Budget plan ---------------- */

interface BudgetState {
  plan: BudgetPlan | null;
  drawerOpen: boolean;
  setPlan: (guests: number, region: RegionId, total: number) => void;
  clearPlan: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

export const useBudget = create<BudgetState>()(
  persist(
    (set) => ({
      plan: null,
      drawerOpen: false,
      setPlan: (guests, region, total) =>
        set({ plan: { guests, region, total, caps: computeCaps(total, region) } }),
      clearPlan: () => set({ plan: null }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    { name: "wediplan.budget", partialize: (s) => ({ plan: s.plan }) }
  )
);

/* ---------------- Favorites ---------------- */

interface FavoritesState {
  ids: string[];
  toggle: (id: string) => void;
}

export const useFavorites = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set({
          ids: get().ids.includes(id) ? get().ids.filter((x) => x !== id) : [...get().ids, id],
        }),
    }),
    { name: "wediplan.favorites" }
  )
);

/* ---------------- Chosen wedding date (for availability in compare) ---------------- */

interface DateState {
  date: string | null; // ISO yyyy-mm-dd
  setDate: (d: string | null) => void;
}

export const useWeddingDate = create<DateState>()(
  persist(
    (set) => ({ date: null, setDate: (d) => set({ date: d }) }),
    { name: "wediplan.date" }
  )
);
