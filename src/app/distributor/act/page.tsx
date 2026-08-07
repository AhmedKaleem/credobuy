import Link from "next/link";
import { runFulfillmentActionByCode } from "@/lib/fulfillment/system-actions";
import type { ActionKind } from "@/lib/fulfillment/tokens";

export const metadata = {
  title: "Assignment action",
  robots: { index: false },
};

export default async function DistributorActPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; action?: string }>;
}) {
  const { code, action: rawAction } = await searchParams;
  const action =
    rawAction === "accept" || rawAction === "reject"
      ? (rawAction as ActionKind)
      : null;

  if (!code || !action) {
    return (
      <Shell>
        <h1 className="text-xl font-bold">Invalid link</h1>
        <p className="mt-2 text-sm text-muted">
          This action link is missing parameters. Use the buttons in WhatsApp
          or open your distributor portal.
        </p>
        <PortalLink />
      </Shell>
    );
  }

  const result = await runFulfillmentActionByCode(code, action);

  if (!result.ok) {
    return (
      <Shell>
        <h1 className="text-xl font-bold">Could not complete</h1>
        <p className="mt-2 text-sm text-danger">{result.error}</p>
        <PortalLink />
      </Shell>
    );
  }

  const accepted = result.action === "accept";

  return (
    <Shell>
      <h1 className="text-xl font-bold">
        {accepted ? "Assignment accepted" : "Assignment rejected"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {accepted
          ? "Stock is committed. Please pack and ship this order."
          : "Your reserve was released. CredoBuy will route this to another partner. Customer price stays locked."}
      </p>
      <PortalLink />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f3f1ec] px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wide text-primary">
          CredoBuy Partner
        </p>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function PortalLink() {
  return (
    <Link
      href="/distributor"
      className="mt-5 inline-block text-sm font-semibold text-primary hover:underline"
    >
      Open distributor portal →
    </Link>
  );
}
