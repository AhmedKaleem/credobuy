"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WishlistState {
  ids: string[];
  toggle: (productId: string) => void;
  has: (productId: string) => boolean;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) =>
        set((state) => ({
          ids: state.ids.includes(productId)
            ? state.ids.filter((id) => id !== productId)
            : [...state.ids, productId],
        })),
      has: (productId) => get().ids.includes(productId),
      remove: (productId) =>
        set((state) => ({ ids: state.ids.filter((id) => id !== productId) })),
      clear: () => set({ ids: [] }),
    }),
    { name: "credobuy-wishlist" }
  )
);
