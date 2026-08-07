import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin-session";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = {
  title: "Admin Login",
  robots: { index: false },
};

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");
  return <AdminLoginForm />;
}
