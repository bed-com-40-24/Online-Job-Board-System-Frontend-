import React, { useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";

/**
 * Issue #28 (NFR07) — Toast Notification Hook
 */
export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success", duration = 3500) => {
    setToast({ id: Date.now(), message, type });

    if (duration > 0) {
      setTimeout(() => {
        setToast((current) => (current?.message === message ? null : current));
      }, duration);
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, hideToast };
}

/**
 * Issue #28 (NFR07) — Reliable Toast Banner Component
 */
export function ToastContainer({ toast, onClose }) {
  if (!toast) return null;

  const styles = {
    success: "bg-slate-900 text-white border-emerald-500/30",
    error: "bg-rose-900 text-white border-rose-500/30",
    warning: "bg-amber-900 text-white border-amber-500/30",
    info: "bg-indigo-900 text-white border-indigo-500/30"
  };

  const icons = {
    success: <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />,
    error: <AlertCircle size={18} className="shrink-0 text-rose-400" />,
    warning: <AlertTriangle size={18} className="shrink-0 text-amber-400" />,
    info: <Info size={18} className="shrink-0 text-indigo-400" />
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-[100] flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3.5 text-sm font-medium shadow-2xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className={`flex items-center gap-3 w-full ${styles[toast.type] || styles.info}`}>
        {icons[toast.type] || icons.info}
        <span className="flex-1 leading-snug">{toast.message}</span>
        <button
          onClick={onClose}
          className="ml-2 rounded-lg p-1 text-slate-300 hover:bg-white/10 hover:text-white transition"
          title="Dismiss notification"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
