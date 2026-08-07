"use client";

import { useState } from "react";
import { MapPin, Truck } from "lucide-react";
import { isValidPincode } from "@/lib/utils";
import { fastDeliveryPincodes } from "@/data/marketing";

export function PincodeChecker() {
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<null | { fast: boolean; days: number }>(
    null
  );
  const [error, setError] = useState("");

  function check(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidPincode(pin)) {
      setError("Enter a valid 6-digit PIN code");
      setResult(null);
      return;
    }
    setError("");
    const fast = fastDeliveryPincodes.includes(pin) || pin.startsWith("6");
    setResult({ fast, days: fast ? 2 : 5 });
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-border p-4">
      <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        <MapPin size={16} className="text-primary" />
        Delivery options
      </p>
      <form onSubmit={check} className="flex gap-2">
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="Enter PIN code"
          aria-label="PIN code"
          className="w-full rounded-[var(--radius-button)] border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-[var(--radius-button)] bg-primary-soft px-4 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
        >
          Check
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
      {result && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-success">
          <Truck size={15} />
          Delivery by {result.days} {result.days === 1 ? "day" : "days"}
          {result.fast ? " — fast shipping available" : ""}
        </p>
      )}
    </div>
  );
}
