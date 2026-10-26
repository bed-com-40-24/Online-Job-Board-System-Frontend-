"use client";

import { useRouter } from "next/navigation";

export default function EmployerLogoutButton() {
  const router = useRouter();

  function signOut() {
    document.cookie = "employer_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
    router.push("/employer/login");
    router.refresh();
  }

  return (
    <button className="employer-dashboard-signout" type="button" onClick={signOut}>
      Sign out
    </button>
  );
}