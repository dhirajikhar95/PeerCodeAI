import { GoogleGenerativeAI } from "@google/generative-ai";
import { ENV } from "./env.js";

const genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeStudentCode = async (studentCode, question, language = "javascript", testResultsInfo = "", retryCount = 0) => {
    const MAX_RETRIES = 3;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

        const prompt = `You are an expert coding tutor analyzing a student's code submission. Write feedback in third person (refer to "the student", never use "you" or "your"). Keep language simple, clear, and encouraging.

**Problem:**
Title: ${question.title}
Difficulty: ${question.difficulty}
Description: ${question.description}

**Input Format:** ${question.inputFormat || "Not specified"}
**Output Format:** ${question.outputFormat || "Not specified"}

**Test Cases:**
${question.testCases?.map((tc, idx) => `Test ${idx + 1}:
Input: ${tc.input}
Expected Output: ${tc.output}`).join("\n\n") || "No test cases provided"}

**Programming Language:** ${language}

**Student's Submitted Code:**
\`\`\`${language}
${studentCode || "(No code submitted)"}
\`\`\`
${testResultsInfo ? `
**Actual Test Execution Results:**
${testResultsInfo}

IMPORTANT: Use these actual test execution results in the analysis. If tests failed, the solution has issues. Factor test pass rate into the score.
` : ""}
Analyze the student's code and provide feedback in the following EXACT JSON structure. This structure is critical - do not add or remove any fields:

{
  "correctness": "Correct" | "Partially Correct" | "Incorrect",
  "logic_feedback": "Detailed explanation of the student's approach, what was done well, and areas that need improvement. Use third person only.",
  "time_complexity": "O(?) - brief explanation of the time complexity",
  "space_complexity": "O(?) - brief explanation of the space complexity",
  "common_mistake": "Description of the main issue or common mistake made, or 'None identified' if the code is correct",
  "improvement_suggestion": "Specific, actionable suggestion for how to improve the solution. Written in third person.",
  "concept_tags": ["array", "loop", "recursion"],
  "score": 0-100
}

Guidelines:
- Be constructive and encouraging - this is for learning, not judgment
- ALWAYS use third person: "the student" instead of "you/your"
- Keep explanations simple and easy to understand for beginners
- The "concept_tags" should be lowercase, common programming concepts
- If the student submitted no code or empty code, give a score of 0
- If test cases were provided and failed, reflect this in the correctness and score
- Score breakdown: correctness (40%), efficiency (20%), code quality (20%), test pass rate (20%)
- Focus on helping the student understand WHY something is correct or incorrect

Return ONLY the JSON object, no additional text or markdown formatting.`;


        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Robust JSON extraction
        let jsonText = text.trim();

        // Try to extract from markdown code blocks first
        const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
            jsonText = jsonMatch[1].trim();
        }

        // Try to find JSON object pattern if not in code block
        if (!jsonText.startsWith('{')) {
            const objectMatch = text.match(/\{[\s\S]*\}/);
            if (objectMatch) {
                jsonText = objectMatch[0];
            }
        }

        // Clean up common JSON issues
        jsonText = jsonText
            .replace(/,\s*}/g, '}')  // Remove trailing commas
            .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
            .replace(/[\x00-\x1F\x7F]/g, ' '); // Remove control characters

        let feedback;
        try {
            feedback = JSON.parse(jsonText);
        } catch (parseError) {
            console.error("JSON parse error, attempting fix:", parseError.message);
            // Try to fix truncated JSON by closing it
            let fixedJson = jsonText;
            const openBraces = (jsonText.match(/{/g) || []).length;
            const closeBraces = (jsonText.match(/}/g) || []).length;
            if (openBraces > closeBraces) {
                fixedJson += '"}' + '}'.repeat(openBraces - closeBraces - 1);
            }
            try {
                feedback = JSON.parse(fixedJson);
            } catch {
                // Return structured fallback if all parsing fails
                throw new Error("AI returned unparseable response");
            }
        }

        // Validate required fields exist
        const requiredFields = ["correctness", "logic_feedback", "time_complexity", "space_complexity", "common_mistake", "improvement_suggestion", "concept_tags", "score"];
        for (const field of requiredFields) {
            if (!(field in feedback)) {
                feedback[field] = field === "concept_tags" ? [] : field === "score" ? 0 : "Not available";
            }
        }

        return feedback;
    } catch (error) {
        // Handle rate limit errors with retry
        if (error.status === 429 && retryCount < MAX_RETRIES) {
            const waitTime = Math.pow(2, retryCount + 1) * 30000; // 60s, 120s, 240s
            console.log(`Rate limited. Retrying in ${waitTime / 1000}s... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
            await delay(waitTime);
            return analyzeStudentCode(studentCode, question, language, testResultsInfo, retryCount + 1);
        }

        console.error("Error in AI analysis:", error);
        return {
            correctness: "Unable to analyze",
            logic_feedback: error.status === 429
                ? "AI service is temporarily unavailable due to rate limits. Please try again later or ask your teacher for feedback."
                : "An error occurred during analysis. Please try again or consult with your teacher.",
            time_complexity: "Unknown",
            space_complexity: "Unknown",
            common_mistake: "Analysis failed due to technical error",
            improvement_suggestion: "Please submit your code again or ask your teacher for feedback.",
            concept_tags: [],
            score: 0,
            error: error.message,
        };
    }
};

/**
 * Direct AI session analysis (fallback when Inngest is unavailable)
 * This function performs the same analysis as the Inngest function but runs directly
 */
export const analyzeSessionDirect = async (sessionId) => {
    console.log(`[AI-Direct] Starting analysis for session: ${sessionId}`);

    try {
        const { connectDB } = await import("./db.js");
        await connectDB();

        const Session = (await import("../models/Session.js")).default;
        const Question = (await import("../models/Question.js")).default;
        const AIFeedback = (await import("../models/AIFeedback.js")).default;

        const session = await Session.findById(sessionId);

        if (!session) {
            console.error(`[AI-Direct] Session ${sessionId} not found`);
            return { error: "Session not found" };
        }

        // Use session.participant if available, otherwise try to find the student
        const studentId = session.participant || null;
        console.log(`[AI-Direct] Session found. feedbackType=${session.feedbackType}, studentId=${studentId}, aiFeedbackEnabled=${session.aiFeedbackEnabled}`);

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

        // Case 3: No Student Code
        if (feedbackType === "no_student_code") {
            console.log(`[AI-Direct] Case 3: No student code. Saving no-code feedback.`);
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

        // Case 1 & 2: AI Analysis Needed
        const codeToAnalyze = session.studentCodeSnapshot;

        if (!codeToAnalyze) {
            console.error(`[AI-Direct] No student code snapshot found for session ${sessionId}`);
            return { error: "No student code" };
        }

        console.log(`[AI-Direct] Case ${feedbackType === "teacher_assisted" ? 2 : 1}: Calling Gemini AI for analysis. Code length: ${codeToAnalyze.length} chars`);



        // Build test results info
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
        console.error("❌ Direct AI analysis error:", error.message);

        // Save error feedback
        try {
            const Session = (await import("../models/Session.js")).default;
            const AIFeedback = (await import("../models/AIFeedback.js")).default;

            const session = await Session.findById(sessionId);
            if (session) {
                const errorFeedback = {
                    sessionId: session._id,
                    studentId: session.participant,
                    problemId: session.questionId || null,
                    feedbackType: session.feedbackType || "student_only",
                    studentCode: session.studentCodeSnapshot || "",
                    teacherCode: session.teacherCodeSnapshot || "",
                    correctness: "Unable to analyze",
                    logicFeedback: "An error occurred during analysis. Please try again or consult with your teacher.",
                    timeComplexity: "Unknown",
                    spaceComplexity: "Unknown",
                    commonMistake: "Analysis failed due to technical error",
                    improvementSuggestion: "Please submit your code again or ask your teacher for feedback.",
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

                session.aiFeedback = { status: "error", error: error.message };
                await session.save();
            }
        } catch (saveError) {
            console.error("❌ Failed to save error feedback:", saveError.message);
        }

        return { error: error.message };
    }
};
