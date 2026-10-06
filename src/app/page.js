"use client";

import { ArrowRight, FileQuestion, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import FilterBar from "@/components/FilterBar";
import LoadingState from "@/components/LoadingState";
import SetupNotice from "@/components/SetupNotice";
import { useCollection } from "@/lib/useCollection";

export default function HomePage() {
  const exams = useCollection("exams");
  const subjects = useCollection("subjects");
  const topics = useCollection("topics");
  const tests = useCollection("tests");
  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [search, setSearch] = useState("");

  const filteredTests = useMemo(() => tests.items.filter((test) => {
    return (!examId || test.examId === examId) &&
      (!subjectId || test.subjectId === subjectId) &&
      (!topicId || test.topicId === topicId) &&
      (!search || test.title?.toLowerCase().includes(search.toLowerCase()));
  }), [tests.items, examId, subjectId, topicId, search]);

  function changeExam(value) {
    setExamId(value);
    setSubjectId("");
    setTopicId("");
  }

  function changeSubject(value) {
    setSubjectId(value);
    setTopicId("");
  }

  const loading = exams.loading || subjects.loading || topics.loading || tests.loading;

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <section className="grid gap-8 border-b border-slate-200 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">Exam Desk · Practice</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Prepare with purpose.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Choose an exam and start a timed mock test. Your progress stays with you when you sign in.
          </p>
        </div>
        <div className="flex items-center gap-3 border-l-2 border-blue-700 pl-4 text-sm text-slate-600">
          <FileQuestion aria-hidden="true" className="h-5 w-5 shrink-0 text-blue-800" />
          <p><span className="block font-semibold text-slate-950">Focused practice</span>Full tests and topic drills</p>
        </div>
      </section>

      <section aria-labelledby="test-list-heading" className="pt-8">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Test library</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950" id="test-list-heading">Find your next test</h2>
          </div>
          <label className="relative block w-full sm:max-w-xs">
            <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              className="h-11 w-full border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-950"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search test titles"
              type="search"
              value={search}
            />
          </label>
        </div>

        <div className="border-y border-slate-200 py-5">
          <FilterBar
            exams={exams.items}
            subjects={subjects.items}
            topics={topics.items}
            examId={examId}
            subjectId={subjectId}
            topicId={topicId}
            onExamChange={changeExam}
            onSubjectChange={changeSubject}
            onTopicChange={setTopicId}
          />
        </div>

        {loading ? (
          <LoadingState label="Loading test library" />
        ) : exams.error || tests.error ? (
          <div className="mt-6"><SetupNotice /></div>
        ) : filteredTests.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-sm font-semibold text-slate-800">No tests match these filters yet.</p>
            <p className="mt-2 text-sm text-slate-500">Clear a filter or check back when an admin publishes a test.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {filteredTests.map((test) => {
              const exam = exams.items.find((item) => item.id === test.examId);
              const subject = subjects.items.find((item) => item.id === test.subjectId);
              const topic = topics.items.find((item) => item.id === test.topicId);
              return (
                <article className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between" key={test.id}>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">
                      {[exam?.name, subject?.name, topic?.name].filter(Boolean).join(" · ")}
                    </p>
                    <h3 className="mt-1 wrap-break-word text-lg font-semibold text-slate-950">{test.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {test.questions?.length || 0} questions · {test.durationMinutes || "No"} min · +{test.marksPerQuestion || 1} / -{test.negativeMarkingPerWrongAnswer || 0} per wrong attempt
                    </p>
                  </div>
                  <Link
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
                    href={`/test/?id=${encodeURIComponent(test.id)}`}
                  >
                    Start test <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}