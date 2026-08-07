"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { adminLoginAction } from "@/lib/auth/actions";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await adminLoginAction(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace(redirectTo.startsWith("/admin") ? redirectTo : "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f1ec] px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo />
          <span className="mt-3 rounded-full bg-accent-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
            Admin
          </span>
          <h1 className="mt-4 text-2xl font-bold">Sign in to Admin</h1>
          <p className="mt-1 text-sm text-muted">
            Manage products, banners and catalogue.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Email" htmlFor="admin-email">
            <Input
              id="admin-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@credobuy.com"
              required
            />
          </Field>
          <Field label="Password" htmlFor="admin-password">
            <Input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </Field>
          {error && (
            <p className="text-sm font-medium text-danger" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-xs text-muted">
          Demo (no Supabase):{" "}
          <code className="text-foreground">admin@credobuy.com</code> /{" "}
          <code className="text-foreground">CredoBuy@Admin1</code>
        </p>
      </div>
    </div>
  );
}

export function AdminLoginForm() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted">
          Loading…
        </div>
      }
    >
      <Form />
    </Suspense>
  );
}
