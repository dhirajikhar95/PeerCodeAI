import AIFeedback from "../models/AIFeedback.js";
import Session from "../models/Session.js";

// Get AI feedback for a specific session
export async function getAIFeedbackBySession(req, res) {
    try {
        const { sessionId } = req.params;

        const feedback = await AIFeedback.findOne({ sessionId })
            .populate("studentId", "name email profileImage")
            .populate("problemId", "title difficulty");

        if (!feedback) {
            // Check if session exists and what its status is
            const session = await Session.findById(sessionId).select("status aiFeedback sessionType");

            if (!session) {
                return res.status(404).json({
                    status: "not_found",
                    message: "Session not found"
                });
            }

            // Class sessions don't generate individual AI feedback
            if (session.sessionType === "class") {
                return res.status(404).json({
                    status: "not_applicable",
                    message: "AI feedback is not generated for class sessions"
                });
            }

            // Session is still active
            if (session.status === "active") {
                return res.status(202).json({
                    status: "pending",
                    message: "Session is still in progress"
                });
            }

            // Session ended but feedback not ready yet
            if (session.aiFeedback?.status === "processing" || !session.aiFeedback) {
                return res.status(202).json({
                    status: "processing",
                    message: "AI is analyzing your code. This may take a few moments."
                });
            }

            // Feedback generation failed
            if (session.aiFeedback?.status === "error") {
                return res.status(500).json({
                    status: "error",
                    message: session.aiFeedback.error || "AI analysis failed"
                });
            }

            return res.status(404).json({
                status: "not_found",
                message: "Feedback not found"
            });
        }

        // Return clean, structured response with all relevant fields
        res.status(200).json({
            status: "ready",
            correctness: feedback.correctness,
            logicFeedback: feedback.logicFeedback,
            timeComplexity: feedback.timeComplexity,
            spaceComplexity: feedback.spaceComplexity,
            commonMistake: feedback.commonMistake,
            improvementSuggestion: feedback.improvementSuggestion,
            conceptTags: feedback.conceptTags,
            score: feedback.score,
            student: feedback.studentId,
            problem: feedback.problemId,
            createdAt: feedback.createdAt,
            // Additional fields for code comparison and test results
            feedbackType: feedback.feedbackType,
            studentCode: feedback.studentCode,
            teacherCode: feedback.teacherCode,
            testCaseResults: feedback.testCaseResults,
            testCaseSummary: feedback.testCaseSummary,
        });
    } catch (error) {
        console.log("Error in getAIFeedbackBySession:", error.message);
        res.status(500).json({ status: "error", message: "Internal Server Error" });
    }
}

// Get all AI feedback for a student (for progress tracking)
export async function getStudentFeedbackHistory(req, res) {
    try {
        const userId = req.user._id;

        const feedbackHistory = await AIFeedback.find({ studentId: userId })
            .populate("problemId", "title difficulty")
            .sort({ createdAt: -1 })
            .limit(20);

        res.status(200).json({ feedbackHistory });
    } catch (error) {
        console.log("Error in getStudentFeedbackHistory:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

// Get skill summary aggregation for a student
export async function getStudentSkillSummary(req, res) {
    try {
        const userId = req.user._id;

        // Aggregate concept tags across all feedback
        const skillSummary = await AIFeedback.aggregate([
            { $match: { studentId: userId } },
            { $unwind: "$conceptTags" },
            {
                $group: {
                    _id: "$conceptTags",
                    count: { $sum: 1 },
                    avgScore: { $avg: "$score" },
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Get overall stats
        const overallStats = await AIFeedback.aggregate([
            { $match: { studentId: userId } },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    avgScore: { $avg: "$score" },
                    correctCount: {
                        $sum: { $cond: [{ $eq: ["$correctness", "Correct"] }, 1, 0] }
                    }
                }
            }
        ]);

        res.status(200).json({
            skills: skillSummary,
            stats: overallStats[0] || { totalSessions: 0, avgScore: 0, correctCount: 0 }
        });
    } catch (error) {
        console.log("Error in getStudentSkillSummary:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}
