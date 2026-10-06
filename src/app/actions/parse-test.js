"use server";

import { GoogleGenAI, Type } from "@google/genai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function parseTestFile(formData) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "admin") {
      throw new Error("You must be an admin to use AI features.");
    }

    const file = formData.get("file");
    if (!file) throw new Error("No file uploaded.");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in .env.local. Please add it to use AI parsing.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    const buffer = Buffer.from(await file.arrayBuffer());
    
    let mimeType = file.type;
    if (file.name.toLowerCase().endsWith(".pdf")) mimeType = "application/pdf";
    else if (!mimeType) mimeType = "image/jpeg";

    let response;
    let attempts = 0;
    while (attempts < 5) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    data: buffer.toString("base64"),
                    mimeType,
                  },
                },
                {
                  text: "Extract all the multiple-choice questions from this document. If there are no explicitly marked options, try to deduce them or leave them blank. Return a JSON array.",
                },
              ],
            },
          ],
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
        await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempts)));
      }
    }

    const text = response.text;
    const questions = JSON.parse(text);
    return { success: true, questions };
  } catch (error) {
    console.error("Parse error:", error);
    let errorMessage = error.message;
    try {
      const parsed = JSON.parse(error.message);
      if (parsed.error && parsed.error.message) {
        errorMessage = parsed.error.message;
      }
    } catch(e) {}
    return { success: false, error: errorMessage || "Failed to parse document." };
  }
}
