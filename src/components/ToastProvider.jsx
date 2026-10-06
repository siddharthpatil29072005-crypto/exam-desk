"use client";

import { CircleCheck, CircleX, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

const ToastContext = createContext(() => {});
const icons = {
  success: CircleCheck,
  error: CircleX,
  info: Info,
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const notify = useCallback((message, type = "info") => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3600);
  }, []);

  const dismiss = (id) =>
    setToasts((current) => current.filter((toast) => toast.id !== id));

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || Info;
          return (
            <div
              className="flex items-start gap-3 border border-slate-200 bg-white px-4 py-3 shadow-lg"
              key={toast.id}
              role="status"
            >
              <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
              <p className="min-w-0 flex-1 text-sm text-slate-800">{toast.message}</p>
              <button
                aria-label="Dismiss notification"
                className="text-slate-500 hover:text-slate-900"
                onClick={() => dismiss(toast.id)}
                type="button"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}