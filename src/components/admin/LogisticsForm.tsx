"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateOrderLogisticsAction } from "@/lib/admin/ops-actions";
import type { OrderStatus } from "@/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

export function LogisticsForm({
  orderId,
  status,
  carrier,
  trackingNumber,
}: {
  orderId: string;
  status: OrderStatus;
  carrier?: string;
  trackingNumber?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const res = await updateOrderLogisticsAction({
      orderId,
      status: String(fd.get("status")) as OrderStatus,
      carrier: String(fd.get("carrier") ?? ""),
      trackingNumber: String(fd.get("trackingNumber") ?? ""),
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-end">
      <select
        name="status"
        defaultValue={status}
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <input
        name="carrier"
        defaultValue={carrier}
        placeholder="Carrier"
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs"
      />
      <input
        name="trackingNumber"
        defaultValue={trackingNumber}
        placeholder="Tracking no."
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs"
      />
      <Button type="submit" size="sm" disabled={busy}>
        {busy ? "…" : "Update"}
      </Button>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </form>
  );
}
