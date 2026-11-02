"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { replySupportTicketAction } from "@/lib/admin/ops-actions";

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    setError("");
    const res = await replySupportTicketAction({
      ticketId,
      reply: String(fd.get("reply") ?? ""),
      status: fd.get("status") === "closed" ? "closed" : "replied",
    });
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    e.currentTarget.reset();
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <textarea
        name="reply"
        required
        rows={3}
        placeholder="Reply to the customer…"
        className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm"
      />
      <div className="flex flex-wrap items-center gap-2">
        <select
          name="status"
          defaultValue="replied"
          className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs"
        >
          <option value="replied">Mark replied</option>
          <option value="closed">Close ticket</option>
        </select>
        <Button type="submit" size="sm" disabled={busy}>
          {busy ? "Sending…" : "Send reply"}
        </Button>
      </div>
      {error ? <p className="text-xs text-danger">{error}</p> : null}
    </form>
  );
}
