import { applyAutoApprovalsForOrder } from "@/lib/fulfillment/auto-approve";
import {
  handleUnfulfillableLines,
  handleWaitingLines,
} from "@/lib/fulfillment/failure";
import { notifyDistributorsForOrder } from "@/lib/fulfillment/notify";

export async function runPostAssignPipeline(orderId: string): Promise<{
  autoAccepted: number;
  notified: number;
  failedHandled: number;
  waitingHandled: number;
  cancelled: boolean;
  errors: string[];
}> {
  const errors: string[] = [];

  const auto = await applyAutoApprovalsForOrder(orderId);
  if (auto.errors.length) errors.push(...auto.errors);

  const notify = await notifyDistributorsForOrder(orderId);
  if (notify.errors.length) errors.push(...notify.errors);

  const waiting = await handleWaitingLines(orderId);
  if (waiting.errors.length) errors.push(...waiting.errors);

  const failure = await handleUnfulfillableLines(orderId);
  if (failure.errors.length) errors.push(...failure.errors);

  return {
    autoAccepted: auto.autoAccepted,
    notified: notify.notified,
    failedHandled: failure.handled,
    waitingHandled: waiting.handled,
    cancelled: failure.cancelled,
    errors,
  };
}
