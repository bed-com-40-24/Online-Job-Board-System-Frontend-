"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setError("");
    setPending(true);
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) {
        setError("Unable to sign out. Please try again.");
        return;
      }
      router.replace("/admin/login");
      router.refresh();
    } catch {
      setError("Unable to sign out. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button className="admin-dashboard-signout" type="button" onClick={signOut} disabled={pending}>
        {pending ? "Signing out..." : "Sign out"}
      </button>
      {error && <span className="admin-dashboard-error" role="alert">{error}</span>}
    </>
  );
}
