"use client";

import Link from "next/link";
import { useState } from "react";
import { Heart, Package } from "lucide-react";
import { Field, Input } from "@/components/ui/form";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/store/auth";
import { useOrders } from "@/store/orders";
import { useWishlist } from "@/store/wishlist";
import { useToast } from "@/store/toast";
import { isValidPhone } from "@/lib/utils";

export default function ProfilePage() {
  const user = useAuth((s) => s.user);
  const updateProfile = useAuth((s) => s.updateProfile);
  const orderCount = useOrders((s) => s.orders.length);
  const wishlistCount = useWishlist((s) => s.ids.length);
  const pushToast = useToast((s) => s.push);

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [error, setError] = useState("");

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (phone && !isValidPhone(phone)) {
      setError("Enter a valid 10-digit number");
      return;
    }
    setError("");
    updateProfile({ fullName, phone });
    pushToast("Profile updated");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
        <Link
          href="/account/orders"
          className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 hover:border-primary"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Package size={22} />
          </span>
          <div>
            <p className="text-xl font-bold">{orderCount}</p>
            <p className="text-xs text-muted">Orders</p>
          </div>
        </Link>
        <Link
          href="/account/wishlist"
          className="flex items-center gap-3 rounded-[var(--radius-card)] border border-border bg-surface p-4 hover:border-primary"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
            <Heart size={22} />
          </span>
          <div>
            <p className="text-xl font-bold">{wishlistCount}</p>
            <p className="text-xs text-muted">Wishlist items</p>
          </div>
        </Link>
      </div>

      <div className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
        <h2 className="text-lg font-bold">Personal details</h2>
        <form onSubmit={save} className="mt-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </Field>
            <Field label="Email">
              <Input value={user?.email ?? ""} disabled />
            </Field>
          </div>
          <Field label="Phone number" error={error}>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              placeholder="10-digit mobile"
            />
          </Field>
          <Button type="submit">Save changes</Button>
        </form>
      </div>
    </div>
  );
}
