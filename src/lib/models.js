import mongoose from "mongoose";

// Helper to make models safely in Next.js HMR environment
const getModel = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

const ExamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const SubjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  examId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const TopicSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  subjectId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const NoteSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  examId: { type: String },
  subjectId: { type: String },
  topicId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const QuestionSchema = new mongoose.Schema({
  questionText: String,
  imageUrl: String,
  options: [String],
  correctOptionIndex: Number,
  marks: Number,
  negativeMarks: Number
});

const TestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  examId: { type: String, required: true },
  subjectId: { type: String },
  topicId: { type: String },
  isFullTest: { type: Boolean, default: false },
  durationMinutes: { type: Number, default: 0 },
  timePerQuestionSeconds: { type: Number, default: 0 },
  marksPerQuestion: { type: Number, default: 1 },
  negativeMarkingPerWrongAnswer: { type: Number, default: 0 },
  questions: [QuestionSchema],
  createdAt: { type: Date, default: Date.now }
});

const AnswerKeySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  correctOptionIndices: [Number]
});

const ResultSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  testId: String,
  testTitle: String,
  userId: String,
  score: Number,
  totalMaxMarks: Number,
  percentage: Number,
  details: mongoose.Schema.Types.Mixed,
  submittedAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now }
});

export const Exam = getModel("Exam", ExamSchema);
export const Subject = getModel("Subject", SubjectSchema);
export const Topic = getModel("Topic", TopicSchema);
export const Note = getModel("Note", NoteSchema);
export const Test = getModel("Test", TestSchema);
export const AnswerKey = getModel("AnswerKey", AnswerKeySchema);
export const Result = getModel("Result", ResultSchema);
export const User = getModel("User", UserSchema);
