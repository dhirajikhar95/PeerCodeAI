import { Server } from "socket.io";
import { ENV } from "./env.js";

let io = null;

// Store session state with contribution tracking
// { sessionId: { code, language, output, studentCharCount, teacherCharCount, studentOnlyCode, teacherStartedEditing, lastCodeLength } }
const sessionState = new Map();

export function initSocketServer(httpServer) {
    io = new Server(httpServer, {
        cors: {
            origin: ENV.CLIENT_URL,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {

        // Join a session room
        socket.on("session:join", ({ sessionId, userId, role }) => {
            socket.join(sessionId);
            socket.data = { sessionId, userId, role };

            // Initialize session state if not exists
            if (!sessionState.has(sessionId)) {
                sessionState.set(sessionId, {
                    code: "",
                    language: "javascript",
                    output: null,
                    studentCharCount: 0,
                    teacherCharCount: 0,
                    studentOnlyCode: "",
                    teacherStartedEditing: false,
                    lastCodeLength: 0,
                });
            }

            // Send current session state to newly joined user
            const state = sessionState.get(sessionId);
            socket.emit("session:state", {
                code: state.code,
                language: state.language,
                output: state.output,
            });
        });

        // Leave session room
        socket.on("session:leave", ({ sessionId }) => {
            socket.leave(sessionId);
        });

        // Code update from any participant - with contribution tracking
        socket.on("code:update", ({ sessionId, code, userId }) => {
            const role = socket.data?.role;

            if (!sessionState.has(sessionId)) {
                sessionState.set(sessionId, {
                    code: "",
                    language: "javascript",
                    output: null,
                    studentCharCount: 0,
                    teacherCharCount: 0,
                    studentOnlyCode: "",
                    teacherStartedEditing: false,
                    lastCodeLength: 0,
                });
            }

            const state = sessionState.get(sessionId);
            const oldLength = state.lastCodeLength;
            const newLength = code.length;
            const delta = Math.abs(newLength - oldLength);

            // Track contribution by role
            if (role === "student") {
                state.studentCharCount += delta;
                // ALWAYS save the latest student code version
                state.studentOnlyCode = code;
            } else if (role === "teacher") {
                state.teacherStartedEditing = true;
                state.teacherCharCount += delta;
            }

            // Update session state
            state.code = code;
            state.lastCodeLength = newLength;

            // Broadcast to all other users in the session
            socket.to(sessionId).emit("code:update", { code, userId });
        });

        // Language change
        socket.on("language:change", ({ sessionId, language, userId }) => {
            if (!sessionState.has(sessionId)) {
                sessionState.set(sessionId, {
                    code: "",
                    language: "javascript",
                    output: null,
                    studentCharCount: 0,
                    teacherCharCount: 0,
                    studentOnlyCode: "",
                    teacherStartedEditing: false,
                    lastCodeLength: 0,
                });
            }
            sessionState.get(sessionId).language = language;

            // Broadcast to all other users
            socket.to(sessionId).emit("language:change", { language, userId });
        });

        // Output update (after code execution)
        socket.on("output:update", ({ sessionId, output, userId }) => {
            if (sessionState.has(sessionId)) {
                sessionState.get(sessionId).output = output;
            }

            // Broadcast to all other users
            socket.to(sessionId).emit("output:update", { output, userId });
        });

        socket.on("testResults:update", ({ sessionId, results, hiddenResults, summary, userId }) => {
            if (sessionState.has(sessionId)) {
                sessionState.get(sessionId).testResults = { results, hiddenResults, summary };
            }

            socket.to(sessionId).emit("testResults:update", { results, hiddenResults, summary, userId });
        });

        // Cursor position sync (optional enhancement)
        socket.on("cursor:update", ({ sessionId, position, userId }) => {
            socket.to(sessionId).emit("cursor:update", { position, userId });
        });

        socket.on("testRunning:update", ({ sessionId, isRunning, userId }) => {
            socket.to(sessionId).emit("testRunning:update", { isRunning, userId });
        });

        // Transcript update (speech-to-text)
        socket.on("transcript:update", async ({ sessionId, speaker, speakerId, text }) => {
            try {
                // Dynamic import to avoid circular dependency
                const Session = (await import("../models/Session.js")).default;

                await Session.findByIdAndUpdate(
                    sessionId,
                    {
                        $push: {
                            transcript: {
                                speaker,
                                speakerId,
                                text,
                                timestamp: new Date(),
                            },
                        },
                    },
                    { new: true }
                );


            } catch (error) {
                console.error("Error saving transcript:", error.message);
            }
        });

        socket.on("disconnect", () => {
        });
    });

    return io;
}

export function getIO() {
    return io;
}

// Get session contribution data
export function getSessionContributions(sessionId) {
    if (!sessionState.has(sessionId)) {
        return null;
    }
    const state = sessionState.get(sessionId);
    return {
        studentCharCount: state.studentCharCount,
        teacherCharCount: state.teacherCharCount,
        studentOnlyCode: state.studentOnlyCode,
        teacherStartedEditing: state.teacherStartedEditing,
        finalCode: state.code,
        language: state.language,
    };
}

// Clean up session state when session ends
export function cleanupSessionState(sessionId) {
    sessionState.delete(sessionId);
}
