"use client";

import { useState } from "react";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/primitives";
import { AddressForm } from "@/components/account/AddressForm";
import { useAddresses } from "@/store/addresses";
import { useToast } from "@/store/toast";
import type { Address } from "@/types";

export default function AddressesPage() {
  const addresses = useAddresses((s) => s.addresses);
  const add = useAddresses((s) => s.add);
  const update = useAddresses((s) => s.update);
  const remove = useAddresses((s) => s.remove);
  const setDefault = useAddresses((s) => s.setDefault);
  const pushToast = useToast((s) => s.push);

  const [mode, setMode] = useState<"list" | "add" | string>("list");

  const editing =
    mode !== "list" && mode !== "add"
      ? addresses.find((a) => a.id === mode)
      : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Saved Addresses</h1>
        {mode === "list" && (
          <Button onClick={() => setMode("add")}>
            <Plus size={16} /> Add address
          </Button>
        )}
      </div>

      {mode === "add" || editing ? (
        <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
          <h2 className="mb-4 text-lg font-semibold">
            {editing ? "Edit address" : "New address"}
          </h2>
          <AddressForm
            initial={editing}
            submitLabel={editing ? "Update address" : "Save address"}
            onCancel={() => setMode("list")}
            onSubmit={(input) => {
              if (editing) {
                update(editing.id, input);
                pushToast("Address updated");
              } else {
                add(input);
                pushToast("Address added");
              }
              setMode("list");
            }}
          />
        </div>
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No addresses saved"
          description="Add a delivery address to speed up checkout."
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((a) => (
            <AddressCard
              key={a.id}
              address={a}
              onEdit={() => setMode(a.id)}
              onDelete={() => {
                remove(a.id);
                pushToast("Address removed", "info");
              }}
              onDefault={() => setDefault(a.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AddressCard({
  address,
  onEdit,
  onDelete,
  onDefault,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onDefault: () => void;
}) {
  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 font-semibold">
          {address.fullName}
          <span className="rounded bg-surface-muted px-1.5 py-0.5 text-xs capitalize text-muted">
            {address.type}
          </span>
          {address.isDefault && <Badge tone="success">Default</Badge>}
        </p>
      </div>
      <p className="mt-1 text-sm text-muted">
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
        {address.state} - {address.pincode}
      </p>
      <p className="mt-1 text-sm text-muted">Phone: {address.phone}</p>
      <div className="mt-3 flex items-center gap-3 text-sm">
        <button onClick={onEdit} className="inline-flex items-center gap-1 font-medium text-primary hover:underline">
          <Pencil size={14} /> Edit
        </button>
        <button onClick={onDelete} className="inline-flex items-center gap-1 font-medium text-danger hover:underline">
          <Trash2 size={14} /> Delete
        </button>
        {!address.isDefault && (
          <button onClick={onDefault} className="inline-flex items-center gap-1 font-medium text-muted hover:text-foreground">
            <Star size={14} /> Set default
          </button>
        )}
      </div>
    </div>
  );
}
