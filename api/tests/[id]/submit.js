import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdmin } from "../../../src/lib/firebase-admin-core.js";

const allowedMethods = "POST, OPTIONS";

function applyCors(request, response) {
  const origin = request.headers.origin;
  if (!origin) return true;

  const host = request.headers.host;
  if (host && (origin === `https://${host}` || origin === `http://${host}`)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Access-Control-Allow-Methods", allowedMethods);
    response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
    response.setHeader("Vary", "Origin");
    return true;
  }

  const allowedOrigins = (process.env.SCORING_ALLOWED_ORIGINS || "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (!allowedOrigins.includes(origin)) return false;

  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Methods", allowedMethods);
  response.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  response.setHeader("Access-Control-Max-Age", "600");
  response.setHeader("Vary", "Origin");
  return true;
}

function fail(response, status, message) {
  return response.status(status).json({ error: message });
}

export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (!applyCors(request, response)) {
    return fail(response, 403, "This origin is not allowed to submit tests.");
  }

  if (request.method === "OPTIONS") return response.status(204).end();
  if (request.method !== "POST") {
    response.setHeader("Allow", allowedMethods);
    return fail(response, 405, "Method not allowed.");
  }

  const idValue = request.query.id;
  const testId = Array.isArray(idValue) ? idValue[0] : idValue;
  if (typeof testId !== "string" || !testId) return fail(response, 400, "Test ID is required.");

  const services = getFirebaseAdmin();
  if (!services) return fail(response, 503, "Server Firebase credentials are not configured.");

  let account = null;
  const authorization = request.headers.authorization;
  if (authorization) {
    const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
    if (!token) return fail(response, 401, "Invalid authorization header.");
    try {
      account = await services.auth.verifyIdToken(token);
    } catch {
      return fail(response, 401, "Your session expired. Sign in again and retry.");
    }
  }

  let body = request.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return fail(response, 400, "Request body must be valid JSON.");
    }
  }
  if (!Array.isArray(body?.answers)) return fail(response, 400, "Answers must be an array.");

  try {
    const [testSnapshot, keySnapshot] = await Promise.all([
      services.db.collection("tests").doc(testId).get(),
      services.db.collection("answerKeys").doc(testId).get(),
    ]);
    if (!testSnapshot.exists || !keySnapshot.exists) return fail(response, 404, "Test not found.");

    const test = testSnapshot.data();
    const questions = test.questions || [];
    const correctOptionIndices = keySnapshot.data().correctOptionIndices;
    if (
      questions.length === 0 ||
      body.answers.length !== questions.length ||
      !Array.isArray(correctOptionIndices) ||
      correctOptionIndices.length !== questions.length
    ) {
      return fail(response, 409, "Test data is incomplete.");
    }

    const selectedOptionIndices = body.answers.map((answer, index) => {
      if (answer === null) return null;
      if (!Number.isInteger(answer) || answer < 0 || answer >= questions[index].options.length) return undefined;
      return answer;
    });
    if (selectedOptionIndices.some((answer) => answer === undefined)) {
      return fail(response, 400, "One or more selected options are invalid.");
    }

    let score = 0;
    let correctAnswers = 0;
    let incorrectAnswers = 0;
    const defaultNegativeMarking = Number(test.negativeMarkingPerWrongAnswer || 0);
    const defaultMarksPerQuestion = Number(test.marksPerQuestion || 1);

    const answerReview = questions.map((question, index) => {
      const correctOptionIndex = correctOptionIndices[index];
      if (!Number.isInteger(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex >= question.options.length) {
        throw new Error("Stored answer key is invalid.");
      }

      const selectedOptionIndex = selectedOptionIndices[index];
      const marks = Number(
        question.marks !== undefined && question.marks !== "" && question.marks !== null
          ? question.marks
          : defaultMarksPerQuestion
      );
      const negativeMarks = Number(
        question.negativeMarks !== undefined && question.negativeMarks !== "" && question.negativeMarks !== null
          ? question.negativeMarks
          : (question.negativeMarkingPerWrongAnswer !== undefined && question.negativeMarkingPerWrongAnswer !== "" && question.negativeMarkingPerWrongAnswer !== null
            ? question.negativeMarkingPerWrongAnswer
            : defaultNegativeMarking)
      );

      if (selectedOptionIndex === correctOptionIndex) {
        score += marks;
        correctAnswers += 1;
      } else if (selectedOptionIndex !== null) {
        score -= negativeMarks;
        incorrectAnswers += 1;
      }

      return {
        id: question.id || `question-${index + 1}`,
        questionText: question.questionText,
        options: question.options,
        correctOptionIndex,
        selectedOptionIndex,
        marks,
        negativeMarks,
        negativeMarkingPerWrongAnswer: negativeMarks,
      };
    });

    score = Math.round(score * 100) / 100;
    const totalMarks = Math.round(
      answerReview.reduce((sum, item) => sum + item.marks, 0) * 100
    ) / 100;

    const result = {
      userId: account?.uid || "guest",
      userEmail: account?.email || "guest",
      testId,
      testTitle: test.title,
      score,
      totalMarks,
      percentage: totalMarks ? Math.round((score / totalMarks) * 100) : 0,
      correctAnswers,
      incorrectAnswers,
      totalQuestions: questions.length,
      negativeMarkingPerWrongAnswer,
      submittedAt: new Date().toISOString(),
      answerReview,
    };

    if (account) {
      const resultReference = await services.db.collection("results").add({
        ...result,
        submittedAt: FieldValue.serverTimestamp(),
        createdAt: FieldValue.serverTimestamp(),
      });
      result.id = resultReference.id;
    }

    return response.status(200).json({ result });
  } catch (error) {
    console.error("Test submission failed:", error);
    return fail(response, 500, "Unable to score this test right now.");
  }
}