"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";
import type { DeviceBrand, DeviceModel } from "@/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { logoPlaceholder } from "@/lib/placeholder";
import { cn } from "@/lib/utils";
import { JumpLetters } from "@/components/home/JumpLetters";

const ACCESSORY_TYPES = [
  { label: "Cases", href: "/category/cases-and-covers" },
  { label: "Screen", href: "/category/screen-protectors" },
  { label: "Chargers", href: "/category/chargers" },
  { label: "Audio", href: "/category/earphones-and-earbuds" },
];

export function DeviceFinder({
  deviceBrands,
  deviceModels,
}: {
  deviceBrands: DeviceBrand[];
  deviceModels: DeviceModel[];
}) {
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");

  const brand = deviceBrands.find((b) => b.id === brandId);
  const models = useMemo(
    () =>
      deviceModels
        .filter((m) => m.deviceBrandId === brandId)
        .sort((a, b) => b.releaseYear - a.releaseYear || a.name.localeCompare(b.name)),
    [deviceModels, brandId]
  );
  const model = models.find((m) => m.id === modelId);
  const visibleModels = models.slice(0, 10);
  const extraModels = models.length - visibleModels.length;

  const href =
    brand && model
      ? `/device/${brand.slug}/${model.slug}`
      : brand
        ? `/device/${brand.slug}`
        : "/device";

  const ctaLabel = model
    ? `Shop ${model.name}`
    : brand
      ? `Browse ${brand.name}`
      : "Choose a phone first";

  return (
    <section aria-labelledby="device-finder-heading" className="mt-10 sm:mt-12">
      <div className="mb-6 max-w-xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          Device finder
        </p>
        <h2
          id="device-finder-heading"
          className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl"
        >
          Find what{" "}
          <JumpLetters text="fits your phone" />
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Tap a brand, pick a model, and we&apos;ll show accessories made for
          that device — not a generic list.
        </p>
      </div>

      <div className="overflow-hidden rounded-[1.75rem] border border-border bg-white shadow-[var(--shadow-card)]">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-7 p-5 sm:p-7 lg:p-8">
            <div>
              <StepLabel n={1} done={Boolean(brand)}>
                Brand
              </StepLabel>
              <ul className="mt-3 flex flex-wrap gap-2">
                {deviceBrands.slice(0, 10).map((b) => {
                  const selected = b.id === brandId;
                  const logo =
                    b.logoUrl && !b.logoUrl.startsWith("data:")
                      ? b.logoUrl
                      : logoPlaceholder(b.name);
                  return (
                    <li key={b.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setBrandId(b.id);
                          setModelId("");
                        }}
                        className={cn(
                          "inline-flex h-11 items-center gap-2 rounded-full border py-1 pl-1 pr-3.5 text-sm font-medium transition-colors",
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-[#f7f6f3] text-foreground hover:border-foreground/25 hover:bg-white"
                        )}
                      >
                        <span className="relative h-9 w-9 overflow-hidden rounded-full bg-white">
                          <SmartImage
                            src={logo}
                            alt=""
                            ratio="absolute inset-0 h-full w-full"
                          />
                        </span>
                        {b.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <StepLabel n={2} done={Boolean(model)}>
                Model
              </StepLabel>
              {!brand ? (
                <p className="mt-3 text-sm text-muted">
                  Choose a brand to see models.
                </p>
              ) : (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {visibleModels.map((m) => {
                    const selected = m.id === modelId;
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => setModelId(m.id)}
                          className={cn(
                            "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                            selected
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-[#f7f6f3] hover:border-foreground/25 hover:bg-white"
                          )}
                        >
                          {m.name}
                        </button>
                      </li>
                    );
                  })}
                  {extraModels > 0 ? (
                    <li>
                      <Link
                        href={`/device/${brand.slug}`}
                        className="inline-flex rounded-full border border-dashed border-border px-3.5 py-2 text-sm font-medium text-muted hover:text-foreground"
                      >
                        +{extraModels} more
                      </Link>
                    </li>
                  ) : null}
                </ul>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between gap-6 border-t border-border bg-[#f7f6f3] p-5 sm:p-7 lg:border-l lg:border-t-0 lg:p-8">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-foreground shadow-sm">
                <Smartphone size={22} strokeWidth={1.6} />
              </div>
              <p className="mt-4 text-sm font-semibold text-muted">Your pick</p>
              <p className="mt-1 text-xl font-semibold tracking-tight">
                {model?.name ?? brand?.name ?? "Any device"}
              </p>
              <p className="mt-1 text-sm text-muted">
                {model
                  ? "We'll filter cases, chargers and audio to this model."
                  : brand
                    ? "Pick a model, or browse the whole brand."
                    : "Start with the phone you use every day."}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                Jump to a category
              </p>
              <div className="mb-4 flex flex-wrap gap-1.5">
                {ACCESSORY_TYPES.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-foreground ring-1 ring-border hover:ring-foreground/30"
                  >
                    {t.label}
                  </Link>
                ))}
              </div>
              <Link
                href={href}
                aria-disabled={!brand}
                className={cn(
                  "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-semibold text-background",
                  !brand && "pointer-events-none opacity-40"
                )}
              >
                {ctaLabel}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepLabel({
  n,
  done,
  children,
}: {
  n: number;
  done?: boolean;
  children: string;
}) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
          done
            ? "bg-foreground text-background"
            : "bg-surface-muted text-foreground"
        )}
      >
        {n}
      </span>
      {children}
    </p>
  );
}
