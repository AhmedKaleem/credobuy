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
    <div className="min-h-screen bg-[#f3f1ec]">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-primary">
                Distributor
              </p>
              <p className="text-sm font-semibold">{session.distributorName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/distributor" className="text-muted hover:text-foreground">
              Assignments
            </Link>
            <span className="hidden text-muted sm:inline">{session.email}</span>
            <form action={distributorLogoutAction}>
              <button
                type="submit"
                className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-surface-muted"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
