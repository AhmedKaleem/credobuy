"use client";

import { create } from "zustand";
import type { UserProfile } from "@/types";
import {
  customerLoginAction,
  customerLogoutAction,
  customerRegisterAction,
  updateCustomerProfileAction,
} from "@/lib/auth/actions";
import { loadCustomerProfile } from "@/lib/auth/session-client";

interface AuthState {
  user: UserProfile | null;
  ready: boolean;
  setUser: (user: UserProfile | null) => void;
  setReady: (ready: boolean) => void;
  login: (
    email: string,
    password: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  register: (
    fullName: string,
    email: string,
    password: string
  ) => Promise<
    | { ok: true; needsEmailConfirm?: boolean }
    | { ok: false; error: string }
  >;
  logout: () => Promise<void>;
  updateProfile: (patch: {
    fullName: string;
    phone?: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  ready: false,
  setUser: (user) => set({ user }),
  setReady: (ready) => set({ ready }),
  login: async (email, password) => {
    const res = await customerLoginAction(email, password);
    if (res.ok) {
      const user = await loadCustomerProfile();
      set({ user, ready: true });
    }
    return res;
  },
  register: async (fullName, email, password) => {
    const res = await customerRegisterAction(fullName, email, password);
    if (res.ok && !res.needsEmailConfirm) {
      const user = await loadCustomerProfile();
      set({ user, ready: true });
    }
    return res;
  },
  logout: async () => {
    set({ user: null });
    await customerLogoutAction();
  },
  updateProfile: async (patch) => {
    const res = await updateCustomerProfileAction(patch);
    if (res.ok) {
      const current = get().user;
      if (current) {
        set({
          user: {
            ...current,
            fullName: patch.fullName,
            phone: patch.phone,
          },
        });
      }
    }
    return res;
  },
}));
