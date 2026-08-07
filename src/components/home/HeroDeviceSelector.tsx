"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  Package,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Truck,
  Zap,
} from "lucide-react";
import type { DeviceBrand, DeviceModel } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  deviceBrands: DeviceBrand[];
  deviceModels: DeviceModel[];
}

const ACCESSORY_TYPES = [
  { label: "Cases & Covers", href: "/category/cases-and-covers" },
  { label: "Screen Protectors", href: "/category/screen-protectors" },
  { label: "Chargers", href: "/category/chargers" },
  { label: "Charging Cables", href: "/category/charging-cables" },
  { label: "Power Banks", href: "/category/power-banks" },
  { label: "Earphones & Earbuds", href: "/category/earphones-and-earbuds" },
  { label: "Holders & Stands", href: "/category/mobile-holders-and-stands" },
];

const FEATURES = [
  { icon: ShieldCheck, label: "Premium Protection" },
  { icon: Zap, label: "Smart Solutions" },
  { icon: BadgeCheck, label: "Made for Everyday" },
];

const TRUST = [
  { icon: Truck, title: "Free Shipping", text: "On orders ₹499+" },
  { icon: ShieldCheck, title: "Secure Checkout", text: "Safe & trusted" },
  { icon: Package, title: "30-Day Returns", text: "Hassle-free" },
];

