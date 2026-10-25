"use client";

import { useRouter } from "next/navigation";

export default function AdminLogoutButton() {
  const router = useRouter();

  function signOut() {
    document.cookie = "admin_session=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button className="admin-dashboard-signout" type="button" onClick={signOut}>
      Sign out
    </button>
  );
}
