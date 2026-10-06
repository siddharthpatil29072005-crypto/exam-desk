"use client";

import { ArrowRight, KeyRound, Mail, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const notify = useToast();
  
  const [role, setRole] = useState("user"); // "user" or "admin"
  const [mode, setMode] = useState("login"); // "login" or "signup"
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminPin, setAdminPin] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
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
        role: role,
        adminPin: role === "admin" && mode === "signup" ? adminPin : undefined
      });

      if (result?.error) {
        setError(result.error);
      } else {
        notify(mode === "signup" ? "Account created successfully!" : "Welcome back.", "success");
        router.push("/dashboard");
      }
    } catch (e) {
      setError("Unable to authenticate.");
    } finally {
      setSubmitting(false);
    }
  }

  const isSignup = mode === "signup";
  const isAdmin = role === "admin";

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 p-4 sm:p-8">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        
        {/* Role Selector Tabs */}
        <div className="flex border-b border-slate-200">
          <button 
            type="button"
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${!isAdmin ? 'bg-white text-blue-700 border-b-2 border-blue-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
            onClick={() => { setRole("user"); setError(""); }}
          >
            Student Login
          </button>
          <button 
            type="button"
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${isAdmin ? 'bg-white text-blue-700 border-b-2 border-blue-700' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
            onClick={() => { setRole("admin"); setError(""); }}
          >
            Admin Portal
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              {isAdmin ? "Admin Portal" : "Student Portal"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              {isSignup ? "Create a new account to get started." : "Sign in to access your account."}
            </p>
          </div>

          <form className="grid gap-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
                {error}
              </div>
            )}

            <div className="grid gap-1.5">
              <label className="text-sm font-medium text-slate-700" htmlFor="email">Email address</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail aria-hidden="true" className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  className="block w-full rounded border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-slate-950 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
                  id="email"
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={email}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">Password</label>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound aria-hidden="true" className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  className="block w-full rounded border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-slate-950 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  type="password"
                  value={password}
                />
              </div>
            </div>

            {isAdmin && isSignup && (
              <div className="grid gap-1.5">
                <label className="text-sm font-medium text-slate-700" htmlFor="adminPin">Admin Access PIN</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <ShieldAlert aria-hidden="true" className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    className="block w-full rounded border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-slate-950 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600 sm:text-sm"
                    id="adminPin"
                    onChange={(e) => setAdminPin(e.target.value)}
                    placeholder="Enter secret PIN to authorize admin creation"
                    required
                    type="password"
                    value={adminPin}
                  />
                </div>
              </div>
            )}

            <button
              className="mt-2 flex w-full items-center justify-center gap-2 rounded bg-blue-700 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-70"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
              {!submitting && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-600">
            {isSignup ? "Already have an account? " : "Don't have an account? "}
            <button
              className="font-semibold text-blue-700 hover:text-blue-800 hover:underline focus:outline-none"
              onClick={() => { setMode(isSignup ? "login" : "signup"); setError(""); }}
              type="button"
            >
              {isSignup ? "Sign in instead" : "Create one now"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}