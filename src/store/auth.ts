"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { UserProfile } from "@/types";

interface AuthState {
  user: UserProfile | null;
  /**
   * Demo auth. When Supabase is configured, replace these with
   * supabase.auth.signInWithPassword / signUp and hydrate `user` from the
   * session. The rest of the app only reads `user`, so no UI changes needed.
   */
  login: (email: string) => UserProfile;
  register: (fullName: string, email: string) => UserProfile;
  logout: () => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      login: (email) => {
        const user: UserProfile = {
          id: "local-user",
          email,
          fullName: email.split("@")[0].replace(/[._]/g, " "),
          createdAt: new Date().toISOString(),
        };
        set({ user });
        return user;
      },
      register: (fullName, email) => {
        const user: UserProfile = {
          id: "local-user",
          email,
          fullName,
          createdAt: new Date().toISOString(),
        };
        set({ user });
        return user;
      },
      logout: () => set({ user: null }),
      updateProfile: (patch) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...patch } });
      },
    }),
    { name: "credobuy-auth" }
  )
);
