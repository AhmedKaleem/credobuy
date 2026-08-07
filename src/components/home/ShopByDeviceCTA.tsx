import Link from "next/link";
import { ArrowRight, Smartphone } from "lucide-react";

export function ShopByDeviceCTA() {
  return (
    <section
      aria-label="Shop by device"
      className="overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface"
    >
      <div className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Smartphone size={24} strokeWidth={1.6} />
          </span>
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">
              Every accessory, made to fit
            </h2>
            <p className="mt-1 max-w-lg text-sm text-muted">
              Pick your brand and model — we&apos;ll show only cases, protectors,
              chargers and cables guaranteed to fit your exact device.
            </p>
          </div>
        </div>
        <Link
          href="/device"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
        >
          Select your device
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
