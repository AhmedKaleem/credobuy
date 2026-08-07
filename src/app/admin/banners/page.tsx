import { PageHeader } from "@/components/admin/ui";
import { BannerManager } from "@/components/admin/BannerManager";
import { fetchAdminBanners } from "@/lib/admin/actions";
import { isSupabaseConfigured } from "@/lib/config";

export const metadata = { title: "Banner Management", robots: { index: false } };

export default async function AdminBannersPage() {
  const banners = await fetchAdminBanners();

  return (
    <div>
      <PageHeader
        title="Banners"
        description={
          isSupabaseConfigured()
            ? "Hero banners stored in Supabase."
            : "Hero banners (demo mode — changes keep until server restart)."
        }
      />
      <BannerManager banners={banners} />
    </div>
  );
}
