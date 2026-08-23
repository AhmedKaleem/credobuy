import { Plus } from "lucide-react";
import { PageHeader, Card, Table } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { AutoApprovalToggle } from "@/components/admin/AutoApprovalToggle";
import { getDistributors } from "@/lib/queries";

export const metadata = { title: "Distributor Management", robots: { index: false } };

export default async function AdminDistributorsPage() {
  const distributors = await getDistributors();

  return (
    <div>
      <PageHeader
        title="Distributors"
        description="Suppliers and distribution partners. Auto Approval accepts offers without a portal tap."
        action={
          <Button>
            <Plus size={16} /> Add distributor
          </Button>
        }
      />
      <Card className="overflow-hidden">
        <Table
          head={[
            "Distributor",
            "Contact",
            "Location",
            "Products",
            "Auto Approval",
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
              <td className="px-4 py-3">{d.productCount}</td>
              <td className="px-4 py-3">
                <AutoApprovalToggle
                  distributorId={d.id}
                  enabled={Boolean(d.autoApproval)}
                />
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </div>
  );
}
