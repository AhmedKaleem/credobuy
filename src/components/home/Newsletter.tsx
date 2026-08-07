"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { useToast } from "@/store/toast";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const pushToast = useToast((s) => s.push);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      pushToast("Please enter a valid email", "error");
      return;
    }
    pushToast("You're in! Your 10% code is on its way.");
    setEmail("");
  }

  return (
    <section
      aria-label="Newsletter"
      className="relative overflow-hidden rounded-[var(--radius-card)] bg-secondary px-6 py-12 text-white sm:px-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
      />
      <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <Mail size={22} strokeWidth={1.6} />
        </span>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Members get more
        </p>
        <h2 className="mt-2 text-3xl font-semibold">Get 10% off your first order</h2>
        <p className="mt-2 text-sm text-white/70">
          Be first to new drops, price drops and members-only offers.
        </p>
        <form onSubmit={submit} className="mt-6 flex w-full max-w-md gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className="flex-1 rounded-full bg-white px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-white/50"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition-colors hover:brightness-95"
          >
            <Send size={16} />
            <span className="hidden sm:inline">Sign up</span>
          </button>
        </form>
        <p className="mt-3 text-xs text-white/45">
          By signing up you agree to our privacy policy. Unsubscribe anytime.
        </p>
      </div>
    </section>
  );
}
