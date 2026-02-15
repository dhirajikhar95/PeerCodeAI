import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { createQuestion, getQuestions, getQuestionById, deleteQuestion, updateQuestion } from "../controllers/questionController.js";

const router = express.Router();

router.use(protectRoute); // All routes require authentication

router.post("/", createQuestion);
router.get("/", getQuestions);
router.get("/:id", getQuestionById);
router.put("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;

