import { PageHeader, Card, Table } from "@/components/admin/ui";
import { AutoApprovalToggle } from "@/components/admin/AutoApprovalToggle";
import { DistributorForm } from "@/components/admin/DistributorForm";
import { getDistributors } from "@/lib/queries";

export const metadata = { title: "Distributor Management", robots: { index: false } };

export default async function AdminDistributorsPage() {
  const distributors = await getDistributors();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Distributors"
        description="Create and update partner details. Auto Approval accepts offers without a portal tap."
      />
      <DistributorForm />
      <Card className="overflow-hidden">
        <Table
          head={[
            "Distributor",
            "Contact",
            "Location",
            "Status",
            "Auto Approval",
            "",
          ]}
        >
          {distributors.map((d) => (
            <tr key={d.id}>
              <td className="px-4 py-3 font-medium">{d.name}</td>
              <td className="px-4 py-3 text-muted">
                <p>{d.contactPerson}</p>
                <p className="text-xs">
                  {d.phone} · {d.email}
                </p>
              </td>
              <td className="px-4 py-3 text-muted">
                {d.city}, {d.state}
              </td>
              <td className="px-4 py-3 text-sm">
                {d.isActive === false ? "Inactive" : "Active"}
              </td>
              <td className="px-4 py-3">
                <AutoApprovalToggle
                  distributorId={d.id}
                  enabled={Boolean(d.autoApproval)}
                />
              </td>
              <td className="px-4 py-3">
                <DistributorForm distributor={d} />
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
