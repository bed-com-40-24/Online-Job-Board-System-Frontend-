import { getAdminSession } from "@/lib/admin-session";
import { redirect } from "next/navigation";
import { StoreProvider } from "@/lib/store";

export default async function ProtectedAdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const admin = await getAdminSession();
  if (!admin) redirect("/admin/login");

  return <StoreProvider initialRole="admin">{children}</StoreProvider>;
}
