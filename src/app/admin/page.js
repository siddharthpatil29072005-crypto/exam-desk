"use client";

import { BookOpenCheck, CircleAlert, Plus, ShieldCheck, Trash2 } from "lucide-react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingState from "@/components/LoadingState";
import SetupNotice from "@/components/SetupNotice";
import { useToast } from "@/components/ToastProvider";
import { createRecord, deleteRecord, displayFirebaseError } from "@/lib/firestore";
import { useCollection } from "@/lib/useCollection";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { parseTestFile } from "@/app/actions/parse-test";
import { generateTestWithAI } from "@/app/actions/generate-test";

const adminPin = "1234";
const tabs = [
  { id: "exams", label: "Exams" },
  { id: "subjects", label: "Subjects" },
  { id: "topics", label: "Topics" },
  { id: "notes", label: "Notes" },
  { id: "practice", label: "Practice section" },
  { id: "tests", label: "Test section" },
];

function makeQuestion(defaultMarks = "1", defaultNegative = "0") {
  return {
    questionText: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
    marks: defaultMarks,
    negativeMarks: defaultNegative,
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [isAdminClaim, setIsAdminClaim] = useState(false);
  const exams = useCollection("exams");
  const subjects = useCollection("subjects");
  const topics = useCollection("topics");
  const tests = useCollection("tests");
  const notes = useCollection("notes");
  const notify = useToast();
  const [activeTab, setActiveTab] = useState("exams");
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [examId, setExamId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [testTitle, setTestTitle] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("30");
  const [timePerQuestionSeconds, setTimePerQuestionSeconds] = useState("0");
  const [marksPerQuestion, setMarksPerQuestion] = useState("1");
  const [negativeMarkingPerWrongAnswer, setNegativeMarkingPerWrongAnswer] = useState("0");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [fullTestMode, setFullTestMode] = useState(false);
  const [questions, setQuestions] = useState(() => [makeQuestion()]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "admin")) {
      router.push("/admin-login");
      return;
    }
    setIsAdminClaim(user?.role === "admin");
  }, [user, loading, router]);

  function unlockAdmin(event) {
    event.preventDefault();
    if (pin !== adminPin) {
      setPinError("That PIN is not correct. Use '1234' for offline mode.");
      return;
    }
    setUnlocked(true);
    setPinError("");
  }

  function lockAdmin() {
    setUnlocked(false);
  }

  async function addNamedRecord(event, collectionName, values) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      notify(`Please enter a name for the ${collectionName.slice(0, -1)}.`, "error");
      return;
    }

    if (collectionName === "subjects" && !values.examId) {
      notify("Please select an Exam from the dropdown above before adding a subject.", "error");
      return;
    }

    if (collectionName === "topics" && !values.subjectId) {
      notify("Please select an Exam and Subject before adding a topic.", "error");
      return;
    }

    if (!user) {
      notify("You are not signed in. Firestore security rules require an admin account to save records.", "error");
    }

    setSaving(true);
    try {
      await createRecord(collectionName, { ...values, name: trimmedName });
      setName("");
      
      if (collectionName === "exams") exams.refresh();
      if (collectionName === "subjects") subjects.refresh();
      if (collectionName === "topics") topics.refresh();
      
      notify(`${trimmedName} added successfully.`, "success");
    } catch (error) {
      if (error?.code === "permission-denied") {
        notify("Firestore write denied: your account must be signed in with the admin claim, or Firestore rules must permit writes.", "error");
      } else {
        notify(displayFirebaseError(error), "error");
      }
    } finally {
      setSaving(false);
    }
  }

  async function removeNamedRecord(collectionName, record, dependencies) {
    if (dependencies.length > 0) {
      notify("Remove its related items and tests before deleting this record.", "error");
      return;
    }

    try {
      await deleteRecord(collectionName, record.id);
      
      if (collectionName === "exams") exams.refresh();
      if (collectionName === "subjects") subjects.refresh();
      if (collectionName === "topics") topics.refresh();
      
      notify(`${record.name} deleted.`, "success");
    } catch (error) {
      notify(displayFirebaseError(error), "error");
    }
  }

  function updateQuestion(questionIndex, field, value) {
    setQuestions((current) => current.map((question, index) =>
      index === questionIndex ? { ...question, [field]: value } : question,
    ));
  }

  function updateOption(questionIndex, optionIndex, value) {
    setQuestions((current) => current.map((question, index) => {
      if (index !== questionIndex) return question;
      const options = [...question.options];
      options[optionIndex] = value;
      return { ...question, options };
    }));
  }

  function applyDefaultsToAllQuestions() {
    setQuestions((current) => current.map((q) => ({
      ...q,
      marks: marksPerQuestion,
      negativeMarks: negativeMarkingPerWrongAnswer,
    })));
    notify(`Applied +${marksPerQuestion} marks and -${negativeMarkingPerWrongAnswer} negative marking to all ${questions.length} questions.`, "info");
  }

  async function saveTest(event, isFullMode = fullTestMode) {
    event.preventDefault();
    const validQuestions = questions.every((question) =>
      question.questionText.trim() && question.options.every((option) => option.trim()),
    );
    const normalizedSubjectId = isFullMode ? "" : subjectId;
    const normalizedTopicId = isFullMode ? "" : (topics.items.some((topic) => topic.id === topicId) ? topicId : "");
    if (!testTitle.trim() || !examId || (!isFullMode && !subjectId) || !validQuestions) {
      notify(
        isFullMode
          ? "Complete the test title, select an exam, and fill all question texts and options."
          : "Complete the practice title, exam, subject, and fill all question texts and options.",
        "error"
      );
      return;
    }

    setSaving(true);
    try {
      const parsedDefaultMarks = Number(marksPerQuestion) || 1;
      const parsedDefaultNegative = Number(negativeMarkingPerWrongAnswer) || 0;
      
      const testId = Math.random().toString(36).substring(2, 15);
      
      await createRecord("tests", {
        id: testId,
        title: testTitle.trim(),
        examId,
        subjectId: normalizedSubjectId,
        topicId: normalizedTopicId,
        isFullTest: Boolean(isFullMode),
        durationMinutes: Number(durationMinutes) || 0,
        timePerQuestionSeconds: Number(timePerQuestionSeconds) || 0,
        marksPerQuestion: parsedDefaultMarks,
        negativeMarkingPerWrongAnswer: parsedDefaultNegative,
        questions: questions.map((question, index) => {
          const qMarks = Number(
            question.marks !== undefined && question.marks !== ""
              ? question.marks
              : parsedDefaultMarks
          );
          const qNegative = Number(
            question.negativeMarks !== undefined && question.negativeMarks !== ""
              ? question.negativeMarks
              : parsedDefaultNegative
          );
          return {
            id: `question-${index + 1}`,
            questionText: question.questionText.trim(),
            options: question.options.map((option) => option.trim()),
            marks: qMarks,
            negativeMarks: qNegative,
            negativeMarkingPerWrongAnswer: qNegative,
          };
        }),
      });
      
      await createRecord("answerKeys", {
        id: testId,
        correctOptionIndices: questions.map((question) => Number(question.correctOptionIndex)),
      });
      
      tests.refresh();
      
      setTestTitle("");
      setDurationMinutes("30");
      setTimePerQuestionSeconds("0");
      setQuestions([makeQuestion(marksPerQuestion, negativeMarkingPerWrongAnswer)]);
      notify(
        isFullMode
          ? "Mock test published to the test section."
          : "Practice test published to the practice section.",
        "success"
      );
    } catch (error) {
      notify(displayFirebaseError(error), "error");
    } finally {
      setSaving(false);
    }
  }

  async function saveNote(event) {
    event.preventDefault();
    const trimmedTitle = noteTitle.trim();
    const trimmedContent = noteContent.trim();
    if (!trimmedTitle || !trimmedContent || !examId || !subjectId) {
      notify("Select an exam and subject, and provide both a title and note content.", "error");
      return;
    }

    try {
      await createRecord("notes", {
        title: trimmedTitle,
        content: trimmedContent,
        examId,
        subjectId,
        topicId: topicId || "",
      });
      
      notes.refresh();
      
      setNoteTitle("");
      setNoteContent("");
      notify("Note saved to the library.", "success");
    } catch (error) {
      notify(displayFirebaseError(error), "error");
    }
  }

  async function removeTest(test) {
    try {
      await deleteRecord("tests", test.id);
      await deleteRecord("answerKeys", test.id);
      notify(`${test.title} deleted.`, "success");
    } catch (error) {
      notify(displayFirebaseError(error), "error");
    }
  }

  async function removeNote(note) {
    try {
      await deleteRecord("notes", note.id);
      notify(`${note.title} deleted.`, "success");
    } catch (error) {
      notify(displayFirebaseError(error), "error");
    }
  }

  if (!unlocked) {
    return (
      <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_24rem]">
        <section>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">Administration</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 sm:text-4xl">Manage the test library.</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">Create exam categories, organize topics, and publish mock tests with scoring and timer settings.</p>
        </section>
        <form className="border border-slate-200 bg-white p-5 sm:p-7" onSubmit={unlockAdmin}>
          <ShieldCheck aria-hidden="true" className="h-6 w-6 text-blue-800" />
          <h2 className="mt-4 text-lg font-semibold text-slate-950">Admin access</h2>
          <label className="mt-5 grid gap-1.5 text-sm font-medium text-slate-700">
            Access PIN
            <input
              autoComplete="current-password"
              className="h-11 border border-slate-300 px-3 text-slate-950"
              onChange={(event) => setPin(event.target.value)}
              type="password"
              value={pin}
            />
          </label>
          {pinError && <p className="mt-3 text-sm text-red-700" role="alert">{pinError}</p>}
          <button className="mt-4 min-h-11 w-full bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800" type="submit">Continue</button>
          {!adminPin && <p className="mt-3 text-xs leading-5 text-slate-500">No PIN is configured yet. Add NEXT_PUBLIC_ADMIN_PIN to .env.local.</p>}
          <p className="mt-4 flex gap-2 border-t border-slate-200 pt-4 text-xs leading-5 text-slate-500"><CircleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />The PIN only unlocks this page. Firestore writes require a signed-in account with the admin custom claim.</p>
        </form>
      </main>
    );
  }

  const activeSubjects = subjects.items.filter((subject) => subject.examId === examId);
  const activeTopics = topics.items.filter((topic) => topic.subjectId === subjectId);
  const practiceTests = tests.items.filter((test) => Boolean(test.subjectId));
  const fullTests = tests.items.filter((test) => !test.subjectId);
  const setupError = !isFirebaseConfigured || exams.error || subjects.error || topics.error || tests.error || notes.error;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">Administration</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Test library manager</h1>
          <p className="mt-2 text-sm text-slate-600">Manage categories and publish scored practice tests.</p>
        </div>
        <button className="min-h-10 self-start border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-white sm:self-auto" onClick={lockAdmin} type="button">Lock admin</button>
      </div>

      {!isFirebaseConfigured && <div className="mt-5"><SetupNotice compact /></div>}
      {isFirebaseConfigured && setupError && <div className="mt-5 border border-red-200 bg-red-50 p-3 text-sm text-red-800">{exams.error || subjects.error || topics.error || tests.error || notes.error}</div>}

      {/* Admin auth & permissions banner */}
      <div className={`mt-5 rounded-lg border p-4 text-sm ${
        user
          ? isAdminClaim
            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
            : "border-amber-200 bg-amber-50 text-amber-950"
          : "border-red-200 bg-red-50 text-red-950"
      }`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck aria-hidden="true" className={`h-5 w-5 shrink-0 ${
              user && isAdminClaim ? "text-emerald-700" : user ? "text-amber-700" : "text-red-700"
            }`} />
            <div>
              <p className="font-semibold">
                {user
                  ? `Signed in as ${user.email} ${isAdminClaim ? "(Admin claim verified)" : "(Standard account)"}`
                  : "Not signed in"}
              </p>
              <p className="mt-0.5 text-xs opacity-90">
                {user
                  ? isAdminClaim
                    ? "Your account is authorized to create, edit, and delete exams, subjects, topics, and tests in the database."
                    : "Database security rules block writes without the admin role. Please log in with the admin account."
                  : "Database security rules reject all writes for guests. Please log in before adding subjects, exams, or tests."}
              </p>
            </div>
          </div>
          {!user ? (
            <Link
              className="inline-flex min-h-9 shrink-0 items-center justify-center rounded bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800"
              href="/login"
            >
              Sign in to enable writes
            </Link>
          ) : !isAdminClaim ? (
            <span className="shrink-0 rounded bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-900 border border-amber-300">
              Admin role needed
            </span>
          ) : (
            <span className="shrink-0 rounded bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900 border border-emerald-300">
              ✓ Ready to write
            </span>
          )}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto border-b border-slate-200">
        <div aria-label="Admin sections" className="flex min-w-max gap-1" role="tablist">
          {tabs.map((tab) => (
            <button
              aria-selected={activeTab === tab.id}
              className={`min-h-11 border-b-2 px-4 text-sm font-semibold ${activeTab === tab.id ? "border-blue-700 text-blue-800" : "border-transparent text-slate-600 hover:text-slate-950"}`}
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              type="button"
            >{tab.label}</button>
          ))}
        </div>
      </div>

      {exams.loading || subjects.loading || topics.loading || tests.loading ? <LoadingState label="Loading admin data" /> : (
        <div className="mt-6">
          {activeTab === "exams" && (
            <ResourcePanel
              description="Create exams that users can choose from the practice library."
              emptyMessage="No exams added yet."
              items={exams.items}
              onAdd={(event) => addNamedRecord(event, "exams", {})}
              onDelete={(item) => removeNamedRecord("exams", item, [
                ...subjects.items.filter((subject) => subject.examId === item.id),
                ...tests.items.filter((test) => test.examId === item.id),
              ])}
              saving={saving}
              setName={setName}
              title="Exams"
              name={name}
            />
          )}

          {activeTab === "subjects" && (
            <ResourcePanel
              description="Subjects belong to one exam. Select an exam before adding a subject."
              disabled={!examId}
              disabledReason={
                exams.items.length === 0
                  ? "No exams exist yet. Go to the Exams tab and create an exam first."
                  : !examId
                    ? "Choose an Exam from the dropdown above to enable adding a subject."
                    : ""
              }
              emptyMessage="No subjects added yet."
              getSubtitle={(item) => {
                const exam = exams.items.find((e) => e.id === item.examId);
                return exam ? `Exam: ${exam.name}` : item.examId ? `Exam ID: ${item.examId}` : "";
              }}
              items={subjects.items}
              name={name}
              onAdd={(event) => addNamedRecord(event, "subjects", { examId })}
              onDelete={(item) => removeNamedRecord("subjects", item, [
                ...topics.items.filter((topic) => topic.subjectId === item.id),
                ...tests.items.filter((test) => test.subjectId === item.id),
              ])}
              saving={saving}
              selector={(
                <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                  Exam
                  <select className="h-11 border border-slate-300 bg-white px-3" onChange={(event) => setExamId(event.target.value)} value={examId}>
                    <option value="">Choose exam</option>
                    {exams.items.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
                  </select>
                </label>
              )}
              setName={setName}
              title="Subjects"
            />
          )}

          {activeTab === "topics" && (
            <ResourcePanel
              description="Topics belong to one subject. Choose an exam, then choose the subject."
              disabled={!subjectId}
              disabledReason={
                exams.items.length === 0
                  ? "No exams exist yet. Please create an exam first."
                  : !examId
                    ? "Select an Exam first."
                    : activeSubjects.length === 0
                      ? "No subjects found for this exam. Please create a subject first."
                      : !subjectId
                        ? "Select a Subject from the dropdown to enable adding a topic."
                        : ""
              }
              emptyMessage="No topics added yet."
              getSubtitle={(item) => {
                const subj = subjects.items.find((s) => s.id === item.subjectId);
                const ex = subj ? exams.items.find((e) => e.id === subj.examId) : null;
                return [ex?.name, subj?.name].filter(Boolean).join(" · ") || (item.subjectId ? `Subject ID: ${item.subjectId}` : "");
              }}
              items={topics.items}
              name={name}
              onAdd={(event) => addNamedRecord(event, "topics", { subjectId })}
              onDelete={(item) => removeNamedRecord("topics", item, tests.items.filter((test) => test.topicId === item.id))}
              saving={saving}
              selector={(
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                    Exam
                    <select className="h-11 border border-slate-300 bg-white px-3" onChange={(event) => { setExamId(event.target.value); setSubjectId(""); }} value={examId}>
                      <option value="">Choose exam</option>
                      {exams.items.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
                    </select>
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                    Subject
                    <select className="h-11 border border-slate-300 bg-white px-3 disabled:opacity-60" disabled={!examId} onChange={(event) => setSubjectId(event.target.value)} value={subjectId}>
                      <option value="">Choose subject</option>
                      {activeSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                    </select>
                  </label>
                </div>
              )}
              setName={setName}
              title="Topics"
            />
          )}

          {activeTab === "notes" && (
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_21rem]">
              <form className="min-w-0 space-y-6" onSubmit={saveNote}>
                <div>
                  <h2 className="text-xl font-semibold text-slate-950">Create a study note</h2>
                  <p className="mt-1 text-sm text-slate-600">Attach notes to a specific exam, subject, and topic so students can find them quickly.</p>
                </div>
                <div className="grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-2">
                  <SelectField label="Exam" value={examId} onChange={(value) => { setExamId(value); setSubjectId(""); setTopicId(""); }}>
                    <option value="">Choose exam</option>
                    {exams.items.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
                  </SelectField>
                  <SelectField disabled={!examId} label="Subject" value={subjectId} onChange={(value) => { setSubjectId(value); setTopicId(""); }}>
                    <option value="">Choose subject</option>
                    {activeSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                  </SelectField>
                  <SelectField disabled={!subjectId} label="Topic (optional)" value={topicId} onChange={setTopicId}>
                    <option value="">No topic</option>
                    {activeTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
                  </SelectField>
                  <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
                    Note title
                    <input className="h-11 border border-slate-300 bg-white px-3" onChange={(event) => setNoteTitle(event.target.value)} required value={noteTitle} />
                  </label>
                  <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
                    Note content
                    <textarea className="min-h-36 resize-y border border-slate-300 bg-white p-3" onChange={(event) => setNoteContent(event.target.value)} required value={noteContent} />
                  </label>
                </div>
                <button className="inline-flex min-h-11 items-center gap-2 bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50" disabled={!isFirebaseConfigured || !examId || !subjectId || !noteTitle.trim() || !noteContent.trim()} type="submit">Save note</button>
              </form>

              <aside className="h-fit border-t border-slate-200 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                <h2 className="text-sm font-semibold text-slate-950">Saved notes</h2>
                <p className="mt-1 text-xs text-slate-500">{notes.items.length} total</p>
                <div className="mt-4 divide-y divide-slate-200">
                  {notes.items.length === 0 ? <p className="py-4 text-sm text-slate-500">No notes added yet.</p> : notes.items.map((note) => (
                    <div className="flex items-start justify-between gap-3 py-3" key={note.id}>
                      <div className="min-w-0">
                        <p className="wrap-break-word text-sm font-medium text-slate-900">{note.title}</p>
                        <p className="mt-1 text-xs text-slate-500">{[exams.items.find((exam) => exam.id === note.examId)?.name, subjects.items.find((subject) => subject.id === note.subjectId)?.name, topics.items.find((topic) => topic.id === note.topicId)?.name].filter(Boolean).join(" · ") || "Uncategorized"}</p>
                      </div>
                      <button aria-label={`Delete ${note.title}`} className="grid h-9 w-9 shrink-0 place-items-center text-slate-500 hover:bg-red-50 hover:text-red-700" onClick={() => removeNote(note)} type="button"><Trash2 aria-hidden="true" className="h-4 w-4" /></button>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          )}

          {activeTab === "practice" && (
            <TestBuilderPanel
              activeSubjects={activeSubjects}
              activeTopics={activeTopics}
              applyDefaultsToAllQuestions={applyDefaultsToAllQuestions}
              durationMinutes={durationMinutes}
              examId={examId}
              exams={exams}
              filteredTests={practiceTests}
              isFirebaseConfigured={isFirebaseConfigured}
              isFullTestMode={false}
              marksPerQuestion={marksPerQuestion}
              negativeMarkingPerWrongAnswer={negativeMarkingPerWrongAnswer}
              onSave={(event) => saveTest(event, false)}
              questions={questions}
              removeTest={removeTest}
              saving={saving}
              setActiveTab={setActiveTab}
              setDurationMinutes={setDurationMinutes}
              setExamId={setExamId}
              setMarksPerQuestion={setMarksPerQuestion}
              setNegativeMarkingPerWrongAnswer={setNegativeMarkingPerWrongAnswer}
              setQuestions={setQuestions}
              setSubjectId={setSubjectId}
              setTestTitle={setTestTitle}
              setTimePerQuestionSeconds={setTimePerQuestionSeconds}
              setTopicId={setTopicId}
              subjectId={subjectId}
              subjects={subjects}
              testTitle={testTitle}
              timePerQuestionSeconds={timePerQuestionSeconds}
              topicId={topicId}
              topics={topics}
              updateOption={updateOption}
              updateQuestion={updateQuestion}
            />
          )}

          {activeTab === "tests" && (
            <TestBuilderPanel
              activeSubjects={activeSubjects}
              activeTopics={activeTopics}
              applyDefaultsToAllQuestions={applyDefaultsToAllQuestions}
              durationMinutes={durationMinutes}
              examId={examId}
              exams={exams}
              filteredTests={fullTests}
              isFirebaseConfigured={isFirebaseConfigured}
              isFullTestMode={true}
              marksPerQuestion={marksPerQuestion}
              negativeMarkingPerWrongAnswer={negativeMarkingPerWrongAnswer}
              onSave={(event) => saveTest(event, true)}
              questions={questions}
              removeTest={removeTest}
              saving={saving}
              setActiveTab={setActiveTab}
              setDurationMinutes={setDurationMinutes}
              setExamId={setExamId}
              setMarksPerQuestion={setMarksPerQuestion}
              setNegativeMarkingPerWrongAnswer={setNegativeMarkingPerWrongAnswer}
              setQuestions={setQuestions}
              setSubjectId={setSubjectId}
              setTestTitle={setTestTitle}
              setTimePerQuestionSeconds={setTimePerQuestionSeconds}
              setTopicId={setTopicId}
              subjectId={subjectId}
              subjects={subjects}
              testTitle={testTitle}
              timePerQuestionSeconds={timePerQuestionSeconds}
              topicId={topicId}
              topics={topics}
              updateOption={updateOption}
              updateQuestion={updateQuestion}
            />
          )}
        </div>
      )}
    </main>
  );
}

function ResourcePanel({ title, description, items, emptyMessage, onAdd, onDelete, saving, setName, name, selector, disabled = false, disabledReason = "" }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section>
        <h2 className="text-xl font-semibold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
        <form className="mt-5 grid gap-4 border-y border-slate-200 py-5" onSubmit={onAdd}>
          {selector}
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            {title.slice(0, -1)} name
            <input className="h-11 border border-slate-300 bg-white px-3" onChange={(event) => setName(event.target.value)} required value={name} />
          </label>
          {disabledReason && <p className="text-sm text-amber-700">{disabledReason}</p>}
          <button className="inline-flex min-h-10 w-fit items-center gap-2 bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50" disabled={saving} type="submit"><Plus aria-hidden="true" className="h-4 w-4" />Add {title.slice(0, -1)}</button>
        </form>
      </section>
      <section>
        <h2 className="text-sm font-semibold text-slate-950">Current {title.toLowerCase()}</h2>
        {items.length === 0 ? <p className="mt-4 text-sm text-slate-500">{emptyMessage}</p> : (
          <div className="mt-2 divide-y divide-slate-200">
            {items.map((item) => (
              <div className="flex items-center justify-between gap-3 py-3" key={item.id}>
                <div className="min-w-0"><p className="wrap-break-word text-sm font-medium text-slate-900">{item.name}</p>{item.examId && <p className="mt-1 text-xs text-slate-500">{item.examId}</p>}</div>
                <button aria-label={`Delete ${item.name}`} className="grid h-9 w-9 shrink-0 place-items-center text-slate-500 hover:bg-red-50 hover:text-red-700" onClick={() => onDelete(item)} type="button"><Trash2 aria-hidden="true" className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function SelectField({ children, label, value, onChange, disabled = false }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <select className="h-11 border border-slate-300 bg-white px-3 disabled:opacity-60" disabled={disabled} onChange={(event) => onChange(event.target.value)} value={value}>{children}</select>
    </label>
  );
}

function TestBuilderPanel({
  isFullTestMode,
  exams,
  activeSubjects,
  activeTopics,
  testTitle,
  setTestTitle,
  examId,
  setExamId,
  subjectId,
  setSubjectId,
  topicId,
  setTopicId,
  durationMinutes,
  setDurationMinutes,
  timePerQuestionSeconds,
  setTimePerQuestionSeconds,
  marksPerQuestion,
  setMarksPerQuestion,
  negativeMarkingPerWrongAnswer,
  setNegativeMarkingPerWrongAnswer,
  questions,
  setQuestions,
  updateQuestion,
  updateOption,
  applyDefaultsToAllQuestions,
  onSave,
  saving,
  filteredTests,
  removeTest,
  isFirebaseConfigured,
  setActiveTab,
}) {
  const [parsing, setParsing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [numQuestionsToGenerate, setNumQuestionsToGenerate] = useState("5");

  const totalTestMarks = questions.reduce(
    (sum, q) => sum + (Number(q.marks) || Number(marksPerQuestion) || 1),
    0
  );

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <form className="min-w-0 space-y-6" onSubmit={onSave}>
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span
              className={`inline-block rounded px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                isFullTestMode
                  ? "border border-purple-200 bg-purple-100 text-purple-900"
                  : "border border-blue-200 bg-blue-100 text-blue-900"
              }`}
            >
              {isFullTestMode ? "Test Section · Full Mock Test" : "Practice Section · Subject & Topic Drill"}
            </span>
            <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50 p-0.5 text-xs">
              <button
                className={`rounded px-2 py-0.5 font-medium transition-colors ${
                  !isFullTestMode
                    ? "bg-white font-semibold text-blue-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab("practice")}
                type="button"
              >
                Practice
              </button>
              <button
                className={`rounded px-2 py-0.5 font-medium transition-colors ${
                  isFullTestMode
                    ? "bg-white font-semibold text-purple-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
                onClick={() => setActiveTab("tests")}
                type="button"
              >
                Full Test
              </button>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-950">
            {isFullTestMode ? "Create Full Mock Test" : "Create Practice Test"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {isFullTestMode
              ? "Publish an exam-wide mock test covering all subjects. Set positive marks per question and negative marking per wrong attempted question."
              : "Publish a topic- or subject-focused practice test. Set positive marks per question and negative marking per wrong attempted question."}
          </p>
        </div>

        <div className="grid gap-4 border-y border-slate-200 py-5 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
            {isFullTestMode ? "Mock test title" : "Practice test title"}
            <input
              className="h-11 border border-slate-300 bg-white px-3 text-slate-950"
              onChange={(event) => setTestTitle(event.target.value)}
              placeholder={isFullTestMode ? "e.g. UPSC Prelims Full Mock 1" : "e.g. Ancient History Practice Drill"}
              required
              value={testTitle}
            />
          </label>

          <SelectField label="Exam" onChange={(value) => { setExamId(value); setSubjectId(""); setTopicId(""); }} value={examId}>
            <option value="">Choose exam</option>
            {exams.items.map((exam) => <option key={exam.id} value={exam.id}>{exam.name}</option>)}
          </SelectField>

          {!isFullTestMode ? (
            <>
              <SelectField disabled={!examId} label="Subject" onChange={(value) => { setSubjectId(value); setTopicId(""); }} value={subjectId}>
                <option value="">Choose subject</option>
                {activeSubjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </SelectField>
              <SelectField disabled={!subjectId} label="Topic (optional)" onChange={setTopicId} value={topicId}>
                <option value="">No topic (All topics in subject)</option>
                {activeTopics.map((topic) => <option key={topic.id} value={topic.id}>{topic.name}</option>)}
              </SelectField>
            </>
          ) : (
            <div className="flex items-center rounded border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 sm:col-span-1">
              <span>Full mock tests span across all subjects of the selected exam.</span>
            </div>
          )}

          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Test duration (minutes)
            <input className="h-11 border border-slate-300 bg-white px-3 text-slate-950" min="0" onChange={(event) => setDurationMinutes(event.target.value)} type="number" value={durationMinutes} />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Per-question timer (seconds, optional)
            <input className="h-11 border border-slate-300 bg-white px-3 text-slate-950" min="0" onChange={(event) => setTimePerQuestionSeconds(event.target.value)} type="number" value={timePerQuestionSeconds} />
          </label>

          {/* Dedicated Default Marking Scheme Section */}
          <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-4 sm:col-span-2">
            <div className="flex flex-col gap-2 border-b border-blue-200/80 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-blue-950">Default Marking Scheme</h3>
                <p className="mt-0.5 text-xs text-blue-900">
                  Configure default marks and negative marking penalty for questions in this {isFullTestMode ? "test" : "practice"}.
                </p>
              </div>
              <button
                className="inline-flex items-center gap-1.5 self-start text-xs font-semibold text-blue-700 hover:text-blue-900 hover:underline sm:self-auto"
                onClick={applyDefaultsToAllQuestions}
                title="Update all existing questions with these default marks and negative marking"
                type="button"
              >
                Apply to all questions ({questions.length})
              </button>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm font-semibold text-slate-800">
                <span className="flex items-center justify-between">
                  <span>Marks per question</span>
                  <span className="text-xs font-normal text-slate-500">Correct answer</span>
                </span>
                <input
                  className="h-11 border border-slate-300 bg-white px-3 text-slate-950"
                  min="0.25"
                  onChange={(event) => setMarksPerQuestion(event.target.value)}
                  step="0.25"
                  type="number"
                  value={marksPerQuestion}
                />
              </label>
              <label className="grid gap-1.5 text-sm font-semibold text-slate-800">
                <span className="flex items-center justify-between">
                  <span>Negative marking per wrong attempt</span>
                  <span className="text-xs font-normal text-slate-500">Wrong attempt (0 = none)</span>
                </span>
                <input
                  className="h-11 border border-slate-300 bg-white px-3 text-slate-950"
                  min="0"
                  onChange={(event) => setNegativeMarkingPerWrongAnswer(event.target.value)}
                  step="0.25"
                  type="number"
                  value={negativeMarkingPerWrongAnswer}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-950">Questions ({questions.length})</h3>
            <p className="mt-1 text-xs text-slate-500">
              Total Marks: <strong className="text-slate-900">{totalTestMarks}</strong> · Penalty: <strong className="text-red-700">{Number(negativeMarkingPerWrongAnswer) > 0 ? `-${negativeMarkingPerWrongAnswer}` : "None"}</strong> per wrong attempted question
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 border border-purple-200 bg-purple-50 p-1">
              <input 
                type="number" 
                min="1" 
                max="50"
                className="h-8 w-16 px-2 text-sm border border-slate-300"
                value={numQuestionsToGenerate}
                onChange={(e) => setNumQuestionsToGenerate(e.target.value)}
                disabled={generating}
                title="Number of questions to generate"
              />
              <button
                className="inline-flex min-h-8 items-center gap-2 bg-purple-700 px-3 text-sm font-semibold text-white hover:bg-purple-800 disabled:opacity-50"
                disabled={generating || !examId}
                type="button"
                onClick={async () => {
                  const num = Number(numQuestionsToGenerate);
                  if (!num || num < 1) return alert("Enter a valid number of questions.");
                  
                  const exam = exams.items.find((e) => e.id === examId);
                  const subject = activeSubjects.find((s) => s.id === subjectId);
                  const topic = activeTopics.find((t) => t.id === topicId);
                  
                  if (!exam) return alert("Please select an Exam first to provide context for AI.");
                  
                  setGenerating(true);
                  try {
                    const result = await generateTestWithAI({
                      examName: exam?.name,
                      subjectName: subject?.name,
                      topicName: topic?.name,
                      isFullTest: isFullTestMode,
                      numQuestions: num,
                      marks: marksPerQuestion,
                      negativeMarks: negativeMarkingPerWrongAnswer
                    });
                    
                    if (result.success && result.questions) {
                      setQuestions(current => [
                        ...current,
                        ...result.questions.map(q => ({
                          questionText: q.questionText || "",
                          options: (q.options || ["", "", "", ""]).concat(["", "", "", ""]).slice(0, 4),
                          correctOptionIndex: q.correctOptionIndex || 0,
                          marks: q.marks !== undefined ? q.marks : marksPerQuestion,
                          negativeMarks: q.negativeMarks !== undefined ? q.negativeMarks : negativeMarkingPerWrongAnswer,
                        }))
                      ]);
                      alert("Successfully generated " + result.questions.length + " questions!");
                    } else {
                      alert(result.error || "Failed to generate questions.");
                    }
                  } catch (err) {
                    alert("Error: " + err.message);
                  } finally {
                    setGenerating(false);
                  }
                }}
              >
                {generating ? "Generating..." : "Auto-Generate (AI)"}
              </button>
            </div>
            
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 border border-blue-700 bg-blue-50 px-3 text-sm font-semibold text-blue-800 hover:bg-blue-100">
              {parsing ? "Parsing AI..." : "Upload Paper (AI)"}
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,application/pdf"
                disabled={parsing}
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  setParsing(true);
                  try {
                    const formData = new FormData();
                    formData.append("file", file);
                    const result = await parseTestFile(formData);
                    if (result.success && result.questions && result.questions.length > 0) {
                      setQuestions(result.questions.map(q => ({
                        questionText: q.questionText || "",
                        options: (q.options || ["", "", "", ""]).concat(["", "", "", ""]).slice(0, 4),
                        correctOptionIndex: q.correctOptionIndex || 0,
                        marks: q.marks !== undefined ? q.marks : marksPerQuestion,
                        negativeMarks: q.negativeMarks !== undefined ? q.negativeMarks : negativeMarkingPerWrongAnswer,
                      })));
                      alert("Successfully extracted " + result.questions.length + " questions!");
                    } else {
                      alert(result.error || "Could not extract any questions from the document.");
                    }
                  } catch (error) {
                    alert("Error parsing document: " + error.message);
                  } finally {
                    setParsing(false);
                    event.target.value = null;
                  }
                }}
              />
            </label>
            <button
              className="inline-flex min-h-10 items-center gap-2 border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-white"
              onClick={() => setQuestions((current) => [...current, makeQuestion(marksPerQuestion, negativeMarkingPerWrongAnswer)])}
              type="button"
            >
              <Plus aria-hidden="true" className="h-4 w-4" /> Add question
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {questions.map((question, questionIndex) => {
            const qMarks = question.marks !== undefined && question.marks !== "" ? question.marks : marksPerQuestion;
            const qNegative = question.negativeMarks !== undefined && question.negativeMarks !== "" ? question.negativeMarks : negativeMarkingPerWrongAnswer;
            return (
              <section className="border border-slate-200 bg-white p-4 sm:p-5" key={questionIndex}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-950">Question {questionIndex + 1}</h4>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                      +{qMarks} / -{qNegative || 0}
                    </span>
                  </div>
                  {questions.length > 1 && (
                    <button
                      aria-label={`Remove question ${questionIndex + 1}`}
                      className="grid h-9 w-9 place-items-center text-slate-500 hover:bg-red-50 hover:text-red-700"
                      onClick={() => setQuestions((current) => current.filter((_, index) => index !== questionIndex))}
                      type="button"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <label className="mt-4 grid gap-1.5 text-sm font-medium text-slate-700">
                  Question text
                  <textarea
                    className="min-h-24 resize-y border border-slate-300 bg-white p-3 text-slate-950"
                    onChange={(event) => updateQuestion(questionIndex, "questionText", event.target.value)}
                    required
                    value={question.questionText}
                  />
                </label>

                <label className="mt-3 grid gap-1.5 text-sm font-medium text-slate-700">
                  Image (Optional)
                  <input
                    className="flex h-10 w-full items-center border border-slate-300 bg-white px-3 text-slate-950 file:mr-4 file:h-full file:border-0 file:bg-slate-100 file:px-4 file:text-sm file:font-semibold hover:file:bg-slate-200"
                    type="file"
                    accept="image/*"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        updateQuestion(questionIndex, "imageUrl", reader.result);
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  {question.imageUrl && (
                    <div className="mt-2 flex items-start gap-3">
                      <img src={question.imageUrl} alt="Preview" className="h-20 w-auto rounded border border-slate-200 object-contain" />
                      <button 
                        type="button" 
                        onClick={() => updateQuestion(questionIndex, "imageUrl", "")}
                        className="text-xs font-semibold text-red-600 hover:text-red-800"
                      >
                        Remove image
                      </button>
                    </div>
                  )}
                </label>

                <fieldset className="mt-4 grid gap-3 sm:grid-cols-2">
                  <legend className="mb-2 text-sm font-medium text-slate-700">Options · select the correct answer</legend>
                  {question.options.map((option, optionIndex) => (
                    <label
                      className={`flex min-h-11 items-center gap-2 border px-3 transition-colors ${
                        question.correctOptionIndex === optionIndex ? "border-emerald-600 bg-emerald-50" : "border-slate-300 bg-white"
                      }`}
                      key={`${questionIndex}-${optionIndex}`}
                    >
                      <input
                        checked={question.correctOptionIndex === optionIndex}
                        className="accent-emerald-700"
                        name={`correct-question-${questionIndex}`}
                        onChange={() => updateQuestion(questionIndex, "correctOptionIndex", optionIndex)}
                        type="radio"
                      />
                      <span className="shrink-0 text-xs font-semibold text-slate-500">{String.fromCharCode(65 + optionIndex)}</span>
                      <input
                        aria-label={`Option ${String.fromCharCode(65 + optionIndex)}`}
                        className="min-w-0 flex-1 bg-transparent py-2 text-sm text-slate-950 outline-none"
                        onChange={(event) => updateOption(questionIndex, optionIndex, event.target.value)}
                        required
                        value={option}
                      />
                    </label>
                  ))}
                </fieldset>

                {/* Per-question Marks and Negative Marking */}
                <div className="mt-4 rounded border border-slate-200 bg-slate-50/70 p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1 text-xs font-semibold text-slate-700">
                      <span>Marks (correct answer)</span>
                      <input
                        className="h-9 border border-slate-300 bg-white px-2.5 text-sm text-slate-950"
                        min="0.25"
                        onChange={(event) => updateQuestion(questionIndex, "marks", event.target.value)}
                        step="0.25"
                        type="number"
                        value={question.marks}
                      />
                    </label>
                    <label className="grid gap-1 text-xs font-semibold text-slate-700">
                      <span>Negative marking (wrong attempt)</span>
                      <input
                        className="h-9 border border-slate-300 bg-white px-2.5 text-sm text-slate-950"
                        min="0"
                        onChange={(event) => updateQuestion(questionIndex, "negativeMarks", event.target.value)}
                        step="0.25"
                        type="number"
                        value={question.negativeMarks}
                      />
                    </label>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-800">
                      +{qMarks} marks on correct
                    </span>
                    <span className="inline-flex items-center rounded border border-red-200 bg-red-50 px-2 py-0.5 font-semibold text-red-800">
                      {Number(qNegative) > 0 ? `-${qNegative} on wrong attempt` : "No negative mark"}
                    </span>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <button
          className="inline-flex min-h-11 items-center gap-2 bg-blue-700 px-5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
          disabled={saving || !isFirebaseConfigured}
          type="submit"
        >
          <BookOpenCheck aria-hidden="true" className="h-4 w-4" />
          {saving ? "Publishing…" : isFullTestMode ? "Publish full mock test" : "Publish practice test"}
        </button>
      </form>

      <aside className="h-fit border-t border-slate-200 pt-5 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
        <h2 className="text-sm font-semibold text-slate-950">
          {isFullTestMode ? "Published full mock tests" : "Published practice tests"}
        </h2>
        <p className="mt-1 text-xs text-slate-500">{filteredTests.length} total</p>
        <div className="mt-4 divide-y divide-slate-200">
          {filteredTests.length === 0 ? (
            <p className="py-4 text-sm text-slate-500">
              {isFullTestMode ? "No full mock tests published yet." : "No practice tests published yet."}
            </p>
          ) : (
            filteredTests.map((test) => (
              <div className="flex items-start justify-between gap-3 py-3" key={test.id}>
                <div className="min-w-0">
                  <p className="wrap-break-word text-sm font-medium text-slate-900">{test.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {[
                      exams.items.find((e) => e.id === test.examId)?.name,
                      !isFullTestMode && test.subjectId ? "Subject drill" : undefined,
                    ].filter(Boolean).join(" · ")}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-700">
                      {test.questions?.length || 0} questions
                    </span>
                    <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-800">
                      +{test.marksPerQuestion || 1} mark{test.marksPerQuestion === 1 ? "" : "s"}
                    </span>
                    {Number(test.negativeMarkingPerWrongAnswer) > 0 ? (
                      <span className="rounded border border-red-200 bg-red-50 px-1.5 py-0.5 font-medium text-red-800">
                        -{test.negativeMarkingPerWrongAnswer} wrong
                      </span>
                    ) : (
                      <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-slate-500">
                        No negative
                      </span>
                    )}
                  </div>
                </div>
                <button
                  aria-label={`Delete ${test.title}`}
                  className="grid h-9 w-9 shrink-0 place-items-center text-slate-500 hover:bg-red-50 hover:text-red-700"
                  onClick={() => removeTest(test)}
                  type="button"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}