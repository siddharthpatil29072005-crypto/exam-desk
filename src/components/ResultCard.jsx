import { CircleCheck, CircleX, MinusCircle } from "lucide-react";

export default function ResultCard({ result, questions = [], answers = {}, user }) {
  const answerReview = result.answerReview || questions.map((question, index) => ({
    ...question,
    selectedOptionIndex: answers[index] === undefined ? null : Number(answers[index]),
  }));
  const incorrectAnswers = answerReview.filter((item) =>
    item.selectedOptionIndex !== null && item.selectedOptionIndex !== item.correctOptionIndex,
  ).length;
  const unanswered = answerReview.filter((item) => item.selectedOptionIndex === null).length;

  return (
    <div className="space-y-6">
      <section className="grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-4">
        <div className="bg-white p-5 sm:col-span-2">
          <p className="text-sm text-slate-500">Your score</p>
          <p className="mt-1 text-4xl font-semibold tabular-nums text-slate-950">
            {result.score} <span className="text-xl font-normal text-slate-500">/ {result.totalMarks}</span>
          </p>
          <p className="mt-2 text-sm font-semibold text-blue-800">{result.percentage}% overall</p>
        </div>
        <Metric icon={CircleCheck} label="Correct" value={result.correctAnswers} tone="text-emerald-700" />
        <Metric icon={CircleX} label="Incorrect" value={incorrectAnswers} tone="text-red-700" />
      </section>

      {!user && (
        <div className="border-l-4 border-blue-700 bg-blue-50 px-4 py-3 text-sm text-blue-950">
          <strong>Log in with Email to save your scores permanently!</strong>
          <span className="ml-1">This guest result is not linked to an account.</span>
        </div>
      )}

      {answerReview.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <MinusCircle aria-hidden="true" className="h-4 w-4 text-slate-500" />
            Answer review
          </div>
          <div className="divide-y divide-slate-200">
            {answerReview.map((question, index) => {
              const selected = question.selectedOptionIndex;
              const correct = selected === question.correctOptionIndex;
              const qMarks = Number(question.marks !== undefined ? question.marks : 1);
              const qNegative = Number(
                question.negativeMarks !== undefined
                  ? question.negativeMarks
                  : (question.negativeMarkingPerWrongAnswer !== undefined ? question.negativeMarkingPerWrongAnswer : 0)
              );
              return (
                <article className="py-4" key={question.id || index}>
                  <div className="flex items-start gap-3">
                    {correct ? (
                      <CircleCheck aria-label="Correct" className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" />
                    ) : (
                      <CircleX aria-label={selected === null ? "Unanswered" : "Incorrect"} className="mt-0.5 h-5 w-5 shrink-0 text-red-700" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="whitespace-pre-wrap wrap-break-word text-sm font-medium leading-6 text-slate-900">{question.questionText}</p>
                        <div className="shrink-0 text-xs font-semibold">
                          {correct ? (
                            <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-800">
                              +{qMarks} marks
                            </span>
                          ) : selected !== null ? (
                            <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-red-800">
                              {qNegative > 0 ? `-${qNegative} marks` : "0 marks"}
                            </span>
                          ) : (
                            <span className="rounded border border-slate-200 bg-slate-100 px-2 py-0.5 text-slate-600">
                              0 marks (unattempted)
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        Your answer: {selected === null ? "Not answered" : question.options?.[selected]}
                      </p>
                      {!correct && (
                        <p className="mt-1 text-sm font-medium text-emerald-800">
                          Correct answer: {question.options?.[question.correctOptionIndex]}
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
      <p className="text-xs text-slate-500">{unanswered} unanswered · {result.totalQuestions} questions</p>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 bg-white p-5">
      <Icon aria-hidden="true" className={`h-5 w-5 ${tone}`} />
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-xl font-semibold tabular-nums text-slate-950">{value}</p>
      </div>
    </div>
  );
}