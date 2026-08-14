"use server";

import crypto from "crypto";
import Razorpay from "razorpay";

function getRazorpayKeys() {
  const keyId =
    process.env.RAZORPAY_KEY_ID?.trim() ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  return { keyId, keySecret };
}

function isRazorpayConfigured(): boolean {
  const { keyId, keySecret } = getRazorpayKeys();
  return Boolean(keyId && keySecret);
}

function client() {
  const { keyId, keySecret } = getRazorpayKeys();
  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay keys missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET."
    );
  }
  return {
    keyId,
    rzp: new Razorpay({ key_id: keyId, key_secret: keySecret }),
  };
}

export type CreateRazorpayOrderResult =
  | {
      ok: true;
      keyId: string;
      razorpayOrderId: string;
      amountPaise: number;
      currency: "INR";
      orderNumber: string;
    }
  | { ok: false; error: string };

export async function createRazorpayOrderAction(input: {
  orderNumber: string;
  amountInr: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}): Promise<CreateRazorpayOrderResult> {
  if (!isRazorpayConfigured()) {
    return {
      ok: false,
      error:
        "Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to env.",
    };
  }

  const amountInr = Math.round(input.amountInr);
  if (!Number.isFinite(amountInr) || amountInr < 1) {
    return { ok: false, error: "Invalid payment amount." };
  }

  try {
    const { keyId, rzp } = client();
    const amountPaise = amountInr * 100;
    const order = await rzp.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: input.orderNumber.slice(0, 40),
      notes: {
        orderNumber: input.orderNumber,
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
      },
    });

    return {
      ok: true,
      keyId,
      razorpayOrderId: String(order.id),
      amountPaise,
      currency: "INR",
      orderNumber: input.orderNumber,
    };
  } catch (e) {
    console.error("createRazorpayOrderAction:", e);
    let detail: string | null = null;
    if (e && typeof e === "object" && "error" in e) {
      const nested = (e as { error?: { description?: string; reason?: string } })
        .error;
      detail = nested?.description || nested?.reason || null;
    }
    if (!detail && e instanceof Error) detail = e.message;
    return {
      ok: false,
      error: detail || "Could not create Razorpay order.",
    };
  }
}

export type VerifyRazorpayResult =
  | {
      ok: true;
      razorpayOrderId: string;
      razorpayPaymentId: string;
    }
  | { ok: false; error: string };

export async function verifyRazorpayPaymentAction(input: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): Promise<VerifyRazorpayResult> {
  const { keySecret } = getRazorpayKeys();
  if (!keySecret) {
    return { ok: false, error: "Razorpay secret is not configured." };
  }

  const body = `${input.razorpayOrderId}|${input.razorpayPaymentId}`;
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(body)
    .digest("hex");

  const a = Buffer.from(expected);
  const b = Buffer.from(input.razorpaySignature);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return { ok: false, error: "Payment signature verification failed." };
  }

  return {
    ok: true,
    razorpayOrderId: input.razorpayOrderId,
    razorpayPaymentId: input.razorpayPaymentId,
  };
}

/** Client-safe flag for checkout UI. */
export async function getRazorpayPublicConfigAction(): Promise<{
  enabled: boolean;
  keyId: string | null;
}> {
  const enabled = isRazorpayConfigured();
  const keyId =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() ||
    process.env.RAZORPAY_KEY_ID?.trim() ||
    null;
  return { enabled, keyId: enabled ? keyId : null };
}
