"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Banknote,
  CreditCard,
  MapPin,
  Plus,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { Container, Badge, Skeleton } from "@/components/ui/primitives";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { AddressForm } from "@/components/account/AddressForm";
import { SummaryRows } from "@/components/cart/SummaryRows";
import { useCart } from "@/store/cart";
import { useAddresses } from "@/store/addresses";
import { useOrders } from "@/store/orders";
import { useToast } from "@/store/toast";
import { useMounted } from "@/hooks/useMounted";
import {
  computeTotals,
  type ResolvedCartItem,
} from "@/lib/cart";
import { resolveCartItemsAction } from "@/lib/query-actions";
import { getPaymentService } from "@/lib/payment";
import {
  createRazorpayOrderAction,
  getRazorpayPublicConfigAction,
  verifyRazorpayPaymentAction,
} from "@/lib/payment/actions";
import { openRazorpayCheckout } from "@/lib/payment/razorpay-checkout";
import { placeOrderAction } from "@/lib/orders/place-order";
import { generateOrderNumber, formatINR, cn } from "@/lib/utils";
import type { Address, PaymentMethod } from "@/types";
import { ShoppingBag } from "lucide-react";

const methods: {
  id: PaymentMethod;
  label: string;
  desc: string;
  icon: typeof Wallet;
  disabled?: boolean;
}[] = [
  {
    id: "razorpay",
    label: "Pay Online (UPI / Cards)",
    desc: "Secure checkout via Razorpay.",
    icon: CreditCard,
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    desc: "Pay in cash when your order arrives.",
    icon: Banknote,
  },
  {
    id: "mock",
    label: "Pay Online (Demo)",
    desc: "Simulated payment — no real charge.",
    icon: Wallet,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const mounted = useMounted();
  const [placing, setPlacing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [chosenAddressId, setChosenAddressId] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("razorpay");
  const [razorpayReady, setRazorpayReady] = useState(false);

  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const addresses = useAddresses((s) => s.addresses);
  const addAddress = useAddresses((s) => s.add);
  const addOrder = useOrders((s) => s.addOrder);
  const pushToast = useToast((s) => s.push);

  const [resolved, setResolved] = useState<ResolvedCartItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    resolveCartItemsAction(items).then((rows) => {
      if (!cancelled) setResolved(rows);
    });
    return () => {
      cancelled = true;
    };
  }, [items]);

  useEffect(() => {
    getRazorpayPublicConfigAction().then((cfg) => {
      setRazorpayReady(cfg.enabled);
      if (!cfg.enabled) setMethod((m) => (m === "razorpay" ? "mock" : m));
    });
  }, []);

  const totals = computeTotals(resolved);

  // Effective selection: the explicit choice, else the default/first address.
  const defaultAddressId =
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? null;
  const selectedAddressId = chosenAddressId ?? defaultAddressId;
  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ?? null;

  async function placeOrder() {
    if (!selectedAddress) {
      pushToast("Please select a delivery address", "error");
      return;
    }
    setPlacing(true);
    const orderNumber = generateOrderNumber();
    try {
      let gatewayOrderId: string | undefined;
      let gatewayPaymentId: string | undefined;
      let paymentMethod: PaymentMethod = method;

      if (method === "razorpay") {
        const intent = await createRazorpayOrderAction({
          orderNumber,
          amountInr: totals.total,
          customerName: selectedAddress.fullName,
          customerEmail: "customer@credobuy.in",
          customerPhone: selectedAddress.phone,
        });
        if (!intent.ok) {
          pushToast(intent.error, "error");
          setPlacing(false);
          return;
        }

        const checkout = await openRazorpayCheckout({
          keyId: intent.keyId,
          razorpayOrderId: intent.razorpayOrderId,
          amountPaise: intent.amountPaise,
          currency: "INR",
          orderNumber,
          customerName: selectedAddress.fullName,
          customerEmail: "customer@credobuy.in",
          customerPhone: selectedAddress.phone,
        });

        if (!checkout.ok) {
          if (!checkout.cancelled) pushToast(checkout.error, "error");
          setPlacing(false);
          return;
        }

        const verified = await verifyRazorpayPaymentAction({
          razorpayOrderId: checkout.payment.razorpay_order_id,
          razorpayPaymentId: checkout.payment.razorpay_payment_id,
          razorpaySignature: checkout.payment.razorpay_signature,
        });
        if (!verified.ok) {
          pushToast(verified.error, "error");
          setPlacing(false);
          return;
        }

        gatewayOrderId = verified.razorpayOrderId;
        gatewayPaymentId = verified.razorpayPaymentId;
        paymentMethod = "razorpay";
      } else if (method === "mock") {
        const payment = getPaymentService();
        const intent = await payment.createIntent({
          orderNumber,
          amount: totals.total,
          currency: "INR",
          customerName: selectedAddress.fullName,
          customerEmail: "customer@credobuy.in",
          customerPhone: selectedAddress.phone,
          method,
        });
        const result = await payment.confirm(intent.intentId);
        if (!result.success) {
          pushToast("Payment failed. Please try again.", "error");
          setPlacing(false);
          return;
        }
      }

      const result = await placeOrderAction({
        items,
        address: selectedAddress,
        paymentMethod,
        orderNumber,
        gatewayOrderId,
        gatewayPaymentId,
      });

      if (!result.ok) {
        pushToast(result.error, "error");
        setPlacing(false);
        return;
      }

      addOrder(result.order);
      clearCart();

      if (result.warning) {
        pushToast(result.warning, "error");
      } else if (result.persisted && result.fulfillmentCount > 0) {
        pushToast(
          `Order placed — ${result.fulfillmentCount} line(s) sent to distributors`
        );
      } else if (result.persisted) {
        pushToast("Order placed (no distributor assignment yet)");
      } else {
        pushToast("Order placed");
      }

      router.push(`/order-success?order=${result.order.orderNumber}`);
    } catch {
      pushToast("Something went wrong placing your order", "error");
      setPlacing(false);
    }
  }

  if (!mounted) {
    return (
      <Container className="py-6">
        <Skeleton className="h-8 w-40" />
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
        </div>
      </Container>
    );
  }

  if (resolved.length === 0) {
    return (
      <Container className="py-6">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add some products before checking out."
          actionLabel="Start shopping"
          actionHref="/shop"
        />
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Cart", href: "/cart" },
          { label: "Checkout" },
        ]}
      />
      <h1 className="mb-6 text-2xl font-bold sm:text-3xl">Checkout</h1>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          {/* Address */}
          <section className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <MapPin size={18} className="text-primary" /> Delivery Address
              </h2>
              {addresses.length > 0 && !showForm && (
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  <Plus size={14} /> Add new
                </button>
              )}
            </div>

            {addresses.length > 0 && !showForm && (
              <div className="space-y-2">
                {addresses.map((a) => (
                  <AddressOption
                    key={a.id}
                    address={a}
                    selected={a.id === selectedAddressId}
                    onSelect={() => setChosenAddressId(a.id)}
                  />
                ))}
              </div>
            )}

            {(addresses.length === 0 || showForm) && (
              <AddressForm
                submitLabel="Save & use this address"
                onCancel={addresses.length > 0 ? () => setShowForm(false) : undefined}
                onSubmit={(input) => {
                  const created = addAddress(input);
                  setChosenAddressId(created.id);
                  setShowForm(false);
                  pushToast("Address saved");
                }}
              />
            )}
          </section>

          {/* Payment */}
          <section className="rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <h2 className="mb-3 text-lg font-bold">Payment Method</h2>
            <div className="space-y-2">
              {methods.map((m) => {
                const disabled =
                  Boolean(m.disabled) ||
                  (m.id === "razorpay" && !razorpayReady);
                return (
                <label
                  key={m.id}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-[var(--radius-card)] border p-3.5 transition-colors",
                    disabled && "cursor-not-allowed opacity-60",
                    method === m.id ? "border-primary bg-primary-soft" : "border-border"
                  )}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={method === m.id}
                    disabled={disabled}
                    onChange={() => setMethod(m.id)}
                    className="h-4 w-4 accent-[var(--color-primary)]"
                  />
                  <m.icon size={20} className="text-primary" />
                  <span className="flex-1">
                    <span className="flex items-center gap-2 text-sm font-medium">
                      {m.label}
                      {m.id === "razorpay" && !razorpayReady && (
                        <Badge tone="muted">Add keys</Badge>
                      )}
                      {m.disabled && <Badge tone="muted">Soon</Badge>}
                    </span>
                    <span className="text-xs text-muted">{m.desc}</span>
                  </span>
                </label>
                );
              })}
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
              <ShieldCheck size={14} className="text-success" />
              Your payment information is processed securely.
            </p>
          </section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="space-y-4 rounded-[var(--radius-card)] border border-border bg-surface p-5">
            <h2 className="text-lg font-bold">Order Summary</h2>
            <div className="max-h-56 space-y-3 overflow-y-auto">
              {resolved.map(({ product, variant, quantity }) => (
                <div key={variant.id} className="flex gap-3">
                  <span className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border">
                    <SmartImage src={product.images[0].url} alt={product.title} />
                  </span>
                  <div className="flex-1 text-sm">
                    <p className="line-clamp-1 font-medium">{product.title}</p>
                    <p className="text-xs text-muted">
                      Qty {quantity} · {formatINR(variant.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <SummaryRows totals={totals} />
            <Button
              className="w-full"
              size="lg"
              onClick={placeOrder}
              disabled={placing}
            >
              {placing ? "Placing order…" : `Place Order · ${formatINR(totals.total)}`}
            </Button>
          </div>
        </aside>
      </div>
    </Container>
  );
}

function AddressOption({
  address,
  selected,
  onSelect,
}: {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer gap-3 rounded-[var(--radius-card)] border p-3.5 transition-colors",
        selected ? "border-primary bg-primary-soft" : "border-border"
      )}
    >
      <input
        type="radio"
        name="address"
        checked={selected}
        onChange={onSelect}
        className="mt-1 h-4 w-4 accent-[var(--color-primary)]"
      />
      <div className="text-sm">
        <p className="font-medium">
          {address.fullName}{" "}
          <span className="ml-1 rounded bg-surface-muted px-1.5 py-0.5 text-xs capitalize text-muted">
            {address.type}
          </span>
        </p>
        <p className="text-muted">
          {address.line1}
          {address.line2 ? `, ${address.line2}` : ""}, {address.city},{" "}
          {address.state} - {address.pincode}
        </p>
        <p className="text-muted">Phone: {address.phone}</p>
      </div>
    </label>
  );
}
