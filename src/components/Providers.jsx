"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase";
import { AuthProvider } from "@/lib/auth-context";
import { ToastProvider } from "@/components/ToastProvider";

export default function Providers({ children }) {
  useEffect(() => {
    void getFirebaseAnalytics();
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>{children}</ToastProvider>
    </AuthProvider>
  );
}