"use client";

import { useRouter } from "next/navigation";
import { logoutEmployer } from "@/app/actions/auth";
import { useStore } from "@/lib/store";

export default function EmployerLogoutButton() {
  const router = useRouter();
  const { logout } = useStore();

  async function signOut() {
    await logoutEmployer();
    logout();
    router.replace("/employer/login");
    router.refresh();
  }

  return (
    <button className="employer-dashboard-signout" type="button" onClick={signOut}>
      Sign out
    </button>
  );
}