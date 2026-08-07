"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Container } from "@/components/ui/primitives";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/account";
  const login = useAuth((s) => s.login);
  const pushToast = useToast((s) => s.push);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid email";
    if (password.length < 6) next.password = "Minimum 6 characters";
    setErrors(next);
    if (Object.keys(next).length) return;
    login(email);
    pushToast("Welcome back!");
    router.push(redirect);
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted">Sign in to continue to CredoBuy.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label="Email" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Password" htmlFor="password" error={errors.password}>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Field>
          <Button type="submit" className="w-full" size="lg">
            Sign In
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-muted">
          New to CredoBuy?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>
      <p className="mt-4 text-center text-xs text-muted">
        Demo mode — any valid email and 6+ char password works.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Container className="py-10">
      <Suspense>
        <LoginForm />
      </Suspense>
    </Container>
  );
}
