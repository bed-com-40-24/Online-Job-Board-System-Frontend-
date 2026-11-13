import EmployerAuthForm from "@/app/components/employer-auth-form";

export default async function EmployerResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === "string" ? params.token : undefined;

  return <EmployerAuthForm mode="reset" token={token} />;
}