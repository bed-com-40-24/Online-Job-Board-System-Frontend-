"use client";

import { useRouter } from "next/navigation";
import { logoutAdmin } from "@/app/actions/auth";
import { useStore } from "@/lib/store";

export default function AdminLogoutButton() {
  const router = useRouter();
  const { logout } = useStore();

  async function signOut() {
    await logoutAdmin();
    logout();
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <button className="admin-dashboard-signout" type="button" onClick={signOut}>
      Sign out
    </button>
  );
}
