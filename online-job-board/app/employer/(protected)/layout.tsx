import { redirect } from "next/navigation";
import { getEmployerSession } from "@/lib/employer-session";
import { StoreProvider } from "@/lib/store";

export default async function ProtectedEmployerLayout({
  children,
}: LayoutProps<"/employer">) {
  const employer = await getEmployerSession();
  if (!employer) redirect("/employer/login");

  return <StoreProvider initialRole="employer">{children}</StoreProvider>;
}
