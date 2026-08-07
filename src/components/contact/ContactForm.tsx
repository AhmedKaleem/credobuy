"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  sendContactEmailAction,
  type ContactFormState,
} from "@/lib/contact/actions";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Button, buttonStyles } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function ContactForm({
  whatsappHref,
}: {
  whatsappHref: string;
}) {
  const [state, formAction, pending] = useActionState<
    ContactFormState,
    FormData
  >(sendContactEmailAction, null);

  return (
    <form
      action={formAction}
      className="mt-8 space-y-4 rounded-[var(--radius-card)] border border-border bg-surface p-5 sm:p-6"
    >
      <h2 className="text-lg font-bold">Send a message</h2>

      {/* Honeypot — hidden from users */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Your name">
          <Input
            name="name"
            placeholder="Full name"
            required
            disabled={pending}
          />
        </Field>
        <Field label="Email">
          <Input
            name="email"
            type="email"
            placeholder="you@email.com"
            required
            disabled={pending}
          />
        </Field>
      </div>
      <Field label="Subject">
        <Input
          name="subject"
          placeholder="Order / product / other"
          disabled={pending}
        />
      </Field>
      <Field label="Message">
        <Textarea
          name="body"
          rows={5}
          placeholder="How can we help?"
          required
          disabled={pending}
        />
      </Field>

      {state?.ok === true ? (
        <p className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
          {state.message}
        </p>
      ) : null}
      {state?.ok === false ? (
        <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send email"}
        </Button>
        <Link
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonStyles("outline"))}
        >
          Chat on WhatsApp
        </Link>
      </div>
    </form>
  );
}
