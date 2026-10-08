"use client";

import { ArrowLeft, ArrowRight, Check, CircleAlert, Flag, RotateCcw } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import LoadingState from "@/components/LoadingState";
import QuestionCard from "@/components/QuestionCard";
import ResultCard from "@/components/ResultCard";
import SetupNotice from "@/components/SetupNotice";
import Timer from "@/components/Timer";
import { useAuth } from "@/lib/auth-context";
import { logAnalyticsEvent } from "@/lib/firebase";
import { displayFirebaseError, getCollection, createRecord } from "@/lib/firestore";
import { getTestSubmissionStatusAction } from "@/app/actions/db-actions";
import { useCollection } from "@/lib/useCollection";
import { useToast } from "@/components/ToastProvider";

const scoringApiBase = process.env.NEXT_PUBLIC_SCORING_API_URL?.replace(/\/+$/, "");

export default function TestPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading test" />}>
      <TestRunner />
    </Suspense>
  );
}

function TestRunner() {
  const id = useSearchParams().get("id");
  const { user } = useAuth();
  const notify = useToast();
  const { items: tests, loading, error } = useCollection("tests");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  const test = tests.find((item) => item.id === id);
  const questions = test?.questions || [];
  const question = questions[currentIndex];

  const [checkingPastSubmission, setCheckingPastSubmission] = useState(true);

  useEffect(() => {
    if (!id || !user || !test) {
      if (test || !loading) setCheckingPastSubmission(false);
      return;
    }

    async function checkStatus() {
      try {
        const status = await getTestSubmissionStatusAction(id);
        if (status?.success && status?.hasSubmitted && status?.resultData) {
          const detailsList = Array.isArray(status.resultData.details) ? status.resultData.details : [];
          const correctIndices = Array.isArray(status.correctOptionIndices) ? status.correctOptionIndices : [];
          const uiResult = {
            ...status.resultData,
            answerReview: (test.questions || []).map((q, index) => {
              const detail = detailsList.find(d => d.questionId === q.id);
              return {
                ...q,
                selectedOptionIndex: detail ? detail.selectedOptionIndex : null,
                correctOptionIndex: correctIndices[index] ?? null
              };
            })
          };
          setResult(uiResult);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCheckingPastSubmission(false);
      }
    }
    
    checkStatus();
  }, [id, user, test, loading]);

  async function submitTest() {
    if (submitting.current || !test || questions.length === 0) return;
    submitting.current = true;
    setSaving(true);

    try {
      const answerKeys = await getCollection("answerKeys");
      
      const answerKeyRecord = answerKeys.find((ak) => ak.id === test.id);
      if (!answerKeyRecord) throw new Error("Answer key not found for this test. The admin may have deleted it.");
      
      const correctOptionIndices = answerKeyRecord.correctOptionIndices;
      
      let score = 0;
      let totalMaxMarks = 0;
      
      const details = questions.map((q, index) => {
        const selectedOptionIndex = answers[index] ?? null;
        const isAttempted = selectedOptionIndex !== null;
        const isCorrect = isAttempted && selectedOptionIndex === correctOptionIndices[index];
        const marks = Number(q.marks) || 1;
        const negativeMarks = Number(q.negativeMarks) || 0;
        
        totalMaxMarks += marks;
        
        let earned = 0;
        if (isCorrect) earned = marks;
        else if (isAttempted) earned = -negativeMarks;
        
        score += earned;
        
        return {
          questionId: q.id,
          selectedOptionIndex,
          isCorrect,
          marks: earned,
        };
      });

      const percentage = totalMaxMarks > 0 ? (score / totalMaxMarks) * 100 : 0;
      const correctAnswers = details.filter((d) => d.isCorrect).length;
      
      const resultData = {
        testId: test.id,
        testTitle: test.title,
        userId: user?.uid || null,
        score,
        totalMarks: totalMaxMarks,
        totalQuestions: questions.length,
        correctAnswers,
        percentage: Math.round(percentage),
        details,
        submittedAt: new Date().toISOString()
      };
      
      if (user) {
        await createRecord("results", resultData);
        notify("Your result has been saved to your account.", "success");
      }
      
      const uiResult = {
        ...resultData,
        answerReview: questions.map((q, index) => ({
          ...q,
          selectedOptionIndex: answers[index] ?? null,
          correctOptionIndex: correctOptionIndices[index]
        }))
      };
      
      setResult(uiResult);
    } catch (submitError) {
      notify(submitError.message || "Something went wrong.", "error");
      submitting.current = false;
    } finally {
      setSaving(false);
    }
  }

  function advanceAfterQuestionTime() {
    if (currentIndex >= questions.length - 1) {
      submitTest();
      return;
    }
    setCurrentIndex((index) => index + 1);
    notify("Time for this question is up.", "info");
  }

  if (loading || checkingPastSubmission) return <LoadingState label="Loading test" />;
  if (error) return <main className="mx-auto max-w-3xl px-4 py-10"><SetupNotice /></main>;
  if (!test) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-slate-950">Test not found</h1>
        <p className="mt-2 text-sm text-slate-600">This test may have been removed.</p>
        <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-800" href="/">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to tests
        </Link>
      </main>
    );
  }
  if (questions.length === 0) {
    return <main className="mx-auto max-w-3xl px-4 py-12"><div className="flex gap-3 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><CircleAlert className="h-5 w-5 shrink-0" />This test does not contain any questions.</div></main>;
  }

  const now = new Date();
  if (test.startTime && new Date(test.startTime) > now && !result) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-slate-950">Test not started</h1>
        <p className="mt-2 text-sm text-slate-600">This test will be available starting at {new Date(test.startTime).toLocaleString()}.</p>
        <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-800" href="/">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to tests
        </Link>
      </main>
    );
  }
  
  if (test.endTime && new Date(test.endTime) < now && !result) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 text-center">
        <h1 className="text-2xl font-semibold text-slate-950">Test expired</h1>
        <p className="mt-2 text-sm text-slate-600">The time window for this test ended at {new Date(test.endTime).toLocaleString()}.</p>
        <Link className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-800" href="/">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to tests
        </Link>
      </main>
    );
  }

  if (result) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-800">Test complete</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">{test.title}</h1>
        {saving && <p className="mt-2 text-sm text-slate-500">Saving your result…</p>}
        <div className="mt-6"><ResultCard answers={answers} questions={questions} result={result} user={user} /></div>
        <Link className="mt-7 inline-flex min-h-11 items-center gap-2 bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800" href="/">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Return to test library
        </Link>
      </main>
    );
  }

  const totalSeconds = Math.max(0, Number(test.durationMinutes || 0) * 60);
  const perQuestionSeconds = Math.max(0, Number(test.timePerQuestionSeconds || 0));
  const marksPerQuestion = Number(test.marksPerQuestion || 1);
  const negativeMarkingPerWrongAnswer = Number(test.negativeMarkingPerWrongAnswer || 0);

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
      <Link className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950" href="/">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Exit test
      </Link>
      <div className="mt-5 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-800">Mock test</p>
          <h1 className="mt-1 wrap-break-word text-2xl font-semibold text-slate-950">{test.title}</h1>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {totalSeconds > 0 && <Timer durationSeconds={totalSeconds} label="Test time" onExpire={submitTest} />}
          {perQuestionSeconds > 0 && <Timer key={currentIndex} durationSeconds={perQuestionSeconds} label="Question" onExpire={advanceAfterQuestionTime} />}
          <div className="flex items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
            <span className="font-semibold text-emerald-800">+{marksPerQuestion} mark{marksPerQuestion === 1 ? "" : "s"}</span>
            <span>·</span>
            {negativeMarkingPerWrongAnswer > 0 ? (
              <span className="font-semibold text-red-700">-{negativeMarkingPerWrongAnswer} per wrong attempted question</span>
            ) : (
              <span className="text-slate-600">No negative marking</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0 border border-slate-200 bg-white p-4 sm:p-7">
          <QuestionCard
            number={currentIndex + 1}
            onSelect={(optionIndex) => setAnswers((current) => ({ ...current, [currentIndex]: optionIndex }))}
            question={question}
            selectedIndex={answers[currentIndex]}
          />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <div className="flex gap-2">
              <button
                className="inline-flex min-h-10 items-center gap-2 border border-slate-300 px-3 text-sm font-medium text-slate-700 disabled:opacity-40"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((index) => Math.max(0, index - 1))}
                type="button"
              ><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Previous</button>
              <button
                className="inline-flex min-h-10 items-center gap-2 border border-slate-300 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                onClick={() => setAnswers((current) => { const next = { ...current }; delete next[currentIndex]; return next; })}
                type="button"
              ><RotateCcw aria-hidden="true" className="h-4 w-4" /> Clear</button>
            </div>
            {currentIndex < questions.length - 1 ? (
              <button
                className="inline-flex min-h-10 items-center gap-2 bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
                onClick={() => setCurrentIndex((index) => index + 1)}
                type="button"
              >Next <ArrowRight aria-hidden="true" className="h-4 w-4" /></button>
            ) : (
              <button
                className="inline-flex min-h-10 items-center gap-2 bg-emerald-700 px-4 text-sm font-semibold text-white hover:bg-emerald-800"
                onClick={submitTest}
                type="button"
              ><Check aria-hidden="true" className="h-4 w-4" />{saving ? "Submitting…" : "Submit test"}</button>
            )}
          </div>
        </div>

        <aside className="h-fit border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Question map</h2>
            <span className="text-xs text-slate-500">{Object.keys(answers).length}/{questions.length} answered</span>
          </div>
          <div className="mt-4 grid grid-cols-5 gap-2 sm:grid-cols-8 lg:grid-cols-5">
            {questions.map((item, index) => {
              const isAnswered = answers[index] !== undefined;
              return (
                <button
                  aria-label={`Go to question ${index + 1}${isAnswered ? ", answered" : ", unanswered"}`}
                  aria-current={currentIndex === index ? "step" : undefined}
                  className={`aspect-square border text-sm font-semibold tabular-nums ${currentIndex === index ? "border-blue-700 bg-blue-700 text-white" : isAnswered ? "border-blue-200 bg-blue-50 text-blue-900" : "border-slate-200 text-slate-700 hover:border-slate-400"}`}
                  key={item.id || index}
                  onClick={() => setCurrentIndex(index)}
                  type="button"
                >{index + 1}</button>
              );
            })}
          </div>
          <div className="mt-5 border-t border-slate-200 pt-4">
            <button
              className="inline-flex min-h-10 w-full items-center justify-center gap-2 border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              disabled={saving}
              onClick={submitTest}
              type="button"
            ><Flag aria-hidden="true" className="h-4 w-4" />Submit now</button>
          </div>
        </aside>
      </div>
    </main>
  );
}