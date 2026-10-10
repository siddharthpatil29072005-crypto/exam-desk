"use client";

import { BookText, FileText, Compass } from "lucide-react";
import { useMemo, useState } from "react";
import FilterBar from "@/components/FilterBar";
import LoadingState from "@/components/LoadingState";
import SetupNotice from "@/components/SetupNotice";
import AdBanner from "@/components/AdBanner";
import { useCollection } from "@/lib/useCollection";
import { FOUNDATIONAL_STUDY_GUIDES } from "@/lib/default-notes";

export default function NotesPage() {
  const exams = useCollection("exams");
  const subjects = useCollection("subjects");
  const topics = useCollection("topics");
  const notes = useCollection("notes");
  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");

  const filteredNotes = useMemo(() => notes.items.filter((note) => {
    return (!examId || note.examId === examId) &&
      (!subjectId || note.subjectId === subjectId) &&
      (!topicId || note.topicId === topicId);
  }), [notes.items, examId, subjectId, topicId]);

  function changeExam(value) {
    setExamId(value);
    setSubjectId("");
    setTopicId("");
  }

  function changeSubject(value) {
    setSubjectId(value);
    setTopicId("");
  }

  const loading = exams.loading || subjects.loading || topics.loading || notes.loading;
  const hasFilter = Boolean(examId || subjectId || topicId);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">
      <section className="grid gap-8 border-b border-slate-200 pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">Study notes</p>
          <h1 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight text-slate-950 sm:text-4xl">
            Learn from focused notes.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            Choose an exam, subject, and topic to find the best revision notes for your study plan.
          </p>
        </div>
        <div className="flex items-center gap-3 border-l-2 border-blue-700 pl-4 text-sm text-slate-600">
          <BookText aria-hidden="true" className="h-5 w-5 shrink-0 text-blue-800" />
          <p><span className="block font-semibold text-slate-950">Revision ready</span>Quick topic summaries</p>
        </div>
      </section>

      <section aria-labelledby="notes-list-heading" className="pt-8">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Notes library</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950" id="notes-list-heading">Find relevant notes</h2>
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
          <LoadingState label="Loading notes" />
        ) : exams.error || subjects.error || topics.error || notes.error ? (
          <div className="mt-6"><SetupNotice /></div>
        ) : filteredNotes.length > 0 ? (
          <div className="mt-6 grid gap-5">
            {filteredNotes.map((note) => {
              const exam = exams.items.find((item) => item.id === note.examId);
              const subject = subjects.items.find((item) => item.id === note.subjectId);
              const topic = topics.items.find((item) => item.id === note.topicId);

              return (
                <article className="border border-slate-200 bg-white p-5 sm:p-6" key={note.id}>
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                    {[exam?.name, subject?.name, topic?.name].filter(Boolean).join(" · ") || "Uncategorized"}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950">{note.title}</h3>
                  <div className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-700">
                    {note.content}
                  </div>
                </article>
              );
            })}
          </div>
        ) : hasFilter ? (
          <div className="py-14 text-center">
            <FileText aria-hidden="true" className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-800">No custom notes match these specific filters yet.</p>
            <p className="mt-2 text-sm text-slate-500">Clear filters or browse our core foundational guides below.</p>
          </div>
        ) : null}

        <AdBanner className="my-8" />

        {/* Foundational High-Yield Study Guides (Always available for students & search crawlers) */}
        <div className="mt-12 border-t border-slate-200 pt-8">
          <div className="flex items-center gap-2 text-blue-800">
            <Compass className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-slate-950">Foundational Revision Guides</h3>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Core mathematical formulas, verbal reasoning rules, and mock test time-management frameworks.
          </p>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {FOUNDATIONAL_STUDY_GUIDES.map((guide) => (
              <article className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300" key={guide.id}>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                    {guide.category}
                  </span>
                  <h4 className="mt-2 text-lg font-semibold text-slate-950">{guide.title}</h4>
                  <p className="mt-1 text-xs text-slate-500 italic">{guide.summary}</p>
                  <div className="mt-4 whitespace-pre-line rounded bg-slate-50 p-4 font-mono text-xs leading-relaxed text-slate-800">
                    {guide.content}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
