import { PageHeader, Card, Table, StatusPill } from "@/components/admin/ui";
import { CouponForm } from "@/components/admin/CouponForm";
import { listAdminCoupons } from "@/lib/admin/live";
import { getCoupons } from "@/lib/queries";
import { formatINR } from "@/lib/utils";

export const metadata = { title: "Coupon Management", robots: { index: false } };

export default async function AdminCouponsPage() {
  const live = await listAdminCoupons();
  const coupons = live.length ? live : await getCoupons();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coupons"
        description="Create and manage discount codes for deals and offers."
      />
      <CouponForm />
      <Card className="overflow-hidden">
        <Table head={["Code", "Description", "Discount", "Min order", "Status", ""]}>
          {coupons.map((c) => (
            <tr key={c.id ?? c.code}>
              <td className="px-4 py-3">
                <span className="rounded-md bg-surface-muted px-2 py-1 font-mono text-xs font-semibold">
                  {c.code}
                </span>
              </td>
              <td className="px-4 py-3 text-muted">{c.description}</td>
              <td className="px-4 py-3 font-medium">
                {c.type === "percent"
                  ? `${c.value}%${c.maxDiscount ? ` (max ${formatINR(c.maxDiscount)})` : ""}`
                  : formatINR(c.value)}
              </td>
              <td className="px-4 py-3">{formatINR(c.minOrder)}</td>
              <td className="px-4 py-3">
                <StatusPill tone={c.active ? "success" : "muted"}>
                  {c.active ? "Active" : "Off"}
                </StatusPill>
              </td>
              <td className="px-4 py-3">
                {c.id ? <CouponForm coupon={c} /> : null}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
