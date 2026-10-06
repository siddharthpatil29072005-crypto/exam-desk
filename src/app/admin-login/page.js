"use client";

import { ArrowRight, KeyRound, Mail, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useToast } from "@/components/ToastProvider";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const notify = useToast();
  
  const [mode, setMode] = useState("login"); // "login" or "signup"
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminPin, setAdminPin] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/admin");
    }
  }, [status, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim(),
        password: password,
        mode: mode,
        role: "admin",
        adminPin: adminPin
      });

      if (result?.error) {
        setError(result.error);
      } else {
        notify(mode === "signup" ? "Admin account created successfully!" : "Admin access granted.", "success");
        router.push("/admin");
      }
    } catch (e) {
      setError("Unable to authenticate.");
    } finally {
      setSubmitting(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-900 p-4 sm:p-8">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-700 bg-slate-800 shadow-2xl p-6 sm:p-8">
        
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-900/50 text-blue-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            {isSignup ? "Authorize a new administrative account." : "Restricted portal access."}
          </p>
        </div>

        <form className="grid gap-5" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded border border-red-900/50 bg-red-900/20 p-3 text-sm font-medium text-red-400">
              {error}
            </div>
          )}

          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-slate-300" htmlFor="email">Admin Email</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail aria-hidden="true" className="h-5 w-5 text-slate-500" />
              </div>
              <input
                className="block w-full rounded border border-slate-600 bg-slate-900 py-2.5 pl-10 pr-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                type="email"
                value={email}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-slate-300" htmlFor="password">Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound aria-hidden="true" className="h-5 w-5 text-slate-500" />
              </div>
              <input
                className="block w-full rounded border border-slate-600 bg-slate-900 py-2.5 pl-10 pr-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                type="password"
                value={password}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <label className="text-sm font-medium text-slate-300" htmlFor="adminPin">Secret Admin PIN</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <ShieldAlert aria-hidden="true" className="h-5 w-5 text-slate-500" />
              </div>
              <input
                className="block w-full rounded border border-slate-600 bg-slate-900 py-2.5 pl-10 pr-3 text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
                id="adminPin"
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Required for authentication"
                required
                type="password"
                value={adminPin}
              />
            </div>
          </div>

          <button
            className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Authenticating..." : isSignup ? "Create Admin" : "Access Portal"}
            {!submitting && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          {isSignup ? "Already an admin? " : "New administrator? "}
          <button
            className="font-semibold text-blue-400 hover:text-blue-300 hover:underline focus:outline-none"
            onClick={() => { setMode(isSignup ? "login" : "signup"); setError(""); }}
            type="button"
          >
            {isSignup ? "Sign in" : "Create account"}
          </button>
        </div>
      </div>
    </main>
  );
}
