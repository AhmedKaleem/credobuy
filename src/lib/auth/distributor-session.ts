import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/config";

export type DistributorSession = {
  userId: string;
  email: string;
  distributorId: string;
  distributorName: string;
};

export async function getDistributorSession(): Promise<DistributorSession | null> {
  if (!isSupabaseConfigured()) return null;
  const sb = await createClient();
  if (!sb) return null;

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user?.email) return null;

  const { data: profile } = await sb
    .from("users")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "distributor") return null;

  const { data: dist } = await sb
    .from("distributors")
    .select("id, name, is_active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!dist?.id || dist.is_active === false) return null;

  return {
    userId: user.id,
    email: user.email,
    distributorId: String(dist.id),
    distributorName: String(dist.name),
  };
}

export async function requireDistributor(): Promise<DistributorSession> {
  const session = await getDistributorSession();
  if (!session) throw new Error("Unauthorized");
  return session;
}
