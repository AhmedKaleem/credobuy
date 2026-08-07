import { redirect } from "next/navigation";
import { getDistributorSession } from "@/lib/auth/distributor-session";
import { DistributorLoginForm } from "@/components/distributor/DistributorLoginForm";

export const metadata = {
  title: "Distributor Login",
  robots: { index: false },
};

export default async function DistributorLoginPage() {
  const session = await getDistributorSession();
  if (session) redirect("/distributor");
  return <DistributorLoginForm />;
}
