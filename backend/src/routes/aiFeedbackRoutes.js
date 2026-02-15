import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
    getAIFeedbackBySession,
    getStudentFeedbackHistory,
    getStudentSkillSummary,
} from "../controllers/aiFeedbackController.js";

const router = express.Router();

// Get AI feedback for a specific session
router.get("/session/:sessionId", protectRoute, getAIFeedbackBySession);

// Get student's feedback history
router.get("/my-history", protectRoute, getStudentFeedbackHistory);

// Get student's skill summary (for progress tracking)
router.get("/my-skills", protectRoute, getStudentSkillSummary);

export default router;
