"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { saveCouponAction } from "@/lib/admin/ops-actions";
import type { Coupon } from "@/types";

export function CouponForm({ coupon }: { coupon?: Coupon }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(!coupon);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const res = await saveCouponAction({
      id: coupon?.id,
      code: String(fd.get("code") ?? ""),
      description: String(fd.get("description") ?? ""),
      type: fd.get("type") === "flat" ? "flat" : "percent",
      value: Number(fd.get("value") ?? 0),
      minOrder: Number(fd.get("minOrder") ?? 0),
      maxDiscount: fd.get("maxDiscount")
        ? Number(fd.get("maxDiscount"))
        : undefined,
      active: fd.get("active") === "on",
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (!coupon) e.currentTarget.reset();
    setOpen(false);
    router.refresh();
  }

  if (coupon && !open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        Edit
      </Button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
      <input name="code" defaultValue={coupon?.code} required placeholder="CODE" className="rounded-md border border-border bg-surface px-3 py-2 text-sm uppercase" />
      <input name="description" defaultValue={coupon?.description} placeholder="Description" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      <select name="type" defaultValue={coupon?.type ?? "percent"} className="rounded-md border border-border bg-surface px-3 py-2 text-sm">
        <option value="percent">Percent</option>
        <option value="flat">Flat ₹</option>
      </select>
      <input name="value" type="number" defaultValue={coupon?.value} required placeholder="Value" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      <input name="minOrder" type="number" defaultValue={coupon?.minOrder ?? 0} placeholder="Min order" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      <input name="maxDiscount" type="number" defaultValue={coupon?.maxDiscount} placeholder="Max discount (optional)" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      <label className="flex items-center gap-2 text-sm">
        <input name="active" type="checkbox" defaultChecked={coupon?.active !== false} />
        Active
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Saving…" : coupon ? "Save" : "Create coupon"}
        </Button>
        {coupon ? (
          <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-danger sm:col-span-2">{error}</p> : null}
    </form>
  );
}
