import Razorpay from "razorpay";

function getRazorpayKeys() {
  const keyId =
    process.env.RAZORPAY_KEY_ID?.trim() ||
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  return { keyId, keySecret };
}

export async function refundRazorpayPayment(input: {
  paymentId: string;
  amountInr: number;
  notes?: Record<string, string>;
}): Promise<{ ok: true; refundId: string } | { ok: false; error: string }> {
  const { keyId, keySecret } = getRazorpayKeys();
  if (!keyId || !keySecret) {
    return { ok: false, error: "Razorpay is not configured." };
  }

  const paise = Math.round(input.amountInr * 100);
  if (!Number.isFinite(paise) || paise < 1) {
    return { ok: false, error: "Invalid refund amount." };
  }

  try {
    const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret });
    const refund = await rzp.payments.refund(input.paymentId, {
      amount: paise,
      notes: input.notes,
    });
    return { ok: true, refundId: String(refund.id) };
  } catch (e) {
    console.error("refundRazorpayPayment:", e);
    let detail: string | null = null;
    if (e && typeof e === "object" && "error" in e) {
      const nested = (e as { error?: { description?: string; reason?: string } })
        .error;
      detail = nested?.description || nested?.reason || null;
    }
    if (!detail && e instanceof Error) detail = e.message;
    return { ok: false, error: detail || "Razorpay refund failed." };
  }
}
