"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { adminRerouteFulfillmentAction } from "@/lib/fulfillment/actions";

export function RerouteForm({
  fulfillmentId,
  distributors,
}: {
  fulfillmentId: string;
  distributors: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [distributorId, setDistributorId] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await adminRerouteFulfillmentAction(
      fulfillmentId,
      distributorId || null,
      reason
    );
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <label className="flex-1 text-xs">
        <span className="mb-1 block text-muted">Force distributor (optional)</span>
        <select
          value={distributorId}
          onChange={(e) => setDistributorId(e.target.value)}
          className="w-full rounded-[var(--radius-button)] border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="">Auto-pick next</option>
          {distributors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex-1 text-xs">
        <span className="mb-1 block text-muted">Reason</span>
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full rounded-[var(--radius-button)] border border-border bg-surface px-3 py-2 text-sm"
          placeholder="Out of stock / SLA / etc."
        />
      </label>
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? "Rerouting…" : "Reroute"}
      </Button>
      {error ? <p className="w-full text-xs text-danger">{error}</p> : null}
    </form>
  );
}
