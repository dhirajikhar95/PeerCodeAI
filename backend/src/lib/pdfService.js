import PDFDocument from "pdfkit";
import Session from "../models/Session.js";
import User from "../models/User.js";

// IST timezone options
const IST_OPTIONS = {
    timeZone: "Asia/Kolkata",
    hour12: true,
};

const IST_DATE_OPTIONS = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
    day: "numeric",
};

const IST_TIME_OPTIONS = {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
};

/**
 * Generate a PDF transcript for a session
 * @param {string} sessionId - The session ID
 * @returns {Promise<Buffer>} - PDF buffer
 */
export async function generateTranscriptPDF(sessionId) {
    const session = await Session.findById(sessionId)
        .populate("host", "name email")
        .populate("participant", "name email")
        .populate("participants", "name email")
        .populate("questionId", "title");

    if (!session) {
        throw new Error("Session not found");
    }

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const chunks = [];

        doc.on("data", (chunk) => chunks.push(chunk));
        doc.on("end", () => resolve(Buffer.concat(chunks)));
        doc.on("error", reject);

        // Header
        doc.fontSize(24).font("Helvetica-Bold").text("Session Transcript", { align: "center" });
        doc.moveDown();

        // Session Info Box
        doc.fontSize(12).font("Helvetica-Bold").text("Session Details", { underline: true });
        doc.moveDown(0.5);

        doc.font("Helvetica");
        doc.text(`Problem: ${session.questionId?.title || session.problem}`);
        doc.text(`Difficulty: ${session.difficulty}`);

        // Format session date in IST
        const sessionDate = new Date(session.createdAt).toLocaleDateString("en-IN", IST_DATE_OPTIONS);
        const sessionTime = new Date(session.createdAt).toLocaleTimeString("en-IN", IST_TIME_OPTIONS);
        doc.text(`Date: ${sessionDate} at ${sessionTime} (IST)`);
        doc.text(`Session Type: ${session.sessionType === "class" ? "Class Session" : "1:1 Session"}`);
        doc.moveDown();

        // Participants
        doc.font("Helvetica-Bold").text("Participants:", { underline: true });
        doc.moveDown(0.5);
        doc.font("Helvetica");
        doc.text(`Host: ${session.host?.name || "Unknown"}`);

        if (session.sessionType === "class" && session.participants?.length > 0) {
            doc.text(`Students: ${session.participants.map(p => p.name).join(", ")}`);
        } else if (session.participant) {
            doc.text(`Student: ${session.participant.name}`);
        }
        doc.moveDown();

        // Transcript
        doc.font("Helvetica-Bold").fontSize(14).text("Transcript", { underline: true });
        doc.moveDown();

        if (!session.transcript || session.transcript.length === 0) {
            doc.font("Helvetica-Oblique").fontSize(11).text("No transcript available for this session.");
        } else {
            doc.font("Helvetica").fontSize(11);

            session.transcript.forEach((entry, index) => {
                // Format time in IST
                const time = new Date(entry.timestamp).toLocaleTimeString("en-IN", IST_TIME_OPTIONS);

                // Speaker name in bold
                doc.font("Helvetica-Bold").text(`[${time}] ${entry.speaker}:`, { continued: true });
                doc.font("Helvetica").text(` ${entry.text}`);

                if (index < session.transcript.length - 1) {
                    doc.moveDown(0.3);
                }
            });
        }

        // Footer - format generation date in IST
        doc.moveDown(2);
        const genDate = new Date().toLocaleDateString("en-IN", IST_DATE_OPTIONS);
        const genTime = new Date().toLocaleTimeString("en-IN", IST_TIME_OPTIONS);
        doc.fontSize(9).font("Helvetica-Oblique")
            .text(`Generated on ${genDate}, ${genTime} (IST) by PeerCode AI`, { align: "center" });

        doc.end();
    });
}

