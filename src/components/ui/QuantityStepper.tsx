"use client";

import { Minus, Plus } from "lucide-react";

interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  size?: "sm" | "md";
}

export function QuantityStepper({
  value,
  min = 1,
  max = 99,
  onChange,
  size = "md",
}: QuantityStepperProps) {
  const dim = size === "sm" ? "h-8 w-8" : "h-10 w-10";
  return (
    <div className="inline-flex items-center rounded-[var(--radius-button)] border border-border">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={`${dim} flex items-center justify-center text-muted hover:text-foreground disabled:opacity-40`}
      >
        <Minus size={16} />
      </button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={`${dim} flex items-center justify-center text-muted hover:text-foreground disabled:opacity-40`}
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
