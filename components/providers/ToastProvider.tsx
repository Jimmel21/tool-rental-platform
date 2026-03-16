"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 4000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const removeToast = useCallback((id: string) => {
    const t = timeoutsRef.current[id];
    if (t) clearTimeout(t);
    delete timeoutsRef.current[id];
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    const t = setTimeout(() => removeToast(id), TOAST_DURATION);
    timeoutsRef.current[id] = t;
  }, [removeToast]);

  useEffect(() => {
    const ref = timeoutsRef;
    return () => {
      Object.values(ref.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastList toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastList({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div
      className="pointer-events-none fixed bottom-20 left-0 right-0 z-[100] flex flex-col items-center gap-2 px-4 safe-area-pb md:bottom-6"
      aria-live="polite"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="alert"
          className={`pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-lg border px-4 py-3 shadow-lg ${
            t.type === "success"
              ? "border-green-200 bg-green-50 text-green-900"
              : t.type === "error"
                ? "border-red-200 bg-red-50 text-red-900"
                : "border-gray-200 bg-white text-gray-900"
          }`}
        >
          <span className="text-sm font-medium">{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            className="shrink-0 rounded p-1 opacity-70 hover:opacity-100"
            aria-label="Dismiss"
          >
            <span className="sr-only">Dismiss</span>
            <span aria-hidden>×</span>
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      toasts: [],
      addToast: () => {},
      removeToast: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return {
    ...ctx,
    success: (msg: string) => ctx.addToast(msg, "success"),
    error: (msg: string) => ctx.addToast(msg, "error"),
    info: (msg: string) => ctx.addToast(msg, "info"),
  };
}
