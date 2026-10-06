export default function FilterBar({
  exams,
  subjects,
  topics,
  examId,
  subjectId,
  topicId,
  onExamChange,
  onSubjectChange,
  onTopicChange,
}) {
  const availableSubjects = subjects.filter((subject) => subject.examId === examId);
  const availableTopics = topics.filter((topic) => topic.subjectId === subjectId);

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">
        Exam
        <select
          className="h-11 w-full border border-slate-300 bg-white px-3 text-slate-950"
          onChange={(event) => onExamChange(event.target.value)}
          value={examId}
        >
          <option value="">All exams</option>
          {exams.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">
        Subject
        <select
          className="h-11 w-full border border-slate-300 bg-white px-3 text-slate-950 disabled:opacity-60"
          disabled={!examId}
          onChange={(event) => onSubjectChange(event.target.value)}
          value={subjectId}
        >
          <option value="">All subjects</option>
          {availableSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
        </select>
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">
        Topic
        <select
          className="h-11 w-full border border-slate-300 bg-white px-3 text-slate-950 disabled:opacity-60"
          disabled={!subjectId}
          onChange={(event) => onTopicChange(event.target.value)}
          value={topicId}
        >
          <option value="">All topics</option>
          {availableTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
        </select>
      </label>
    </div>
  );
}