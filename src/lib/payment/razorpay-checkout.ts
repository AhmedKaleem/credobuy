/**
 * Client helper: open Razorpay Checkout modal and resolve with payment result.
 */

export type RazorpayCheckoutInput = {
  keyId: string;
  razorpayOrderId: string;
  amountPaise: number;
  currency: "INR";
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

export type RazorpayCheckoutSuccess = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function openRazorpayCheckout(
  input: RazorpayCheckoutInput
): Promise<
  | { ok: true; payment: RazorpayCheckoutSuccess }
  | { ok: false; error: string; cancelled?: boolean }
> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    return { ok: false, error: "Could not load Razorpay Checkout." };
  }

  return new Promise((resolve) => {
    const rzp = new window.Razorpay!({
      key: input.keyId,
      amount: input.amountPaise,
      currency: input.currency,
      name: "CredoBuy",
      description: `Order ${input.orderNumber}`,
      order_id: input.razorpayOrderId,
      prefill: {
        name: input.customerName,
        email: input.customerEmail,
        contact: input.customerPhone,
      },
      theme: { color: "#16150f" },
      handler(response: RazorpayCheckoutSuccess) {
        resolve({ ok: true, payment: response });
      },
      modal: {
        ondismiss() {
          resolve({
            ok: false,
            cancelled: true,
            error: "Payment cancelled.",
          });
        },
      },
    });

    rzp.on("payment.failed", (response: unknown) => {
      const msg =
        (response as { error?: { description?: string } })?.error
          ?.description || "Payment failed.";
      resolve({ ok: false, error: msg });
    });

    rzp.open();
  });
}
