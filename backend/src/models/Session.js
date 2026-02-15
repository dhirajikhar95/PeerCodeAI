import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    problem: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // For 1:1 sessions - single participant
    participant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    // For class sessions - multiple participants
    participants: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    // Session type: one_on_one or class
    sessionType: {
      type: String,
      enum: ["one_on_one", "class"],
      default: "one_on_one",
    },
    // Max participants (2 for 1:1, null for unlimited class sessions)
    maxParticipants: {
      type: Number,
      default: 2,
    },
    // Whether AI feedback is enabled (true for 1:1, false for class)
    aiFeedbackEnabled: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    // stream video call ID
    callId: {
      type: String,
      default: "",
    },
    // Unique 6-character access code for students to join
    accessCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Programming language used
    language: {
      type: String,
      enum: ["javascript", "python", "java", "cpp"],
      default: "javascript",
    },

    // ========== CODE SNAPSHOTS ==========
    // Student's code BEFORE teacher started editing (or final if no teacher edits)
    studentCodeSnapshot: {
      type: String,
      default: "",
    },
    // Final code (includes teacher corrections if any)
    teacherCodeSnapshot: {
      type: String,
      default: "",
    },

    // ========== CONTRIBUTION TRACKING ==========
    studentCharCount: {
      type: Number,
      default: 0,
    },
    teacherCharCount: {
      type: Number,
      default: 0,
    },
    // Feedback type determined at session end
    feedbackType: {
      type: String,
      enum: ["student_only", "teacher_assisted", "no_student_code"],
      default: null,
    },

    // ========== TEST CASE RESULTS ==========
    testCaseResults: [{
      input: { type: String },
      expected: { type: String },
      actual: { type: String },
      passed: { type: Boolean },
    }],
    testCaseSummary: {
      total: { type: Number, default: 0 },
      passed: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },

    // Legacy fields
    studentTyped: {
      type: Boolean,
      default: false,
    },
    aiFeedback: {
      type: Object,
      default: null,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      default: null,
    },

    // ========== TRANSCRIPT DATA ==========
    transcript: [{
      speaker: { type: String }, // User's display name
      speakerId: { type: String }, // User's clerkId
      text: { type: String },
      timestamp: { type: Date, default: Date.now },
    }],
    transcriptEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Session = mongoose.model("Session", sessionSchema);

export default Session;
