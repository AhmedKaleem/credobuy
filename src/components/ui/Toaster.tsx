"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";
import { useToast } from "@/store/toast";
import { cn } from "@/lib/utils";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => {
        const Icon = icons[t.tone];
        return (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-center gap-2.5 rounded-xl border bg-surface px-4 py-3 text-sm shadow-[var(--shadow-hover)] animate-in",
              t.tone === "success" && "border-success/30",
              t.tone === "error" && "border-danger/30",
              t.tone === "info" && "border-border"
            )}
          >
            <Icon
              size={18}
              className={cn(
                t.tone === "success" && "text-success",
                t.tone === "error" && "text-danger",
                t.tone === "info" && "text-primary"
              )}
            />
            <span className="font-medium">{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
