import { MockPaymentService } from "./mock";
import { RazorpayPaymentService } from "./razorpay";
import type { PaymentService } from "./types";

export type { PaymentService } from "./types";

/**
 * Returns the active payment gateway. Controlled by NEXT_PUBLIC_PAYMENT_GATEWAY
 * ("mock" | "razorpay"). Defaults to the mock gateway so the shopping flow
 * works before Razorpay is wired up.
 */
export function getPaymentService(): PaymentService {
  const gateway = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY ?? "mock";
  if (gateway === "razorpay") return new RazorpayPaymentService();
  return new MockPaymentService();
}
