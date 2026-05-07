"use client";

import { createContext, useCallback, useContext, useState } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  push: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ProductToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev.filter((_, i) => i >= prev.length - 2), { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div
        className="pointer-events-none fixed right-4 top-4 z-[10000] flex max-w-[420px] flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className={`pointer-events-auto product-toast w-full cursor-pointer text-left ${
              t.variant === "success"
                ? "product-toast--success"
                : t.variant === "error"
                  ? "product-toast--error"
                  : t.variant === "warning"
                    ? "product-toast--warning"
                    : ""
            }`}
          >
            {t.message}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useProductToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { push: () => {} };
  }
  return ctx;
}
