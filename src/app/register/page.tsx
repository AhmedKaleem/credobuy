"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Container } from "@/components/ui/primitives";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { useAuth } from "@/store/auth";
import { useToast } from "@/store/toast";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuth((s) => s.register);
  const pushToast = useToast((s) => s.push);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Enter a valid email";
    if (form.password.length < 6) next.password = "Minimum 6 characters";
    setErrors(next);
    if (Object.keys(next).length) return;
    register(form.name.trim(), form.email);
    pushToast("Account created!");
    router.push("/account");
  }

  return (
    <Container className="py-10">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 sm:p-8">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted">
            Join CredoBuy for faster checkout, order tracking and offers.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Full name" htmlFor="name" error={errors.name}>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Arun Kumar"
                autoComplete="name"
              />
            </Field>
            <Field label="Email" htmlFor="email" error={errors.email}>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Field>
            <Field label="Password" htmlFor="password" error={errors.password}>
              <Input
                id="password"
                type="password"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </Field>
            <Button type="submit" className="w-full" size="lg">
              Create Account
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </Container>
  );
}
