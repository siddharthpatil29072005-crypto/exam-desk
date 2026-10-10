import Link from "next/link";
import { BookOpenCheck, ShieldCheck, Mail, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-200 bg-slate-50 text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand & Mission */}
          <div className="md:col-span-1">
            <Link className="flex items-center gap-2 font-semibold text-slate-950" href="/">
              <span className="grid h-8 w-8 place-items-center bg-blue-700 text-white">
                <BookOpenCheck aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="text-lg">Exam Desk</span>
            </Link>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Exam Desk provides timed mock tests, practice drills, and structured study notes to help students prepare for competitive and certification exams.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Free, open & exam-focused</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Platform</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link className="text-slate-600 transition hover:text-blue-700" href="/">
                  Practice Tests
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 transition hover:text-blue-700" href="/full-tests">
                  Full Mock Tests
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 transition hover:text-blue-700" href="/notes">
                  Study Notes & Guides
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 transition hover:text-blue-700" href="/dashboard">
                  Student Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Information</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link className="text-slate-600 transition hover:text-blue-700" href="/about">
                  About Us
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 transition hover:text-blue-700" href="/contact">
                  Contact & Support
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 transition hover:text-blue-700" href="/disclaimer">
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal / Compliance */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Legal & Privacy</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link className="text-slate-600 transition hover:text-blue-700" href="/privacy-policy">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link className="text-slate-600 transition hover:text-blue-700" href="/terms">
                  Terms of Service
                </Link>
              </li>
              <li className="pt-2 text-xs text-slate-400">
                We respect your privacy and adhere to standard Google publisher and cookie compliance guidelines.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-200 pt-8 text-xs text-slate-500 sm:flex-row">
          <p>© {currentYear} Exam Desk. All rights reserved.</p>
          <p className="mt-4 flex items-center gap-1 sm:mt-0">
            Dedicated to empowering student learning everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}
