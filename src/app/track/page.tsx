"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { PackageSearch } from "lucide-react";
import { Container } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";

export default function TrackPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = orderNumber.trim();
    if (trimmed) router.push(`/track/${trimmed}`);
  }

  return (
    <Container className="py-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Track Order" }]} />
      <div className="mx-auto max-w-md">
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-6 sm:p-8">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
            <PackageSearch size={28} />
          </span>
          <h1 className="mt-4 text-center text-2xl font-bold">Track your order</h1>
          <p className="mt-1 text-center text-sm text-muted">
            Enter your order number to see the latest delivery status.
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="Order number">
              <Input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="e.g. CB2026123456"
              />
            </Field>
            <Button type="submit" className="w-full" size="lg">
              Track
            </Button>
          </form>
        </div>
      </div>
    </Container>
  );
}
