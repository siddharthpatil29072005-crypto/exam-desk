"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { Exam, Subject, Topic, Note, Test, AnswerKey, Result } from "@/lib/models";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const modelsMap = {
  exams: Exam,
  subjects: Subject,
  topics: Topic,
  notes: Note,
  tests: Test,
  answerKeys: AnswerKey,
  results: Result
};

// Check if user is admin
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || session.user.role !== "admin") {
    throw new Error("permission-denied: You must be an admin to perform this action.");
  }
  return session.user;
}

export async function fetchCollectionAction(collectionName) {
  try {
    if (collectionName === "answerKeys") {
      await requireAdmin();
    }

    const Model = modelsMap[collectionName];
    if (!Model) throw new Error("Invalid collection name: " + collectionName);
    
    await connectToDatabase();
    
    // For results, if not admin, only return the user's own results
    let filter = {};
    if (collectionName === "results") {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) return { success: true, data: [] };
      if (session.user.role !== "admin") {
        const uId = session.user.id || session.user.email;
        const uEmail = session.user.email;
        const matchArray = [{ userId: uId }];
        if (uEmail && uEmail !== uId) matchArray.push({ userId: uEmail });
        filter = { $or: matchArray };
      }
    }

    const data = await Model.find(filter).lean();
    return { success: true, data: JSON.parse(JSON.stringify(data)) };
  } catch (error) {
    console.error("fetchCollectionAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function getTestSubmissionStatusAction(testId) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return { success: true, hasSubmitted: false };

    await connectToDatabase();
    const uId = session.user.id || session.user.email;
    const uEmail = session.user.email;
    const matchArray = [{ userId: uId }];
    if (uEmail && uEmail !== uId) matchArray.push({ userId: uEmail });
    
    const result = await Result.findOne({ testId, $or: matchArray }).lean();
    if (!result) return { success: true, hasSubmitted: false };

    const answerKey = await AnswerKey.findOne({ id: testId }).lean();
    
    return { 
      success: true, 
      hasSubmitted: true, 
      resultData: JSON.parse(JSON.stringify(result)),
      correctOptionIndices: answerKey ? answerKey.correctOptionIndices : []
    };
  } catch (error) {
    console.error("getTestSubmissionStatusAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function createRecordAction(collectionName, values) {
  try {
    // Only Results can be created by regular users (or logged out users, depending on your choice, but we'll require admin for all others)
    if (collectionName !== "results") {
      await requireAdmin();
    }

    const Model = modelsMap[collectionName];
    if (!Model) throw new Error("Invalid collection name: " + collectionName);
    
    await connectToDatabase();
    
    const id = values.id || Math.random().toString(36).substring(2, 15);
    const doc = new Model({ ...values, id });
    await doc.save();
    
    return { success: true, id };
  } catch (error) {
    console.error("createRecordAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteRecordAction(collectionName, id) {
  try {
    // Only admins can delete records
    await requireAdmin();

    const Model = modelsMap[collectionName];
    if (!Model) throw new Error("Invalid collection name: " + collectionName);
    
    await connectToDatabase();
    
    await Model.deleteOne({ id });
    return { success: true };
  } catch (error) {
    console.error("deleteRecordAction error:", error);
    return { success: false, error: error.message };
  }
}
