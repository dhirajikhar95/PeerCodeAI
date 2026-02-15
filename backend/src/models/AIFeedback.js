import mongoose from "mongoose";

const aiFeedbackSchema = new mongoose.Schema(
    {
        sessionId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            required: true,
        },
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question",
            default: null,
        },

        // Type of feedback based on session scenario
        feedbackType: {
            type: String,
            enum: ["student_only", "teacher_assisted", "no_student_code"],
            default: "student_only",
        },

        // Code snapshots for display
        studentCode: {
            type: String,
            default: "",
        },
        teacherCode: {
            type: String,
            default: "",
        },

        // Structured feedback fields
        correctness: {
            type: String,
            enum: ["Correct", "Partially Correct", "Incorrect", "Unable to analyze"],
            required: true,
        },
        logicFeedback: {
            type: String,
            required: true,
        },
        timeComplexity: {
            type: String,
            default: "Not determined",
        },
        spaceComplexity: {
            type: String,
            default: "Not determined",
        },
        commonMistake: {
            type: String,
            default: "None identified",
        },
        improvementSuggestion: {
            type: String,
            default: "",
        },
        conceptTags: {
            type: [String],
            default: [],
        },
        score: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        // Test case results
        testCaseResults: [{
            input: { type: String },
            expected: { type: String },
            actual: { type: String },
            passed: { type: Boolean },
            error: { type: String },
        }],
        testCaseSummary: {
            total: { type: Number, default: 0 },
            passed: { type: Number, default: 0 },
            failed: { type: Number, default: 0 },
        },
    },
    { timestamps: true }
);

// Ensure one feedback per session
aiFeedbackSchema.index({ sessionId: 1 }, { unique: true });

const AIFeedback = mongoose.model("AIFeedback", aiFeedbackSchema);

export default AIFeedback;
