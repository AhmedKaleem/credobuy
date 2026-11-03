"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { loadCustomerProfile } from "@/lib/auth/session-client";
import { useAuth } from "@/store/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuth((s) => s.setUser);
  const setReady = useAuth((s) => s.setReady);

  useEffect(() => {
    const sb = createClient();
    if (!sb) {
      setUser(null);
      setReady(true);
      return;
    }

    let cancelled = false;

    async function load() {
      const user = await loadCustomerProfile();
      if (cancelled) return;
      setUser(user);
      setReady(true);
    }

    void load();
    const {
      data: { subscription },
    } = sb.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [setReady, setUser]);

  return <>{children}</>;
}
