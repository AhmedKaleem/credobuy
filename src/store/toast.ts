"use client";

import { create } from "zustand";

export interface Toast {
  id: number;
  message: string;
  tone: "success" | "error" | "info";
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, tone?: Toast["tone"]) => void;
  dismiss: (id: number) => void;
}

export const useToast = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = "success") => {
    const id = Date.now() + Math.random();
    set((state) => ({ toasts: [...state.toasts, { id, message, tone }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, 2600);
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
