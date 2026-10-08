"use client";

import { ArrowRight, ClipboardList, Trophy } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useResults } from "@/lib/useResults";
import LoadingState from "@/components/LoadingState";
import SetupNotice from "@/components/SetupNotice";

function formatSubmittedDate(value) {
  const date = value?.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { results, loading, error } = useResults(user?.uid);

  if (authLoading || (user && loading)) return <LoadingState label="Loading your history" />;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">Your account</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Test history</h1>
          {user && <p className="mt-2 text-sm text-slate-600">Signed in as {user.email}</p>}
        </div>
        <Link className="inline-flex min-h-10 items-center gap-2 self-start text-sm font-semibold text-blue-800 hover:text-blue-950 sm:self-auto" href="/">
          Browse tests <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>

      {!user ? (
        <section className="max-w-xl py-10">
          <div className="flex gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center bg-blue-50 text-blue-800"><ClipboardList aria-hidden="true" className="h-5 w-5" /></span>
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Sign in to see saved scores</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Guest results are shown immediately after a test, but only signed-in results appear here.</p>
              <Link className="mt-4 inline-flex min-h-10 items-center gap-2 bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800" href="/login">Log in with Email <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>
      ) : error ? (
        <div className="mt-6"><SetupNotice /></div>
      ) : results.length === 0 ? (
        <section className="py-12 text-center">
          <Trophy aria-hidden="true" className="mx-auto h-8 w-8 text-slate-400" />
          <h2 className="mt-3 text-lg font-semibold text-slate-950">No saved tests yet</h2>
          <p className="mt-1 text-sm text-slate-600">Your completed tests will appear here.</p>
          <Link className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-blue-800" href="/">Find a test <ArrowRight aria-hidden="true" className="h-4 w-4" /></Link>
        </section>
      ) : (
        <>
          <div className="mt-6 hidden overflow-x-auto border border-slate-200 bg-white md:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3 font-semibold">Test</th><th className="px-4 py-3 font-semibold">Date</th><th className="px-4 py-3 font-semibold">Score</th><th className="px-4 py-3 font-semibold">Correct</th><th className="px-4 py-3 font-semibold">Result</th><th className="px-4 py-3 font-semibold">Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {results.map((result) => <tr key={result.id}>
                  <td className="px-4 py-4 font-medium text-slate-950">{result.testTitle}</td>
                  <td className="px-4 py-4 text-slate-600">{formatSubmittedDate(result.submittedAt)}</td>
                  <td className="px-4 py-4 font-semibold tabular-nums text-slate-950">{result.score}/{result.totalMarks}</td>
                  <td className="px-4 py-4 tabular-nums text-slate-600">{result.correctAnswers}/{result.totalQuestions}</td>
                  <td className="px-4 py-4"><span className="font-semibold text-blue-800">{result.percentage}%</span></td>
                  <td className="px-4 py-4">
                    <Link
                      className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:text-blue-900"
                      href={`/test?id=${encodeURIComponent(result.testId)}`}
                    >
                      View Review <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <div className="mt-6 divide-y divide-slate-200 md:hidden">
            {results.map((result) => <article className="py-4" key={result.id}>
              <div className="flex items-start justify-between gap-3"><h2 className="font-semibold text-slate-950">{result.testTitle}</h2><span className="shrink-0 font-semibold text-blue-800">{result.percentage}%</span></div>
              <p className="mt-1 text-xs text-slate-500">{formatSubmittedDate(result.submittedAt)}</p>
              <p className="mt-3 text-sm text-slate-700">Score {result.score}/{result.totalMarks} · {result.correctAnswers}/{result.totalQuestions} correct</p>
              <Link
                className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-900"
                href={`/test?id=${encodeURIComponent(result.testId)}`}
              >
                View result & answers <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            </article>)}
          </div>
        </>
      )}
    </main>
  );
}