export default function QuestionCard({ question, number, selectedIndex, onSelect }) {
  const marks = Number(question.marks !== undefined && question.marks !== "" ? question.marks : 1);
  const negativeMarks = Number(
    question.negativeMarks !== undefined && question.negativeMarks !== ""
      ? question.negativeMarks
      : (question.negativeMarkingPerWrongAnswer !== undefined && question.negativeMarkingPerWrongAnswer !== ""
        ? question.negativeMarkingPerWrongAnswer
        : 0)
  );

  return (
    <section aria-labelledby="question-heading" className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-800">
          Question {number}
        </p>
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
          <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">
            +{marks} {marks === 1 ? "mark" : "marks"}
          </span>
          {negativeMarks > 0 ? (
            <span className="inline-flex items-center rounded border border-red-200 bg-red-50 px-2 py-0.5 font-semibold text-red-800">
              -{negativeMarks} on wrong attempt
            </span>
          ) : (
            <span className="inline-flex items-center rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-600">
              No negative mark
            </span>
          )}
        </div>
      </div>
      <h2 className="mt-4 whitespace-pre-wrap wrap-break-word text-xl font-semibold leading-8 text-slate-950" id="question-heading">
        {question.questionText}
      </h2>
      {question.imageUrl && (
        <div className="mt-4">
          <img src={question.imageUrl} alt="Question image" className="max-h-80 rounded-md border border-slate-200 object-contain" />
        </div>
      )}
      <div aria-label="Answer options" className="mt-6 grid gap-3" role="radiogroup">
        {(question.options || []).map((option, index) => {
          const selected = selectedIndex === index;
          return (
            <button
              aria-checked={selected}
              className={`flex min-h-14 w-full items-start gap-3 border px-4 py-3 text-left transition-colors ${
                selected
                  ? "border-blue-700 bg-blue-50 text-slate-950"
                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
              }`}
              key={`${question.id || number}-${index}`}
              onClick={() => onSelect(index)}
              role="radio"
              type="button"
            >
              <span className={`grid h-6 w-6 shrink-0 place-items-center border text-xs font-semibold ${selected ? "border-blue-700 bg-blue-700 text-white" : "border-slate-300 text-slate-600"}`}>
                {String.fromCharCode(65 + index)}
              </span>
              <span className="min-w-0 wrap-break-word pt-0.5 text-sm leading-6">{option}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}