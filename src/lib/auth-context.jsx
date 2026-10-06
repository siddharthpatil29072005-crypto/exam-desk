"use client";

import { createContext, useContext } from "react";
import { SessionProvider, useSession } from "next-auth/react";

export function AuthProvider({ children }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function useAuth() {
  const { data: session, status } = useSession();
  
  const user = session?.user ? {
    uid: session.user.id || session.user.email,
    email: session.user.email,
    role: session.user.role
  } : null;

  return { user, loading: status === "loading" };
}