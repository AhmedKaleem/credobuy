import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("group flex items-center gap-2", className)}
      aria-label="CredoBuy home"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <span className="text-sm font-black leading-none tracking-tighter">C</span>
      </span>
      <span className="text-[1.35rem] font-semibold lowercase leading-none tracking-tight">
        credo<span className="text-muted">buy</span>
      </span>
    </Link>
  );
}
