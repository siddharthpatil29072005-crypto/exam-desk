"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem("cookie_consent");
      if (!consent) {
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Ignore localStorage errors in private mode
    }
  }, []);

  function handleAccept() {
    try {
      localStorage.setItem("cookie_consent", "accepted");
    } catch (e) {}
    setIsVisible(false);
  }

  function handleDecline() {
    try {
      localStorage.setItem("cookie_consent", "declined");
    } catch (e) {}
    setIsVisible(false);
  }

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent banner"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-300 bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:p-5"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3 text-sm text-slate-700">
          <Cookie aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" />
          <p>
            We use cookies to analyze site traffic, personalize content, and support advertisements served by Google. By clicking &ldquo;Accept&rdquo;, you agree to the use of cookies as described in our{" "}
            <Link className="font-semibold text-blue-700 underline hover:text-blue-900" href="/privacy-policy">
              Privacy Policy
            </Link>.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            className="rounded border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            onClick={handleDecline}
            type="button"
          >
            Decline Non-Essential
          </button>
          <button
            className="rounded bg-blue-700 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-800"
            onClick={handleAccept}
            type="button"
          >
            Accept All
          </button>
        </div>
      </div>
    </aside>
  );
}
