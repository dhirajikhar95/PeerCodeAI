import { Inngest } from "inngest";
import { connectDB } from "./db.js";
import User from "../models/User.js";
import { deleteStreamUser, upsertStreamUser } from "./stream.js";

export const inngest = new Inngest({ id: "talent-iq" });

const syncUser = inngest.createFunction(
  { id: "sync-user" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();

    const { id, email_addresses, first_name, last_name, image_url } = event.data;

    const newUser = {
      clerkId: id,
      email: email_addresses[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`,
      profileImage: image_url,
      role: null,
    };

    await User.create(newUser);

    await upsertStreamUser({
      id: newUser.clerkId.toString(),
      name: newUser.name,
      image: newUser.profileImage,
    });
  }
);

const deleteUserFromDB = inngest.createFunction(
  { id: "delete-user-from-db" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    await connectDB();

    const { id } = event.data;
    await User.deleteOne({ clerkId: id });

    await deleteStreamUser(id.toString());
  }
);

const analyzeSession = inngest.createFunction(
  { id: "analyze-session" },
  { event: "session/ended" },
  async ({ event }) => {

    await connectDB();

    const { sessionId } = event.data;

    const Session = (await import("../models/Session.js")).default;
    const Question = (await import("../models/Question.js")).default;
    const AIFeedback = (await import("../models/AIFeedback.js")).default;
    const { analyzeStudentCode } = await import("./aiService.js");

    const session = await Session.findById(sessionId);

    if (!session) {
      return { error: "Session not found" };
    }

    const studentId = session.participant || null;

    // Use the feedbackType determined at session end
    const feedbackType = session.feedbackType || "student_only";


    // Get question data if available
    let question = null;
    if (session.questionId) {
      question = await Question.findById(session.questionId);
    }

    const questionData = question || {
      title: session.problem || "Coding Problem",
      description: "Solve the given coding problem",
      difficulty: session.difficulty || "medium",
      inputFormat: "",
      outputFormat: "",
      testCases: [],
    };

    // ========== CASE 3: No Student Code ==========
    if (feedbackType === "no_student_code") {
      const noCodeFeedback = {
        sessionId: session._id,
        studentId: studentId,
        problemId: session.questionId || null,
        feedbackType: "no_student_code",
        teacherCode: session.teacherCodeSnapshot || "",
        studentCode: "",
        correctness: "Unable to analyze",
        logicFeedback: "No code was written by the student during this session. The teacher provided the complete solution.",
        timeComplexity: "N/A",
        spaceComplexity: "N/A",
        commonMistake: "Student did not attempt the problem",
        improvementSuggestion: "Start by attempting the problem yourself, even if you're unsure. Writing code—even with mistakes—helps you learn and allows the AI to provide personalized feedback on your approach.",
        conceptTags: [],
        score: 0,
        testCaseResults: session.testCaseResults || [],
        testCaseSummary: session.testCaseSummary || { total: 0, passed: 0, failed: 0 },
      };

      await AIFeedback.findOneAndUpdate(
        { sessionId: session._id },
        noCodeFeedback,
        { upsert: true, new: true }
      );

      session.aiFeedback = {
        status: "completed",
        feedbackType: "no_student_code",
        score: 0,
      };
      await session.save();


      return { success: true, feedbackType: "no_student_code" };
    }

    // ========== CASE 1 & 2: AI Analysis Needed ==========
    const codeToAnalyze = session.studentCodeSnapshot;

    if (!codeToAnalyze) {
      return { error: "No student code" };
    }

    try {


      // Build test results info for AI prompt
      let testResultsInfo = "";
      if (session.testCaseSummary && session.testCaseSummary.total > 0) {
        testResultsInfo = `\n\nTest Case Results:
- Total: ${session.testCaseSummary.total}
- Passed: ${session.testCaseSummary.passed}
- Failed: ${session.testCaseSummary.failed}`;

        if (session.testCaseResults && session.testCaseResults.length > 0) {
          const failedCases = session.testCaseResults.filter(tc => !tc.passed);
          if (failedCases.length > 0) {
            testResultsInfo += "\n\nFailed test cases:";
            failedCases.slice(0, 3).forEach((tc, i) => {
              testResultsInfo += `\n${i + 1}. Input: ${tc.input}, Expected: ${tc.expected}, Got: ${tc.actual}`;
            });
          }
        }
      }

      const aiResponse = await analyzeStudentCode(
        codeToAnalyze,
        questionData,
        session.language || "javascript",
        testResultsInfo
      );



      const feedback = {
        sessionId: session._id,
        studentId: studentId,
        problemId: session.questionId || null,
        feedbackType,
        studentCode: session.studentCodeSnapshot || "",
        teacherCode: feedbackType === "teacher_assisted" ? session.teacherCodeSnapshot : "",
        correctness: aiResponse.correctness || "Unable to analyze",
        logicFeedback: aiResponse.logic_feedback || "No feedback available",
        timeComplexity: aiResponse.time_complexity || "Not determined",
        spaceComplexity: aiResponse.space_complexity || "Not determined",
        commonMistake: aiResponse.common_mistake || "None identified",
        improvementSuggestion: aiResponse.improvement_suggestion || "",
        conceptTags: Array.isArray(aiResponse.concept_tags) ? aiResponse.concept_tags : [],
        score: typeof aiResponse.score === "number" ? aiResponse.score : 0,
        testCaseResults: session.testCaseResults || [],
        testCaseSummary: session.testCaseSummary || { total: 0, passed: 0, failed: 0 },
      };

      const savedFeedback = await AIFeedback.findOneAndUpdate(
        { sessionId: session._id },
        feedback,
        { upsert: true, new: true }
      );



      session.aiFeedback = {
        feedbackId: savedFeedback._id,
        status: "completed",
        feedbackType,
        score: feedback.score,
        correctness: feedback.correctness,
      };
      await session.save();


      return { success: true, feedbackId: savedFeedback._id, feedbackType };
    } catch (error) {
      console.error("❌ AI analysis failed:", error.message);

      const errorFeedback = {
        sessionId: session._id,
        studentId: session.participant || null,
        problemId: session.questionId || null,
        feedbackType,
        studentCode: session.studentCodeSnapshot || "",
        teacherCode: session.teacherCodeSnapshot || "",
        correctness: "Unable to analyze",
        logicFeedback: "AI analysis encountered an error. Please ask your teacher for feedback.",
        timeComplexity: "Unknown",
        spaceComplexity: "Unknown",
        commonMistake: "Analysis failed",
        improvementSuggestion: "Try submitting again or consult your teacher.",
        conceptTags: [],
        score: 0,
        testCaseResults: session.testCaseResults || [],
        testCaseSummary: session.testCaseSummary || { total: 0, passed: 0, failed: 0 },
      };

      await AIFeedback.findOneAndUpdate(
        { sessionId: session._id },
        errorFeedback,
        { upsert: true, new: true }
      );

      session.aiFeedback = {
        status: "error",
        error: error.message,
      };
      await session.save();

      return { error: error.message };
    }
  }
);

export const functions = [syncUser, deleteUserFromDB, analyzeSession];
