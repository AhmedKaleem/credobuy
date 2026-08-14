import type {
  CreatePaymentInput,
  PaymentIntent,
  PaymentResult,
  PaymentService,
} from "./types";

/**
 * Server-oriented Razorpay adapter kept for the PaymentService interface.
 * Checkout should prefer server actions in `./actions` + client Checkout.js.
 */
export class RazorpayPaymentService implements PaymentService {
  readonly name = "razorpay";

  async createIntent(input: CreatePaymentInput): Promise<PaymentIntent> {
    const { createRazorpayOrderAction } = await import("./actions");
    const result = await createRazorpayOrderAction({
      orderNumber: input.orderNumber,
      amountInr: input.amount,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
    });
    if (!result.ok) throw new Error(result.error);
    return {
      intentId: result.razorpayOrderId,
      gatewayOrderId: result.razorpayOrderId,
      amount: input.amount,
      currency: "INR",
      clientMeta: {
        keyId: result.keyId,
        amountPaise: String(result.amountPaise),
      },
    };
  }

  async confirm(
    intentId: string,
    gatewayPayload?: Record<string, string>
  ): Promise<PaymentResult> {
    const orderId = gatewayPayload?.razorpay_order_id || intentId;
    const paymentId = gatewayPayload?.razorpay_payment_id;
    const signature = gatewayPayload?.razorpay_signature;
    if (!paymentId || !signature) {
      return {
        success: false,
        intentId,
        gatewayPaymentId: "",
        status: "failed",
        message: "Missing Razorpay payment payload.",
      };
    }
    const { verifyRazorpayPaymentAction } = await import("./actions");
    const result = await verifyRazorpayPaymentAction({
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
    });
    if (!result.ok) {
      return {
        success: false,
        intentId,
        gatewayPaymentId: paymentId,
        status: "failed",
        message: result.error,
      };
    }
    return {
      success: true,
      intentId: orderId,
      gatewayPaymentId: paymentId,
      status: "paid",
      message: "Payment verified.",
    };
  }
}
