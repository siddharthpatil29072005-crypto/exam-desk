"use client";

import { ArrowRight, KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useToast } from "@/components/ToastProvider";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const notify = useToast();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        password: password
      });

      if (result?.error) {
        setError(result.error);
      } else {
        notify("Welcome back.", "success");
        router.push("/dashboard");
      }
    } catch (e) {
      setError("Unable to authenticate.");
    } finally {
      setSubmitting(false);
    }
  }

  const isSignup = mode === "signup";

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-start gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-center lg:py-16">
      <section className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">Account</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">Keep your progress in view.</h1>
        <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
          Sign in to see your past scores across practice sessions. You can still take tests as a guest.
        </p>
        <Link className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-800 hover:text-blue-950" href="/">
          Browse tests <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </section>

      <section className="w-full border border-slate-200 bg-white p-5 sm:p-7">
        <div className="mb-6 flex border-b border-slate-200">
          <button
            aria-pressed={!isSignup}
            className={`min-h-11 border-b-2 px-3 text-sm font-semibold ${!isSignup ? "border-blue-700 text-blue-800" : "border-transparent text-slate-500"}`}
            onClick={() => { setMode("login"); setError(""); }}
            type="button"
          >Log in</button>
          <button
            aria-pressed={isSignup}
            className={`min-h-11 border-b-2 px-3 text-sm font-semibold ${isSignup ? "border-blue-700 text-blue-800" : "border-transparent text-slate-500"}`}
            onClick={() => { setMode("signup"); setError(""); }}
            type="button"
          >Create account</button>
        </div>

        <form className="grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Email address
            <span className="relative">
              <Mail aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                autoComplete="email"
                className="h-11 w-full border border-slate-300 pl-10 pr-3 text-slate-950"
                onChange={(event) => setEmail(event.target.value)}
                required
                type="email"
                value={email}
              />
            </span>
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Password
            <span className="relative">
              <KeyRound aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                autoComplete={isSignup ? "new-password" : "current-password"}
                className="h-11 w-full border border-slate-300 pl-10 pr-3 text-slate-950"
                minLength={6}
                onChange={(event) => setPassword(event.target.value)}
                required
                type="password"
                value={password}
              />
            </span>
          </label>
          {error && <p className="border-l-2 border-red-600 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{error}</p>}
          <button
             className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
             disabled={submitting}
             type="submit"
           >{submitting ? "Please wait..." : isSignup ? "Create account" : "Log in"}</button>
        </form>
      </section>
    </main>
  );
}