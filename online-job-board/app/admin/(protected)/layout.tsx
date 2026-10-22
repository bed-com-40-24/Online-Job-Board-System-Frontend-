import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin-session";

export default async function ProtectedAdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return children;
}
