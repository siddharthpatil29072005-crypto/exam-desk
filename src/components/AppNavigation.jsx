"use client";

import { BookOpenCheck, LayoutDashboard, LogOut, Shield, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { signOut } from "next-auth/react";
import { useToast } from "@/components/ToastProvider";

const links = [
  { href: "/", label: "Practice", icon: BookOpenCheck },
  { href: "/full-tests", label: "Full tests", icon: BookOpenCheck },
  { href: "/notes", label: "Notes", icon: BookOpenCheck },
  { href: "/dashboard", label: "My results", icon: LayoutDashboard },
  { href: "/admin", label: "Admin", icon: Shield },
];

export default function AppNavigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const notify = useToast();

  async function handleSignOut() {
    try {
      await signOut({ redirect: false });
      notify("You have been signed out.", "success");
      router.push("/");
    } catch (error) {
      notify("Unable to sign out.", "error");
    }
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link className="flex shrink-0 items-center gap-2 font-semibold text-slate-950" href="/">
          <span className="grid h-9 w-9 place-items-center bg-blue-700 text-white">
            <BookOpenCheck aria-hidden="true" className="h-5 w-5" />
          </span>
          <span>Exam Desk</span>
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                aria-current={active ? "page" : undefined}
                className={`flex min-h-10 items-center gap-2 px-3 text-sm font-medium transition-colors ${
                  active ? "bg-slate-100 text-blue-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
                href={href}
                key={href}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
          {user ? (
            <button
              aria-label="Sign out"
              className="ml-1 grid h-10 w-10 place-items-center text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              onClick={handleSignOut}
              title="Sign out"
              type="button"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : (
            <Link
              className="ml-1 flex min-h-10 items-center gap-2 bg-slate-950 px-3 text-sm font-semibold text-white hover:bg-slate-800"
              href="/login"
            >
              <UserRound aria-hidden="true" className="h-4 w-4" />
              <span className="hidden sm:inline">Log in</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}