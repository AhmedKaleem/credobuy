import type { FulfillmentStatus, OrderFulfillment } from "@/types";

export function mapFulfillment(row: Record<string, unknown>): OrderFulfillment {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    orderItemId: String(row.order_item_id),
    productId: row.product_id ? String(row.product_id) : undefined,
    quantity: Number(row.quantity),
    distributorId: row.distributor_id ? String(row.distributor_id) : undefined,
    status: String(row.status) as FulfillmentStatus,
    customerUnitPrice: Number(row.customer_unit_price),
    supplierUnitCost:
      row.supplier_unit_cost == null
        ? undefined
        : Number(row.supplier_unit_cost),
    costVariance: Number(row.cost_variance ?? 0),
    attemptNumber: Number(row.attempt_number ?? 1),
    maxAttempts: Number(row.max_attempts ?? 5),
    rejectReason: row.reject_reason ? String(row.reject_reason) : undefined,
    slaDeadline: row.sla_deadline ? String(row.sla_deadline) : undefined,
    adminOverride: Boolean(row.admin_override),
    notes: row.notes ? String(row.notes) : undefined,
    assignedAt: row.assigned_at ? String(row.assigned_at) : undefined,
    acceptedAt: row.accepted_at ? String(row.accepted_at) : undefined,
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
    productTitle: row.product_title ? String(row.product_title) : undefined,
    orderNumber: row.order_number ? String(row.order_number) : undefined,
    distributorName: row.distributor_name
      ? String(row.distributor_name)
      : undefined,
  };
}
