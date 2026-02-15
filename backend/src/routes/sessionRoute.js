import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createSession,
  endSession,
  getActiveSessions,
  getMyRecentSessions,
  getSessionById,
  joinSession,
  joinByAccessCode,
  sendInvite,
  updateSnapshot,
  updateTeacherSnapshot,
  updateTestResults,
  appendTranscript,
  downloadTranscriptPDF,
} from "../controllers/sessionController.js";

const router = express.Router();

router.post("/", protectRoute, createSession);
router.get("/active", protectRoute, getActiveSessions);
router.get("/my-recent", protectRoute, getMyRecentSessions);

// Join by access code (for students)
router.post("/join-by-code", protectRoute, joinByAccessCode);

router.get("/:id", protectRoute, getSessionById);
router.post("/:id/join", protectRoute, joinSession);
router.post("/:id/end", protectRoute, endSession);
router.post("/:id/invite", protectRoute, sendInvite);
router.patch("/:id/snapshot", protectRoute, updateSnapshot);
router.patch("/:id/teacher-snapshot", protectRoute, updateTeacherSnapshot);
router.patch("/:id/test-results", protectRoute, updateTestResults);

// Transcript routes
router.post("/:id/transcript", protectRoute, appendTranscript);
router.get("/:id/transcript/pdf", protectRoute, downloadTranscriptPDF);

export default router;
