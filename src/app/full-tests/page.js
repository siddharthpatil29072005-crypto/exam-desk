"use client";

import { ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import LoadingState from "@/components/LoadingState";
import SetupNotice from "@/components/SetupNotice";
import { useCollection } from "@/lib/useCollection";

function formatDateTime(value) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default function FullTestsPage() {
  const exams = useCollection("exams");
  const tests = useCollection("tests");
  const { items: myResults } = useCollection("results");
  const [examId, setExamId] = useState("");

  const filteredTests = useMemo(() => tests.items.filter((test) => {
    const isFullTest = !test.subjectId && !test.topicId;
    return isFullTest && (!examId || test.examId === examId);
  }), [tests.items, examId]);

  const loading = exams.loading || tests.loading;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <section className="grid gap-8 border-b border-slate-200 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">Full mock tests</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Exam-wide practice tests.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Pick an exam to view full mock tests designed for complete paper practice without subject or topic filtering.
          </p>
        </div>
        <div className="flex items-center gap-3 border-l-2 border-blue-700 pl-4 text-sm text-slate-600">
          <FileText aria-hidden="true" className="h-5 w-5 shrink-0 text-blue-800" />
          <p><span className="block font-semibold text-slate-950">Full paper mode</span>Exam-based revisions</p>
        </div>
      </section>

      <section className="pt-8">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Mock test library</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">Browse full tests</h2>
        </div>

        <div className="mb-6 max-w-md">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Exam
            <select
              className="h-11 w-full border border-slate-300 bg-white px-3 text-slate-950"
              onChange={(event) => setExamId(event.target.value)}
              value={examId}
            >
              <option value="">All exams</option>
              {exams.items.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
            </select>
          </label>
        </div>

        {loading ? (
          <LoadingState label="Loading full tests" />
        ) : exams.error || tests.error ? (
          <div className="mt-6"><SetupNotice /></div>
        ) : filteredTests.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm font-semibold text-slate-800">No full mock tests available for this exam yet.</p>
            <p className="mt-2 text-sm text-slate-500">Try another exam or ask an admin to publish a full mock test.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200 border-t border-slate-200">
                        {filteredTests.map((test) => {
              const exam = exams.items.find((item) => item.id === test.examId);
              const isCompleted = myResults.some((r) => r.testId === test.id);
              const now = new Date();
              const isUpcoming = test.startTime && new Date(test.startTime) > now;
              const isExpired = test.endTime && new Date(test.endTime) < now;
              const isLive = !isUpcoming && !isExpired;

              return (
                <article className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between" key={test.id}>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      {exam?.name || "Exam"}
                      {isUpcoming && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">Upcoming</span>}
                      {isExpired && !isCompleted && <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-red-800">Expired</span>}
                      {isLive && !isCompleted && <span className="ml-2 rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800">Live</span>}
                      {isCompleted && <span className="ml-2 rounded bg-blue-100 px-1.5 py-0.5 text-blue-800">Completed</span>}
                    </p>
                    <h3 className="mt-1 wrap-break-word text-lg font-semibold text-slate-950">{test.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {test.questions?.length || 0} questions • {test.durationMinutes || "No"} min • +{test.marksPerQuestion || 1} / -{test.negativeMarkingPerWrongAnswer || 0} per wrong attempt
                    </p>
                    {test.startTime && <p className="mt-1 text-xs text-slate-600">📅 <span className="font-medium">Available from:</span> {formatDateTime(test.startTime)}</p>}
                    {test.endTime && <p className="mt-1 text-xs text-slate-600">⏰ <span className="font-medium">Ends at:</span> {formatDateTime(test.endTime)}</p>}
                  </div>
                  
                  {isCompleted ? (
                    <Link
                      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                      href={`/test?id=${encodeURIComponent(test.id)}`}
                    >
                      View Result <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  ) : isUpcoming ? (
                    <button disabled className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-slate-200 px-4 text-sm font-semibold text-slate-500 cursor-not-allowed">
                      Starts Later
                    </button>
                  ) : isExpired ? (
                    <button disabled className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-red-100 px-4 text-sm font-semibold text-red-700 cursor-not-allowed">
                      Missed
                    </button>
                  ) : (
                    <Link
                      className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
                      href={`/test?id=${encodeURIComponent(test.id)}`}
                    >
                      Start now <ArrowRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

