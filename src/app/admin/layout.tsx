import { AdminShell } from "@/components/admin/AdminShell";
import { getAdminSession } from "@/lib/auth/admin-session";

/**
 * If there's no admin session, middleware only allows /admin/login through —
 * so we render the login page bare. Authenticated admin routes get the shell.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    return <>{children}</>;
  }

  return (
    <AdminShell email={session.email} mode={session.mode}>
      {children}
    </AdminShell>
  );
}