export function HeroDeviceSelector({ deviceBrands, deviceModels }: Props) {
  const router = useRouter();
  const [brandId, setBrandId] = useState("");
  const [modelId, setModelId] = useState("");
  const [accessoryHref, setAccessoryHref] = useState("");

  const brand = deviceBrands.find((b) => b.id === brandId);
  const models = useMemo(
    () => deviceModels.filter((m) => m.deviceBrandId === brandId),
    [deviceModels, brandId]
  );
  const model = models.find((m) => m.id === modelId);

  function go() {
    if (brand && model) {
      router.push(`/device/${brand.slug}/${model.slug}`);
      return;
    }
    if (accessoryHref) {
      router.push(accessoryHref);
      return;
    }
    if (brand) {
      router.push(`/device/${brand.slug}`);
      return;
    }
    router.push("/device");
  }

  return (
    <section className="relative overflow-hidden rounded-3xl bg-[#141414] text-white shadow-[var(--shadow-hover)]">
      {/* Ambient lighting */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_40%,rgba(194,169,130,0.18),transparent_55%),radial-gradient(ellipse_at_75%_55%,rgba(255,255,255,0.08),transparent_50%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[#c2a982]/15 blur-3xl"
      />

      <div className="relative grid items-center gap-10 p-7 sm:p-10 lg:grid-cols-[1fr_minmax(280px,0.95fr)_minmax(300px,380px)] lg:gap-6 lg:p-12 xl:gap-10">
        {/* Left — copy */}
        <div className="relative z-10 flex flex-col justify-center lg:pr-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/50">
            Engineered for everyday
          </p>
          <h2 className="mt-4 max-w-md text-3xl font-semibold leading-[1.08] tracking-tight sm:text-4xl xl:text-[2.75rem]">
            Accessories That Fit Your Life
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60 sm:text-[15px]">
            Cases, chargers, audio and more — precision-built for your exact
            device.
          </p>

          <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex items-center gap-2 text-xs font-medium text-white/75"
              >
                <Icon size={16} strokeWidth={1.7} className="text-[#c2a982]" />
                {label}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-[#c2a982] px-6 py-3 text-sm font-semibold text-[#16150f] transition-transform hover:scale-[1.02] hover:brightness-105"
            >
              Shop All <ArrowRight size={16} />
            </Link>
            <Link
              href="/shop?sort=rating_desc"
              className="inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Best Sellers
            </Link>
          </div>
        </div>

        {/* Center — product collage */}
        <div
          aria-hidden
          className="relative mx-auto hidden h-[280px] w-full max-w-md lg:block xl:h-[320px]"
        >
          <ProductCollage />
        </div>

        {/* Right — device selector card */}
        <div className="relative z-10">
          <div className="rounded-2xl border border-white/12 bg-white/[0.06] p-5 backdrop-blur-md sm:p-6">
            <div className="flex items-start gap-2.5">
              <Sparkles
                size={18}
                strokeWidth={1.7}
                className="mt-0.5 shrink-0 text-[#c2a982]"
              />
              <div>
                <p className="text-[15px] font-semibold leading-snug">
                  Find Your Perfect Accessory
                </p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">
                  Tell us your device and we&apos;ll show you what fits.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <SelectField
                ariaLabel="Choose your brand"
                icon={Smartphone}
                value={brandId}
                onChange={(v) => {
                  setBrandId(v);
                  setModelId("");
                }}
              >
                <option value="">Choose your brand</option>
                {deviceBrands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                ariaLabel="Select a model"
                icon={Smartphone}
                value={modelId}
                disabled={!brandId}
                onChange={setModelId}
              >
                <option value="">
                  {brandId ? "Select a model" : "Select a brand first"}
                </option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </SelectField>

              <SelectField
                ariaLabel="Choose accessory type"
                icon={ShoppingBag}
                value={accessoryHref}
                onChange={setAccessoryHref}
              >
                <option value="">Choose accessory type</option>
                {ACCESSORY_TYPES.map((t) => (
                  <option key={t.href} value={t.href}>
                    {t.label}
                  </option>
                ))}
              </SelectField>

              <button
                type="button"
                onClick={go}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#c2a982] px-4 py-3.5 text-sm font-semibold text-[#16150f] transition-transform hover:scale-[1.01] hover:brightness-105"
              >
                Show My Accessories
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 border-t border-white/10 pt-4">
              {TRUST.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="flex flex-col items-center gap-1.5 px-1 text-center sm:flex-row sm:items-start sm:text-left"
                >
                  <Icon
                    size={14}
                    strokeWidth={1.7}
                    className="shrink-0 text-[#c2a982]"
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold leading-tight text-white/90">
                      {title}
                    </p>
                    <p className="mt-0.5 hidden text-[9px] leading-tight text-white/45 sm:block">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SelectField({
  ariaLabel,
  icon: Icon,
  value,
  onChange,
  disabled,
  children,
}: {
  ariaLabel: string;
  icon: typeof Smartphone;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <Icon
        size={16}
        strokeWidth={1.7}
        className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-white/45"
      />
      <select
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full appearance-none rounded-xl border border-white/15 bg-[#1c1c1c] py-3.5 pl-10 pr-10 text-sm text-white",
          "focus:border-[#c2a982]/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
        )}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40"
      />
    </div>
  );
}

/** Decorative device silhouettes — no external assets required. */
function ProductCollage() {
  return (
    <div className="absolute inset-0">
      {/* MagSafe puck */}
      <div className="absolute left-[8%] top-[18%] flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#111] shadow-2xl ring-1 ring-white/10">
        <div className="h-10 w-10 rounded-full border-2 border-[#c2a982]/50" />
      </div>

      {/* Phone */}
      <div className="absolute left-1/2 top-[6%] h-[78%] w-[42%] -translate-x-[58%] rounded-[1.75rem] bg-gradient-to-b from-[#3a3a3a] via-[#1a1a1a] to-[#0d0d0d] p-1.5 shadow-2xl ring-1 ring-white/15">
        <div className="relative h-full w-full overflow-hidden rounded-[1.35rem] bg-gradient-to-br from-[#1f2937] via-[#111827] to-[#0f172a]">
          <div className="absolute left-1/2 top-2 h-1.5 w-14 -translate-x-1/2 rounded-full bg-black/50" />
          <div className="absolute inset-x-3 bottom-4 top-8 rounded-xl bg-gradient-to-b from-white/10 to-transparent" />
        </div>
      </div>

      {/* Watch */}
      <div className="absolute bottom-[12%] right-[6%] flex flex-col items-center">
        <div className="h-6 w-9 rounded-t-md bg-[#2c2c2c] ring-1 ring-white/10" />
        <div className="flex h-16 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#333] to-[#151515] shadow-xl ring-1 ring-white/15">
          <div className="h-10 w-10 rounded-full bg-[#0ea5e9]/20 ring-1 ring-[#0ea5e9]/30" />
        </div>
        <div className="h-6 w-9 rounded-b-md bg-[#2c2c2c] ring-1 ring-white/10" />
      </div>

      {/* Earbuds case */}
      <div className="absolute bottom-[8%] left-[12%] h-16 w-12 rounded-2xl bg-gradient-to-b from-[#e8e8e8] to-[#b8b8b8] shadow-xl">
        <div className="mx-auto mt-2 h-1 w-5 rounded-full bg-black/20" />
        <div className="mx-auto mt-3 h-5 w-5 rounded-full bg-white/70 shadow-inner" />
      </div>
    </div>
  );
}
