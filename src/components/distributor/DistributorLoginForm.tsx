"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { distributorLoginAction } from "@/lib/auth/actions";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get("redirect") || "/distributor";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await distributorLoginAction(email, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.replace(
      redirectTo.startsWith("/distributor") ? redirectTo : "/distributor"
    );
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f1ec] px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Logo />
          <span className="mt-3 rounded-full bg-primary-soft px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary">
            Distributor
          </span>
          <h1 className="mt-4 text-2xl font-bold">Partner sign in</h1>
          <p className="mt-1 text-sm text-muted">
            Accept or reject assigned order lines.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Field label="Email" htmlFor="dist-email">
            <Input
              id="dist-email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>
          <Field label="Password" htmlFor="dist-password">
            <Input
              id="dist-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
      </div>
    </div>
  );
}

export function DistributorLoginForm() {
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
