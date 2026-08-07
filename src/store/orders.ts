"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "@/types";

interface OrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  getByNumber: (orderNumber: string) => Order | undefined;
}

/**
 * Client-side order history. In the Supabase-backed build this is replaced by
 * reads/writes against the `orders` table; the shape is identical.
 */
export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      getByNumber: (orderNumber) =>
        get().orders.find((o) => o.orderNumber === orderNumber),
    }),
    { name: "credobuy-orders" }
  )
);
