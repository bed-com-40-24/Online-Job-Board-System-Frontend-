"use client";

import { useState } from "react";

export default function SidebarToggle() {
  const [collapsed, setCollapsed] = useState(false);

  function toggle() {
    const sb = document.querySelector(".sidebar");
    if (!sb) return;
    const nextCollapsed = !collapsed;
    sb.classList.toggle("collapsed", nextCollapsed);
    setCollapsed(nextCollapsed);
  }

  return (
    <button
      className="sidebar-toggle"
      onClick={toggle}
      aria-pressed={collapsed}
      aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        {collapsed ? (
          <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
      </svg>
    </button>
  );
}
