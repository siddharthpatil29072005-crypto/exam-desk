"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function generateTestWithAI({ examName, subjectName, topicName, isFullTest, numQuestions, marks, negativeMarks }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      throw new Error("You must be an admin to use AI features.");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in .env.local.");
    }

    const ai = new GoogleGenAI({ apiKey });

    let prompt = `You are an expert test creator. Generate exactly ${numQuestions} multiple-choice questions.`;
    
    if (examName) prompt += `\nExam Context: ${examName}`;
    if (subjectName) prompt += `\nSubject: ${subjectName}`;
    if (topicName) prompt += `\nTopic: ${topicName}`;
    
    if (isFullTest) {
      prompt += `\nThis is a full mock test, so the questions should cover a comprehensive range of topics within this subject/exam.`;
    } else {
      prompt += `\nThis is a specific practice drill, so focus deeply on the provided subject and topic.`;
    }

    prompt += `\nEnsure the difficulty is appropriate and the questions are highly realistic. Each question must have exactly 4 options.`;

    let response;
    let attempts = 0;
    while (attempts < 5) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  questionText: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctOptionIndex: { type: Type.INTEGER },
                  marks: { type: Type.NUMBER },
                  negativeMarks: { type: Type.NUMBER },
                },
                required: ["questionText", "options", "correctOptionIndex", "marks", "negativeMarks"],
              },
            },
          },
        });
        break;
      } catch (err) {
        attempts++;
        const isRateLimit = err.message.includes("503") || err.message.includes("429");
        if (attempts >= 5 || !isRateLimit) {
          throw err;
        }
        // Wait 2s, 4s, 8s, 16s...
        await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempts)));
      }
    }

    const text = response.text;
    const questions = JSON.parse(text);
    return { success: true, questions };
  } catch (error) {
    console.error("Generation error:", error);
    let errorMessage = error.message;
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.error && parsed.error.message) {
        errorMessage = parsed.error.message;
      }
    } catch(e) {}
    return { success: false, error: errorMessage || "Failed to generate questions." };
  }
}
