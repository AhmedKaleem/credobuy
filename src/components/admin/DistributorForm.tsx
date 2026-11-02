"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { saveDistributorAction } from "@/lib/admin/ops-actions";
import type { Distributor } from "@/types";

export function DistributorForm({
  distributor,
}: {
  distributor?: Distributor;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(!distributor);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const res = await saveDistributorAction({
      id: distributor?.id,
      name: String(fd.get("name") ?? ""),
      contactPerson: String(fd.get("contactPerson") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      email: String(fd.get("email") ?? ""),
      city: String(fd.get("city") ?? ""),
      state: String(fd.get("state") ?? ""),
      priority: Number(fd.get("priority") ?? 100),
      isActive: fd.get("isActive") === "on",
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (!distributor) e.currentTarget.reset();
    setOpen(false);
    router.refresh();
  }

  if (distributor && !open) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setOpen(true)}>
        Edit
      </Button>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-2">
      <input name="name" defaultValue={distributor?.name} required placeholder="Name" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      <input name="contactPerson" defaultValue={distributor?.contactPerson} placeholder="Contact person" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      <input name="phone" defaultValue={distributor?.phone} placeholder="Phone" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      <input name="email" defaultValue={distributor?.email} type="email" placeholder="Email" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      <input name="city" defaultValue={distributor?.city} placeholder="City" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      <input name="state" defaultValue={distributor?.state} placeholder="State" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      <input name="priority" type="number" defaultValue={distributor?.priority ?? 100} placeholder="Priority" className="rounded-md border border-border bg-surface px-3 py-2 text-sm" />
      <label className="flex items-center gap-2 text-sm">
        <input name="isActive" type="checkbox" defaultChecked={distributor?.isActive !== false} />
        Active
      </label>
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Saving…" : distributor ? "Save" : "Add distributor"}
        </Button>
        {distributor ? (
          <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-xs text-danger sm:col-span-2">{error}</p> : null}
    </form>
  );
}
