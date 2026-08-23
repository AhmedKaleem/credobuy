import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { distributorLogoutAction } from "@/lib/auth/actions";
import { getDistributorSession } from "@/lib/auth/distributor-session";

export default async function DistributorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getDistributorSession();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[100dvh] bg-[#f3f1ec]">
      <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-3 py-3 sm:px-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <Logo />
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-primary sm:text-xs">
                Distributor
              </p>
              <p className="truncate text-sm font-semibold">
                {session.distributorName}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
            <Link
              href="/distributor"
              className="hidden text-muted hover:text-foreground sm:inline"
            >
              Assignments
            </Link>
            <form action={distributorLogoutAction}>
              <button
                type="submit"
                className="min-h-10 rounded-lg border border-border px-3 py-2 text-sm touch-manipulation hover:bg-surface-muted"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-3 py-5 pb-10 sm:px-4 sm:py-6">
        {children}
      </main>
    </div>
  );
}
