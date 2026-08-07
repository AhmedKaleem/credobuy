"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Boxes,
  FolderTree,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Route,
  ShoppingBag,
  Smartphone,
  Tag,
  Ticket,
  Truck,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";
import { adminLogoutAction } from "@/lib/auth/actions";

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/brands", label: "Brands", icon: Tag },
  { href: "/admin/devices", label: "Devices", icon: Smartphone },
  { href: "/admin/inventory", label: "Inventory", icon: Boxes },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/fulfillment", label: "Fulfillment", icon: Route },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/coupons", label: "Coupons", icon: Ticket },
  { href: "/admin/banners", label: "Banners", icon: ImageIcon },
  { href: "/admin/distributors", label: "Distributors", icon: Truck },
  { href: "/admin/reports", label: "Sales Reports", icon: BarChart3 },
];

export function AdminShell({
  children,
  email,
  mode,
}: {
  children: React.ReactNode;
  email: string;
  mode: "supabase" | "demo";
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <nav className="space-y-1">
      {nav.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:bg-surface-muted hover:text-foreground"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="mx-auto flex w-full max-w-[1600px]">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-border bg-surface p-4 lg:block">
        <div className="mb-4 flex items-center justify-between">
          <Logo />
          <span className="rounded bg-accent-soft px-2 py-0.5 text-xs font-bold text-accent">
            Admin
          </span>
        </div>
        {sidebar}
        <div className="mt-6 border-t border-border pt-4">
          <p className="truncate px-3 text-xs text-muted">{email}</p>
          <p className="mb-2 px-3 text-[10px] uppercase tracking-wide text-muted">
            {mode === "demo" ? "Demo auth" : "Supabase auth"}
          </p>
          <form action={adminLogoutAction}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-muted hover:text-foreground"
            >
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            aria-label="Open admin menu"
            onClick={() => setOpen(true)}
            className="rounded-lg p-2 hover:bg-surface-muted"
          >
            <Menu size={22} />
          </button>
          <span className="font-semibold">CredoBuy Admin</span>
        </div>

        <div className="p-4 sm:p-6">{children}</div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-surface p-4">
            <div className="mb-4 flex items-center justify-between">
              <Logo />
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="rounded-lg p-2 hover:bg-surface-muted"
              >
                <X size={20} />
              </button>
            </div>
            {sidebar}
            <form action={adminLogoutAction} className="mt-4">
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:bg-surface-muted"
              >
                <LogOut size={16} /> Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
