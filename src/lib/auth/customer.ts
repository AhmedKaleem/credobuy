import type { UserProfile } from "@/types";

export function profileFromAuth(
  user: { id: string; email?: string | null; created_at?: string; user_metadata?: Record<string, unknown> },
  row?: { full_name?: string | null; phone?: string | null; avatar_url?: string | null; created_at?: string | null } | null
): UserProfile {
  const metaName = user.user_metadata?.full_name;
  return {
    id: user.id,
    email: user.email ?? "",
    fullName:
      (row?.full_name && String(row.full_name)) ||
      (typeof metaName === "string" && metaName) ||
      (user.email ?? "Customer").split("@")[0],
    phone: row?.phone ? String(row.phone) : undefined,
    avatarUrl: row?.avatar_url ? String(row.avatar_url) : undefined,
    createdAt: String(row?.created_at ?? user.created_at ?? new Date().toISOString()),
  };
}
