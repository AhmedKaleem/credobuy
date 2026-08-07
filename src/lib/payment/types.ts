/**
 * Payment abstraction.
 *
 * The checkout flow depends only on this interface, never on a concrete
 * gateway. Razorpay can be dropped in later by implementing PaymentService
 * and registering it in ./index.ts — no checkout UI changes required.
 */
import type { PaymentMethod } from "@/types";

export interface CreatePaymentInput {
  orderNumber: string;
  amount: number; // in INR rupees
  currency: "INR";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  method: PaymentMethod;
}

export interface PaymentIntent {
  intentId: string;
  gatewayOrderId: string;
  amount: number;
  currency: "INR";
  /** Extra data the client-side checkout widget may need (e.g. Razorpay key). */
  clientMeta?: Record<string, string>;
}

export interface PaymentResult {
  success: boolean;
  intentId: string;
  gatewayPaymentId: string;
  status: "paid" | "failed" | "pending";
  message: string;
}

export interface PaymentService {
  readonly name: string;
  /** Create a payment intent / gateway order before collecting payment. */
  createIntent(input: CreatePaymentInput): Promise<PaymentIntent>;
  /** Verify + capture a payment after the gateway callback. */
  confirm(
    intentId: string,
    gatewayPayload?: Record<string, string>
  ): Promise<PaymentResult>;
}
