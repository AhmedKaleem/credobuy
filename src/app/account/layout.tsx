"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LogOut,
  MapPin,
  Package,
  User as UserIcon,
} from "lucide-react";
import { Container, Skeleton } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/store/auth";
import { useMounted } from "@/hooks/useMounted";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/account", label: "Profile", icon: UserIcon },
  { href: "/account/orders", label: "My Orders", icon: Package },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const mounted = useMounted();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);

  if (!mounted) {
    return (
      <Container className="py-6">
        <Skeleton className="h-96" />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-10">
        <EmptyState
          icon={UserIcon}
          title="Please sign in"
          description="Sign in to view your profile, orders, addresses and wishlist."
          actionLabel="Sign in"
          actionHref={`/login?redirect=${encodeURIComponent(pathname)}`}
        />
      </Container>
    );
  }

  return (
    <Container className="py-6">
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="lg:sticky lg:top-36 lg:self-start">
          <div className="rounded-[var(--radius-card)] border border-border bg-surface p-4">
            <div className="flex items-center gap-3 border-b border-border pb-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft font-bold text-primary">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold capitalize">{user.fullName}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <nav className="mt-3 space-y-1">
              {nav.map((item) => {
                const active =
                  pathname === item.href ||
                  (item.href !== "/account" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary-soft text-primary"
                        : "text-muted hover:bg-surface-muted hover:text-foreground"
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={logout}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-red-50 hover:text-danger"
              >
                <LogOut size={18} />
                Sign out
              </button>
            </nav>
          </div>
        </aside>
        <div>{children}</div>
      </div>
    </Container>
  );
}
