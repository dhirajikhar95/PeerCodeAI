import express from "express";
import multer from "multer";
import { transcribeAudio, isDeepgramConfigured } from "../lib/deepgramService.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Configure multer for audio file uploads (in memory)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB max
    },
    fileFilter: (req, file, cb) => {
        // Accept audio files
        if (file.mimetype.startsWith("audio/")) {
            cb(null, true);
        } else {
            cb(new Error("Only audio files are allowed"), false);
        }
    }
});

/**
 * GET /transcription/status
 * Check if transcription service is available
 */
router.get("/status", (req, res) => {
    res.json({
        available: isDeepgramConfigured(),
        provider: isDeepgramConfigured() ? "deepgram" : "none",
        message: isDeepgramConfigured()
            ? "Transcription service is available"
            : "Transcription service not configured. Add DEEPGRAM_API_KEY to enable."
    });
});

/**
 * POST /transcription/process
 * Process an audio file and return transcription
 */
router.post("/process", protectRoute, upload.single("audio"), async (req, res) => {
    try {
        if (!isDeepgramConfigured()) {
            return res.status(503).json({
                error: "Transcription service not available",
                message: "Please configure DEEPGRAM_API_KEY"
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: "No audio file provided"
            });
        }

        const { transcript, confidence } = await transcribeAudio(
            req.file.buffer,
            req.file.mimetype
        );

        res.json({
            transcript,
            confidence
        });
    } catch (error) {
        console.error("Transcription error:", error.message);
        res.status(500).json({
            error: "Transcription failed",
            message: error.message
        });
    }
});

export default router;
