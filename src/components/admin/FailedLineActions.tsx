"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  adminRefundFulfillmentAction,
  adminSubstituteFulfillmentAction,
} from "@/lib/fulfillment/actions";

export function FailedLineActions({
  fulfillmentId,
  products,
}: {
  fulfillmentId: string;
  products: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [productId, setProductId] = useState("");
  const [busy, setBusy] = useState<"refund" | "sub" | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refund() {
    setBusy("refund");
    setError("");
    const res = await adminRefundFulfillmentAction(fulfillmentId);
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setMessage("message" in res ? res.message : "Refunded.");
    router.refresh();
  }

  async function substitute() {
    setBusy("sub");
    setError("");
    const res = await adminSubstituteFulfillmentAction(fulfillmentId, productId);
    setBusy(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setMessage("message" in res ? res.message : "Substituted.");
    router.refresh();
  }

  return (
    <div className="mt-3 space-y-2 border-t border-border pt-3">
      <p className="text-xs font-medium">Admin resolution</p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <Button
          type="button"
          size="sm"
          variant="danger"
          disabled={busy !== null}
          onClick={refund}
        >
          {busy === "refund" ? "Refunding…" : "Refund this line"}
        </Button>
        <label className="flex-1 text-xs">
          <span className="mb-1 block text-muted">Substitute product</span>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full rounded-[var(--radius-button)] border border-border bg-surface px-3 py-2 text-sm"
          >
            <option value="">Choose replacement</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy !== null || !productId}
          onClick={substitute}
        >
          {busy === "sub" ? "Sending…" : "Send substitute"}
        </Button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
      {message ? <p className="text-xs text-success">{message}</p> : null}
    </div>
  );
}
