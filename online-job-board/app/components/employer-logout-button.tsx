"use client";

import { useState } from "react";

export default function EmployerLogoutButton() {
  const [error, setError] = useState("");

  function signOut() {
    setError("Sign out will be available after backend integration is set up.");
  }

  return (
    <>
      <button className="employer-dashboard-signout" type="button" onClick={signOut}>
        Sign out
      </button>
      {error && <span className="admin-dashboard-error" role="alert">{error}</span>}
    </>
  );
}