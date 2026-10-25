import { getAdminSession } from "@/lib/admin-session";

export default async function ProtectedAdminLayout({
  children,
}: LayoutProps<"/admin">) {
  await getAdminSession();

  return children;
}
