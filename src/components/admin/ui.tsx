import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  tone = "primary",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: string;
  tone?: "primary" | "success" | "accent" | "danger";
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    accent: "bg-accent-soft text-accent",
    danger: "bg-red-50 text-danger",
  } as const;
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", tones[tone])}>
          <Icon size={20} />
        </span>
        {delta && (
          <span className="text-xs font-semibold text-success">{delta}</span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export function Card({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-[var(--radius-card)] border border-border bg-surface", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          {title && <h2 className="font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">{children}</tbody>
      </table>
    </div>
  );
}

/** A simple CSS bar chart for the analytics/reports views. */
export function BarChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-48 items-end gap-2">
      {data.map((d) => (
        <div key={d.label} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-gradient-to-t from-primary to-accent"
              style={{ height: `${(d.value / max) * 100}%` }}
              title={String(d.value)}
            />
          </div>
          <span className="text-xs text-muted">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function StatusPill({
  children,
  tone = "primary",
}: {
  children: React.ReactNode;
  tone?: "primary" | "success" | "accent" | "danger" | "muted";
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    success: "bg-success-soft text-success",
    accent: "bg-accent-soft text-accent",
    danger: "bg-red-50 text-danger",
    muted: "bg-surface-muted text-muted",
  } as const;
  return (
    <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone])}>
      {children}
    </span>
  );
}
