"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  acceptFulfillmentAction,
  rejectFulfillmentAction,
} from "@/lib/fulfillment/actions";
import { useToast } from "@/store/toast";

export function AssignmentActions({ fulfillmentId }: { fulfillmentId: string }) {
  const router = useRouter();
  const pushToast = useToast((s) => s.push);
  const [busy, setBusy] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");

  async function accept() {
    setBusy("accept");
    setError("");
    const res = await acceptFulfillmentAction(fulfillmentId);
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      pushToast(res.error, "error");
      return;
    }
    pushToast("Order is Accepted", "success");
    router.refresh();
  }

  async function reject() {
    setBusy("reject");
    setError("");
    const res = await rejectFulfillmentAction(fulfillmentId, reason);
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      pushToast(res.error, "error");
      return;
    }
    pushToast("Order rejected — next distributor notified", "info");
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button
          type="button"
          size="lg"
          className="min-h-12 w-full touch-manipulation"
          disabled={busy !== null}
          onClick={accept}
        >
          {busy === "accept" ? "Accepting…" : "Accept"}
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="min-h-12 w-full touch-manipulation"
          disabled={busy !== null}
          onClick={reject}
        >
          {busy === "reject" ? "Rejecting…" : "Reject & reroute"}
        </Button>
      </div>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reject reason (optional)"
        className="min-h-11 w-full rounded-[var(--radius-button)] border border-border bg-surface px-3 py-2.5 text-sm"
      />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}
