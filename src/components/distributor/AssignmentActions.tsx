"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  acceptFulfillmentAction,
  rejectFulfillmentAction,
} from "@/lib/fulfillment/actions";

export function AssignmentActions({ fulfillmentId }: { fulfillmentId: string }) {
  const router = useRouter();
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
      return;
    }
    router.refresh();
  }

  async function reject() {
    setBusy("reject");
    setError("");
    const res = await rejectFulfillmentAction(fulfillmentId, reason);
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          disabled={busy !== null}
          onClick={accept}
        >
          {busy === "accept" ? "Accepting…" : "Accept"}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
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
        className="w-full rounded-[var(--radius-button)] border border-border bg-surface px-3 py-2 text-xs"
      />
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </div>
  );
}
