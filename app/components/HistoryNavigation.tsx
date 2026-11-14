"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

type HistoryNavigationProps = {
  fallbackHref: string;
};

export default function HistoryNavigation({ fallbackHref }: HistoryNavigationProps) {
  const router = useRouter();

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  }

  return (
    <nav className="workspace-history-controls" aria-label="Page history">
      <button
        className="workspace-history-button"
        onClick={goBack}
        type="button"
        aria-label="Go back"
        title="Go back"
      >
        <ArrowLeft aria-hidden="true" size={18} />
      </button>
      <button
        className="workspace-history-button"
        onClick={() => router.forward()}
        type="button"
        aria-label="Go forward"
        title="Go forward"
      >
        <ArrowRight aria-hidden="true" size={18} />
      </button>
    </nav>
  );
}
