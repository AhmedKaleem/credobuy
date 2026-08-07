import type { OrderStatus } from "@/types";

/** Sample orders shown in the admin panel (server-side demo data). */
export interface AdminOrder {
  orderNumber: string;
  customer: string;
  city: string;
  items: number;
  total: number;
  status: OrderStatus;
  paymentMethod: "mock" | "cod";
  placedAt: string;
}

export const adminOrders: AdminOrder[] = [
  { orderNumber: "CB2026100241", customer: "Arun Kumar", city: "Chennai", items: 3, total: 3597, status: "delivered", paymentMethod: "mock", placedAt: "2026-07-08" },
  { orderNumber: "CB2026100242", customer: "Priya S", city: "Coimbatore", items: 1, total: 1499, status: "out_for_delivery", paymentMethod: "cod", placedAt: "2026-07-12" },
  { orderNumber: "CB2026100243", customer: "Mohammed Rafi", city: "Madurai", items: 2, total: 2198, status: "shipped", paymentMethod: "mock", placedAt: "2026-07-13" },
  { orderNumber: "CB2026100244", customer: "Deepa R", city: "Trichy", items: 4, total: 4296, status: "packed", paymentMethod: "mock", placedAt: "2026-07-14" },
  { orderNumber: "CB2026100245", customer: "Karthik V", city: "Salem", items: 1, total: 999, status: "confirmed", paymentMethod: "cod", placedAt: "2026-07-15" },
  { orderNumber: "CB2026100246", customer: "Sneha M", city: "Chennai", items: 2, total: 1848, status: "confirmed", paymentMethod: "mock", placedAt: "2026-07-15" },
  { orderNumber: "CB2026100247", customer: "Vikram P", city: "Tirunelveli", items: 1, total: 2499, status: "cancelled", paymentMethod: "mock", placedAt: "2026-07-11" },
];

export interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  orders: number;
  totalSpent: number;
  joined: string;
}

export const adminCustomers: AdminCustomer[] = [
  { id: "c1", name: "Arun Kumar", email: "arun.k@example.com", phone: "9840011223", city: "Chennai", orders: 12, totalSpent: 28450, joined: "2025-11-02" },
  { id: "c2", name: "Priya S", email: "priya.s@example.com", phone: "9842233445", city: "Coimbatore", orders: 8, totalSpent: 15230, joined: "2026-01-15" },
  { id: "c3", name: "Mohammed Rafi", email: "rafi.m@example.com", phone: "9843344556", city: "Madurai", orders: 5, totalSpent: 9870, joined: "2026-02-20" },
  { id: "c4", name: "Deepa R", email: "deepa.r@example.com", phone: "9844455667", city: "Trichy", orders: 15, totalSpent: 41200, joined: "2025-09-10" },
  { id: "c5", name: "Karthik V", email: "karthik.v@example.com", phone: "9845566778", city: "Salem", orders: 3, totalSpent: 4560, joined: "2026-04-05" },
  { id: "c6", name: "Sneha M", email: "sneha.m@example.com", phone: "9846677889", city: "Chennai", orders: 7, totalSpent: 13400, joined: "2026-03-12" },
];

export const monthlyRevenue = [
  { label: "Feb", value: 182000 },
  { label: "Mar", value: 214000 },
  { label: "Apr", value: 268000 },
  { label: "May", value: 245000 },
  { label: "Jun", value: 312000 },
  { label: "Jul", value: 358000 },
];

export const categorySales = [
  { label: "Cases", value: 420 },
  { label: "Chargers", value: 380 },
  { label: "Audio", value: 510 },
  { label: "Cables", value: 340 },
  { label: "Power", value: 290 },
  { label: "Screen", value: 260 },
];
