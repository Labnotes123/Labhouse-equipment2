"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: Toast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);
      const duration = toast.duration ?? 4000;
      setTimeout(() => removeToast(id), duration);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, message?: string) => showToast({ type: "success", title, message }),
    [showToast]
  );
  const error = useCallback(
    (title: string, message?: string) => showToast({ type: "error", title, message }),
    [showToast]
  );
  const warning = useCallback(
    (title: string, message?: string) => showToast({ type: "warning", title, message }),
    [showToast]
  );
  const info = useCallback(
    (title: string, message?: string) => showToast({ type: "info", title, message }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const toastConfig: Record<
  ToastType,
  { icon: React.ReactNode; bg: string; border: string; iconColor: string; titleColor: string }
> = {
  success: {
    icon: <CheckCircle size={20} />,
    bg: "bg-white",
    border: "border-l-4 border-emerald-500",
    iconColor: "text-emerald-500",
    titleColor: "text-emerald-700",
  },
  error: {
    icon: <XCircle size={20} />,
    bg: "bg-white",
    border: "border-l-4 border-red-500",
    iconColor: "text-red-500",
    titleColor: "text-red-700",
  },
  warning: {
    icon: <AlertTriangle size={20} />,
    bg: "bg-white",
    border: "border-l-4 border-amber-500",
    iconColor: "text-amber-500",
    titleColor: "text-amber-700",
  },
  info: {
    icon: <Info size={20} />,
    bg: "bg-white",
    border: "border-l-4 border-blue-500",
    iconColor: "text-blue-500",
    titleColor: "text-blue-700",
  },
};

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[];
  removeToast: (id: string) => void;
}) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const config = toastConfig[toast.type];
        return (
          <div
            key={toast.id}
            className={`toast-enter pointer-events-auto ${config.bg} ${config.border} rounded-xl shadow-2xl p-4 flex items-start gap-3`}
            style={{ minWidth: 300 }}
          >
            <span className={`${config.iconColor} mt-0.5 flex-shrink-0`}>{config.icon}</span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${config.titleColor}`}>{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
