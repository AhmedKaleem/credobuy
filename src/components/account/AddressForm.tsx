"use client";

import { useState } from "react";
import type { Address } from "@/types";
import { Field, Input, Select } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { isValidPhone, isValidPincode } from "@/lib/utils";

type AddressInput = Omit<Address, "id" | "userId">;

const INDIAN_STATES = [
  "Tamil Nadu",
  "Karnataka",
  "Kerala",
  "Andhra Pradesh",
  "Telangana",
  "Maharashtra",
  "Delhi",
  "Gujarat",
  "West Bengal",
  "Uttar Pradesh",
];

export function AddressForm({
  initial,
  submitLabel = "Save address",
  onSubmit,
  onCancel,
}: {
  initial?: Partial<AddressInput>;
  submitLabel?: string;
  onSubmit: (input: AddressInput) => void;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<AddressInput>({
    fullName: initial?.fullName ?? "",
    phone: initial?.phone ?? "",
    line1: initial?.line1 ?? "",
    line2: initial?.line2 ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "Tamil Nadu",
    pincode: initial?.pincode ?? "",
    type: initial?.type ?? "home",
    isDefault: initial?.isDefault ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof AddressInput>(key: K, value: AddressInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.fullName.trim()) next.fullName = "Name is required";
    if (!isValidPhone(form.phone)) next.phone = "Enter a valid 10-digit number";
    if (!form.line1.trim()) next.line1 = "Address is required";
    if (!form.city.trim()) next.city = "City is required";
    if (!isValidPincode(form.pincode)) next.pincode = "Enter a valid PIN code";
    setErrors(next);
    if (Object.keys(next).length === 0) onSubmit(form);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={errors.fullName}>
          <Input
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            placeholder="e.g. Arun Kumar"
          />
        </Field>
        <Field label="Phone number" error={errors.phone}>
          <Input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            inputMode="numeric"
            placeholder="10-digit mobile"
          />
        </Field>
      </div>

      <Field label="Address line 1" error={errors.line1}>
        <Input
          value={form.line1}
          onChange={(e) => set("line1", e.target.value)}
          placeholder="House / flat no, street"
        />
      </Field>
      <Field label="Address line 2 (optional)">
        <Input
          value={form.line2}
          onChange={(e) => set("line2", e.target.value)}
          placeholder="Area, landmark"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="City" error={errors.city}>
          <Input value={form.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
        <Field label="State">
          <Select value={form.state} onChange={(e) => set("state", e.target.value)}>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="PIN code" error={errors.pincode}>
          <Input
            value={form.pincode}
            onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
          />
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {(["home", "work", "other"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => set("type", t)}
              className={`rounded-full border px-3 py-1.5 text-sm capitalize ${
                form.type === t
                  ? "border-primary bg-primary-soft text-primary"
                  : "border-border text-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={(e) => set("isDefault", e.target.checked)}
            className="h-4 w-4 accent-[var(--color-primary)]"
          />
          Set as default
        </label>
      </div>

      <div className="flex gap-2">
        <Button type="submit">{submitLabel}</Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
