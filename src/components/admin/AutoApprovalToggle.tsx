"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { setDistributorAutoApprovalAction } from "@/lib/admin/distributor-actions";

export function AutoApprovalToggle({
  distributorId,
  enabled,
}: {
  distributorId: string;
  enabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function toggle() {
    setError("");
    startTransition(async () => {
      const res = await setDistributorAutoApprovalAction(
        distributorId,
        !enabled
      );
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
          enabled
            ? "bg-emerald-100 text-emerald-800"
            : "bg-surface-muted text-muted"
        } ${pending ? "opacity-60" : ""}`}
      >
        {pending ? "…" : enabled ? "On" : "Off"}
      </button>
      {error ? <p className="text-[10px] text-danger">{error}</p> : null}
    </div>
  );
}
