import type {
  CreatePaymentInput,
  PaymentIntent,
  PaymentResult,
  PaymentService,
} from "./types";

/**
 * Mock gateway used while the shopping experience stabilises. It simulates a
 * successful capture after a short delay so the full checkout → order-success
 * flow works end-to-end without a real gateway.
 */
export class MockPaymentService implements PaymentService {
  readonly name = "mock";

  async createIntent(input: CreatePaymentInput): Promise<PaymentIntent> {
    await delay(400);
    return {
      intentId: `mock_int_${Date.now()}`,
      gatewayOrderId: `mock_order_${input.orderNumber}`,
      amount: input.amount,
      currency: "INR",
      clientMeta: { gateway: "mock" },
    };
  }

  async confirm(intentId: string): Promise<PaymentResult> {
    await delay(700);
    return {
      success: true,
      intentId,
      gatewayPaymentId: `mock_pay_${Date.now()}`,
      status: "paid",
      message: "Mock payment captured successfully.",
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
