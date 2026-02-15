import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        difficulty: {
            type: String,
            enum: ["easy", "medium", "hard"],
            required: true,
        },
        // Structured examples with explanation
        examples: [
            {
                input: { type: String, required: true },
                output: { type: String, required: true },
                explanation: { type: String, default: "" },
            },
        ],
        // Constraints like "1 <= n <= 10^5"
        constraints: [{ type: String }],
        // Starter code templates per language
        starterCode: {
            javascript: { type: String, default: "// Write your solution here\n" },
            python: { type: String, default: "# Write your solution here\n" },
            java: { type: String, default: "// Write your solution here\n" },
            cpp: { type: String, default: "// Write your solution here\n" },
        },
        // Test cases with hidden flag for evaluation
        testCases: [
            {
                input: { type: String, required: true },
                output: { type: String, required: true },
                isHidden: { type: Boolean, default: false },
            },
        ],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        isSystem: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const Question = mongoose.model("Question", questionSchema);

export default Question;
