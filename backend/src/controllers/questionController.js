import Question from "../models/Question.js";

// Create a new question (Teacher only)
export const createQuestion = async (req, res) => {
    try {
        const userRole = req.user.role;
        if (userRole !== "teacher") {
            return res.status(403).json({ error: "Access denied. Only teachers can create questions." });
        }

        const { title, description, difficulty, examples, constraints, starterCode, testCases } = req.body;

        const newQuestion = new Question({
            title,
            description,
            difficulty,
            examples: examples || [],
            constraints: constraints || [],
            starterCode: starterCode || {},
            testCases: testCases || [],
            createdBy: req.user._id,
        });

        await newQuestion.save();
        res.status(201).json(newQuestion);
    } catch (error) {
        console.error("Error creating question:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get all questions
export const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find().populate("createdBy", "name email clerkId").sort({ createdAt: -1 });
        res.status(200).json(questions);
    } catch (error) {
        console.error("Error fetching questions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get a single question by ID
export const getQuestionById = async (req, res) => {
    try {
        const { id } = req.params;
        const question = await Question.findById(id).populate("createdBy", "name email clerkId");

        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        // Return wrapped in 'question' key for consistency
        res.status(200).json({ question });
    } catch (error) {
        console.error("Error fetching question:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Update a question (Teacher only - can only update own questions)
export const updateQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        if (userRole !== "teacher") {
            return res.status(403).json({ error: "Access denied. Only teachers can update questions." });
        }

        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        // Check if user owns the question
        if (question.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You can only update your own questions" });
        }

        // Don't allow updating system questions
        if (question.isSystem) {
            return res.status(403).json({ error: "Cannot update system questions" });
        }

        // Update fields
        const { title, description, difficulty, examples, constraints, starterCode, testCases } = req.body;

        question.title = title || question.title;
        question.description = description || question.description;
        question.difficulty = difficulty || question.difficulty;
        question.examples = examples || question.examples;
        question.constraints = constraints || question.constraints;
        question.starterCode = starterCode || question.starterCode;
        question.testCases = testCases || question.testCases;

        const updatedQuestion = await question.save();
        res.status(200).json(updatedQuestion);
    } catch (error) {
        console.error("Error updating question:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Delete a question (Teacher only - can only delete own questions)
export const deleteQuestion = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const userRole = req.user.role;

        if (userRole !== "teacher") {
            return res.status(403).json({ error: "Access denied. Only teachers can delete questions." });
        }

        const question = await Question.findById(id);

        if (!question) {
            return res.status(404).json({ error: "Question not found" });
        }

        // Check if user owns the question (or is admin)
        if (question.createdBy.toString() !== userId.toString()) {
            return res.status(403).json({ error: "You can only delete your own questions" });
        }

        // Don't allow deleting system questions
        if (question.isSystem) {
            return res.status(403).json({ error: "Cannot delete system questions" });
        }

        await Question.findByIdAndDelete(id);
        res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        console.error("Error deleting question:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
