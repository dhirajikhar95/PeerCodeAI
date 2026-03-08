import { chatClient, streamClient } from "../lib/stream.js";
import Session from "../models/Session.js";
import Question from "../models/Question.js";
import { inngest } from "../lib/inngest.js";
import { sendSessionInvite, sendSessionCompletedEmail } from "../lib/emailService.js";

// Generate a unique 6-character alphanumeric access code
function generateAccessCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Avoid confusing chars like 0/O, 1/I
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Ensure unique access code
async function getUniqueAccessCode() {
  let code;
  let exists = true;
  while (exists) {
    code = generateAccessCode();
    exists = await Session.findOne({ accessCode: code, status: "active" });
  }
  return code;
}

export async function createSession(req, res) {
  try {
    const { questionId, problem, difficulty, sessionType = "one_on_one" } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!problem || !difficulty) {
      return res.status(400).json({ message: "Problem and difficulty are required" });
    }

    // Validate question exists if questionId provided
    if (questionId) {
      const question = await Question.findById(questionId);
      if (!question) {
        return res.status(400).json({ message: "Invalid question ID" });
      }
    }

    // Generate unique access code
    const accessCode = await getUniqueAccessCode();

    // generate a unique call id for stream video
    const callId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Set session type specific defaults
    const isClassSession = sessionType === "class";
    const sessionData = {
      problem,
      difficulty,
      host: userId,
      callId,
      accessCode,
      questionId: questionId || null,
      sessionType,
      maxParticipants: isClassSession ? null : 2, // null = unlimited for class
      aiFeedbackEnabled: !isClassSession, // No AI feedback for class sessions
      participants: [], // Initialize empty participants array for class sessions
    };

    // create session in db
    const session = await Session.create(sessionData);

    // create stream video call
    await streamClient.video.call("default", callId).getOrCreate({
      data: {
        created_by_id: clerkId,
        custom: { problem, difficulty, sessionId: session._id.toString(), sessionType },
      },
    });

    // chat messaging
    const channel = chatClient.channel("messaging", callId, {
      name: `${problem} Session`,
      created_by_id: clerkId,
      members: [clerkId],
    });

    await channel.create();

    // Return session with accessCode prominently
    res.status(201).json({
      session,
      accessCode,
      message: `Session created! Access code: ${accessCode}`
    });
  } catch (error) {
    console.log("Error in createSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getActiveSessions(req, res) {
  try {
    const userId = req.user._id;

    // Only return teacher's own active sessions
    const sessions = await Session.find({
      status: "active",
      host: userId
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getActiveSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getMyRecentSessions(req, res) {
  try {
    const userId = req.user._id;

    // get sessions where user is either host, participant (1:1), or in participants array (class)
    const sessions = await Session.find({
      status: "completed",
      $or: [{ host: userId }, { participant: userId }, { participants: userId }],
    })
      .populate("host", "name profileImage email clerkId")
      .populate("participant", "name profileImage email clerkId")
      .populate("participants", "name profileImage email clerkId")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({ sessions });
  } catch (error) {
    console.log("Error in getMyRecentSessions controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getSessionById(req, res) {
  try {
    const { id } = req.params;

    const session = await Session.findById(id)
      .populate("host", "name email profileImage clerkId")
      .populate("participant", "name email profileImage clerkId")
      .populate("participants", "name email profileImage clerkId");

    if (!session) return res.status(404).json({ message: "Session not found" });

    res.status(200).json({ session });
  } catch (error) {
    console.log("Error in getSessionById controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Join session by ID (legacy - for direct links)
export async function joinSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "active") {
      return res.status(400).json({ message: "Cannot join a completed session" });
    }

    if (session.host.toString() === userId.toString()) {
      // Host is already in session, just return success
      return res.status(200).json({ session, isHost: true });
    }

    // Handle based on session type
    if (session.sessionType === "class") {
      // Class session - allow multiple participants
      const isAlreadyParticipant = session.participants.some(
        p => p.toString() === userId.toString()
      );

      if (!isAlreadyParticipant) {
        session.participants.push(userId);
        await session.save();

        const channel = chatClient.channel("messaging", session.callId);
        await channel.addMembers([clerkId]);
      }
    } else {
      // One-on-one session - only one participant allowed
      if (session.participant && session.participant.toString() !== userId.toString()) {
        return res.status(409).json({ message: "Session is full" });
      }

      if (!session.participant) {
        session.participant = userId;
        await session.save();

        const channel = chatClient.channel("messaging", session.callId);
        await channel.addMembers([clerkId]);
      }
    }

    res.status(200).json({ session, isHost: false });
  } catch (error) {
    console.log("Error in joinSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// NEW: Join session by access code
export async function joinByAccessCode(req, res) {
  try {
    const { accessCode } = req.body;
    const userId = req.user._id;
    const clerkId = req.user.clerkId;

    if (!accessCode) {
      return res.status(400).json({ message: "Access code is required" });
    }

    // Find active session with this access code
    const session = await Session.findOne({
      accessCode: accessCode.toUpperCase().trim(),
      status: "active"
    });

    if (!session) {
      return res.status(404).json({ message: "Invalid access code or session has ended" });
    }

    if (session.host.toString() === userId.toString()) {
      // If host, just redirect them to the session
      return res.status(200).json({ session, isHost: true });
    }

    // Handle based on session type
    if (session.sessionType === "class") {
      // Class session - allow multiple participants
      const isAlreadyParticipant = session.participants.some(
        p => p.toString() === userId.toString()
      );

      if (!isAlreadyParticipant) {
        session.participants.push(userId);
        await session.save();

        const channel = chatClient.channel("messaging", session.callId);
        await channel.addMembers([clerkId]);
      }
    } else {
      // One-on-one session - only one participant allowed
      if (session.participant && session.participant.toString() !== userId.toString()) {
        return res.status(409).json({ message: "Session is full" });
      }

      if (!session.participant) {
        session.participant = userId;
        await session.save();

        const channel = chatClient.channel("messaging", session.callId);
        await channel.addMembers([clerkId]);
      }
    }

    res.status(200).json({ session, isHost: false });
  } catch (error) {
    console.log("Error in joinByAccessCode controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// NEW: Send email invite
export async function sendInvite(req, res) {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const userId = req.user._id;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const session = await Session.findById(id).populate("host", "name");

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Only host can send invites
    if (session.host._id.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can send invites" });
    }

    // Send email
    await sendSessionInvite(email, session.accessCode, {
      problem: session.problem,
      difficulty: session.difficulty,
      hostName: session.host.name,
      sessionId: session._id.toString(),
    });

    res.status(200).json({ message: `Invite sent to ${email}` });
  } catch (error) {
    console.log("Error in sendInvite controller:", error.message);
    res.status(500).json({ message: "Failed to send invite email" });
  }
}

export async function endSession(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // check if user is the host
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the host can end the session" });
    }

    // check if session is already completed
    if (session.status === "completed") {
      return res.status(400).json({ message: "Session is already completed" });
    }

    // Get contribution data from socket before cleanup
    const { getSessionContributions, cleanupSessionState } = await import("../lib/socket.js");
    const contributions = getSessionContributions(id);

    if (contributions) {
      // Save contribution data to session
      session.studentCharCount = contributions.studentCharCount || 0;
      session.teacherCharCount = contributions.teacherCharCount || 0;

      // Determine feedback type based on contributions
      const MIN_CHARS_FOR_ATTEMPT = 10;
      if (contributions.studentCharCount < MIN_CHARS_FOR_ATTEMPT) {
        session.feedbackType = "no_student_code";
        session.studentCodeSnapshot = "";
        session.teacherCodeSnapshot = contributions.finalCode || "";
      } else if (contributions.teacherCharCount > 0) {
        session.feedbackType = "teacher_assisted";
        // ALWAYS use the student-only code tracked by socket, never the shared editor state
        session.studentCodeSnapshot = contributions.studentOnlyCode || "";
        session.teacherCodeSnapshot = contributions.finalCode || "";
      } else {
        session.feedbackType = "student_only";
        // ALWAYS use studentOnlyCode — this is the last code written by the student,
        // NOT finalCode which could contain teacher edits even when teacherCharCount is 0
        // (e.g., if teacher types and then deletes, delta could cancel out)
        session.studentCodeSnapshot = contributions.studentOnlyCode || contributions.finalCode || "";
        session.teacherCodeSnapshot = "";
      }

      console.log(`[EndSession] feedbackType=${session.feedbackType}, studentCode=${session.studentCodeSnapshot?.length || 0} chars, teacherCode=${session.teacherCodeSnapshot?.length || 0} chars, studentChars=${contributions.studentCharCount}, teacherChars=${contributions.teacherCharCount}`);

      session.language = contributions.language || session.language;

    }

    // delete stream video call
    try {
      const call = streamClient.video.call("default", session.callId);
      await call.delete({ hard: true });
    } catch (e) {
      console.log("Warning: Could not delete stream call:", e.message);
    }

    // delete stream chat channel
    try {
      const channel = chatClient.channel("messaging", session.callId);
      await channel.delete();
    } catch (e) {
      console.log("Warning: Could not delete chat channel:", e.message);
    }

    session.status = "completed";
    await session.save();

    // Get full session data for emails
    const populatedSession = await Session.findById(id)
      .populate("host", "name email")
      .populate("participant", "name email")
      .populate("participants", "name email");

    // Send completion emails (non-blocking)
    const emailPromises = [];
    const sessionInfo = {
      problem: session.problem,
      difficulty: session.difficulty,
      sessionId: session._id.toString(),
      hostName: populatedSession.host?.name || "Teacher",
      sessionType: session.sessionType,
    };

    // Send to teacher
    if (populatedSession.host?.email) {
      emailPromises.push(
        sendSessionCompletedEmail(populatedSession.host.email, sessionInfo, "teacher")
      );
    }

    // Send to single participant (for 1:1 sessions)
    if (populatedSession.participant?.email) {
      emailPromises.push(
        sendSessionCompletedEmail(populatedSession.participant.email, sessionInfo, "student")
      );
    }

    // Send to all participants (for class sessions)
    if (populatedSession.participants && populatedSession.participants.length > 0) {
      for (const participant of populatedSession.participants) {
        if (participant.email) {
          emailPromises.push(
            sendSessionCompletedEmail(participant.email, sessionInfo, "student")
          );
        }
      }
    }

    // Fire and forget - don't block the response
    Promise.all(emailPromises).catch(e => console.log("Email sending error:", e.message));

    // Clean up socket state
    if (contributions) {
      cleanupSessionState(id);
    }

    // Trigger AI analysis for 1:1 sessions
    if (session.aiFeedbackEnabled) {
      try {
        const { analyzeSessionDirect } = await import("../lib/aiService.js");
        console.log(`[AI] Starting direct AI analysis for session ${session._id}`);
        // Run async without blocking the response
        analyzeSessionDirect(session._id.toString())
          .then(result => {
            if (result.error) {
              console.error(`[AI] Analysis returned error for session ${session._id}:`, result.error);
            } else {
              console.log(`[AI] Analysis completed for session ${session._id}:`, result.feedbackType || "success");
            }
          })
          .catch(err => {
            console.error(`[AI] Analysis failed for session ${session._id}:`, err.message);
          });
      } catch (importError) {
        console.error(`[AI] Failed to import aiService for session ${session._id}:`, importError.message);
      }
    }

    res.status(200).json({ session, message: "Session ended successfully" });
  } catch (error) {
    console.log("Error in endSession controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function updateSnapshot(req, res) {
  try {
    const { id } = req.params;
    const { studentCodeSnapshot, language, studentTyped } = req.body;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only allow participant (student) to update snapshot
    // For 1:1 sessions: check session.participant
    // For class sessions: check session.participants array
    const isParticipant =
      (session.participant && session.participant.toString() === userId.toString()) ||
      (session.participants && session.participants.some(p => p.toString() === userId.toString()));

    if (!isParticipant) {
      return res.status(403).json({ message: "Only session participants can update the snapshot" });
    }

    session.studentCodeSnapshot = studentCodeSnapshot;
    // Only set studentTyped if it's true (once typed, stays true)
    if (studentTyped) {
      session.studentTyped = true;
    }
    if (language) {
      session.language = language;
    }
    await session.save();

    res.status(200).json({ message: "Snapshot updated successfully" });
  } catch (error) {
    console.log("Error in updateSnapshot controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Teacher code snapshot - saves teacher's final code for comparison
export async function updateTeacherSnapshot(req, res) {
  try {
    const { id } = req.params;
    const { teacherCodeSnapshot, language } = req.body;
    const userId = req.user._id;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only host (teacher) can update teacher snapshot
    if (session.host.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the teacher can update the teacher snapshot" });
    }

    session.teacherCodeSnapshot = teacherCodeSnapshot;
    if (language) {
      session.language = language;
    }
    await session.save();

    res.status(200).json({ message: "Teacher snapshot updated successfully" });
  } catch (error) {
    console.log("Error in updateTeacherSnapshot controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Save test case execution results
export async function updateTestResults(req, res) {
  try {
    const { id } = req.params;
    const { testCaseResults, testCaseSummary } = req.body;

    const session = await Session.findById(id);

    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only active sessions can update test results
    if (session.status === "completed") {
      return res.status(400).json({ message: "Cannot update completed session" });
    }

    session.testCaseResults = testCaseResults;
    session.testCaseSummary = testCaseSummary;
    await session.save();

    res.status(200).json({ message: "Test results saved successfully" });
  } catch (error) {
    console.log("Error in updateTestResults controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// ========== TRANSCRIPT FUNCTIONS ==========

// Append transcript entry to session
export async function appendTranscript(req, res) {
  try {
    const { id } = req.params;
    const { speaker, speakerId, text } = req.body;

    if (!speaker || !text) {
      return res.status(400).json({ message: "Speaker and text are required" });
    }

    const session = await Session.findById(id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    // Only active sessions can update transcript
    if (session.status === "completed") {
      return res.status(400).json({ message: "Cannot update completed session" });
    }

    session.transcript.push({
      speaker,
      speakerId,
      text,
      timestamp: new Date(),
    });

    await session.save();
    res.status(200).json({ message: "Transcript entry added" });
  } catch (error) {
    console.log("Error in appendTranscript controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// Download transcript as PDF
export async function downloadTranscriptPDF(req, res) {
  try {
    const { id } = req.params;

    // Dynamic import to avoid issues
    const { generateTranscriptPDF } = await import("../lib/pdfService.js");

    const pdfBuffer = await generateTranscriptPDF(id);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=transcript-${id}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.log("Error in downloadTranscriptPDF controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
