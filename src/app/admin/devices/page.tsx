import { Plus } from "lucide-react";
import { PageHeader, Card, Table } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { SmartImage } from "@/components/ui/SmartImage";
import { getDeviceBrands, getDeviceModels } from "@/lib/queries";

export const metadata = { title: "Device Management", robots: { index: false } };

export default async function AdminDevicesPage() {
  const [brands, deviceModels] = await Promise.all([
    getDeviceBrands(),
    getDeviceModels(),
  ]);

  return (
    <div>
      <PageHeader
        title="Device Brands & Models"
        description="Manage the phone catalogue that powers Shop by Device."
        action={
          <Button>
            <Plus size={16} /> Add model
          </Button>
        }
      />

      <div className="space-y-4">
        {brands.map((b) => {
          const models = deviceModels.filter((m) => m.deviceBrandId === b.id);
          return (
            <Card key={b.id} title={`${b.name} (${models.length} models)`}>
              <Table head={["Model", "Slug", "Release year"]}>
                {models.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="h-10 w-10 overflow-hidden rounded-lg border border-border">
                          <SmartImage src={m.imageUrl} alt={m.name} />
                        </span>
                        <span className="font-medium">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted">{m.slug}</td>
                    <td className="px-4 py-3">{m.releaseYear}</td>
                  </tr>
                ))}
              </Table>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
