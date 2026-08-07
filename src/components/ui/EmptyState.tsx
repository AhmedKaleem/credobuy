import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { buttonStyles } from "./Button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-border bg-surface px-6 py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
        <Icon size={28} />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link href={actionHref} className={`${buttonStyles("primary")} mt-5`}>
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
