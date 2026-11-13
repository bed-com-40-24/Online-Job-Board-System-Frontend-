import AdminAuthForm from "@/app/components/admin-auth-form";

export default async function AdminResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;

  return <AdminAuthForm mode="reset" token={token} />;
}
