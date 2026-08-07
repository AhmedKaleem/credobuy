import type {
  CreatePaymentInput,
  PaymentIntent,
  PaymentResult,
  PaymentService,
} from "./types";

/**
 * Razorpay implementation — intentionally a stub for now.
 *
 * To activate later:
 *  1. `npm install razorpay`
 *  2. Set RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET (server) and
 *     NEXT_PUBLIC_RAZORPAY_KEY_ID (client).
 *  3. Implement createIntent using `orders.create` and confirm using the
 *     signature verification (`validateWebhookSignature`).
 *  4. Register this service in ./index.ts.
 *
 * Because the checkout only talks to the PaymentService interface, no UI
 * changes will be needed when this is switched on.
 */
export class RazorpayPaymentService implements PaymentService {
  readonly name = "razorpay";

  async createIntent(_input: CreatePaymentInput): Promise<PaymentIntent> {
    void _input;
    throw new Error(
      "RazorpayPaymentService is not implemented yet. Using the mock gateway until checkout is finalised."
    );
  }

  async confirm(
    _intentId: string,
    _payload?: Record<string, string>
  ): Promise<PaymentResult> {
    void _intentId;
    void _payload;
    throw new Error("RazorpayPaymentService.confirm is not implemented yet.");
  }
}
