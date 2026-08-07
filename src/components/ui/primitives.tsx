import { cn } from "@/lib/utils";

/** Page-width container. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

/** Coloured pill/badge. */
export function Badge({
  children,
  tone = "primary",
  className,
}: {
  children: React.ReactNode;
  tone?: "primary" | "accent" | "success" | "danger" | "muted" | "solid";
  className?: string;
}) {
  const tones = {
    primary: "bg-primary-soft text-primary",
    accent: "bg-accent-soft text-accent",
    success: "bg-success-soft text-success",
    danger: "bg-danger/10 text-danger",
    muted: "bg-surface-muted text-muted",
    solid: "bg-primary text-primary-foreground",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/** Section heading with optional "view all" action. */
export function SectionHeader({
  title,
  subtitle,
  action,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            {eyebrow}
          </p>
        )}
        <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
          {title}
        </h2>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0 pb-1">{action}</div>}
    </div>
  );
}

/** Skeleton block. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-lg", className)} />;
}

/** Simple centered spinner. */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-border border-t-primary",
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
