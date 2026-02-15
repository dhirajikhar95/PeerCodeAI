import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

// Deepgram client - initialized lazily
let deepgramClient = null;

/**
 * Get Deepgram client (lazy initialization)
 */
function getDeepgramClient() {
    if (!deepgramClient) {
        const apiKey = process.env.DEEPGRAM_API_KEY;
        if (!apiKey) {
            console.warn("⚠️ DEEPGRAM_API_KEY not configured - transcription will not work");
            return null;
        }
        deepgramClient = createClient(apiKey);
    }
    return deepgramClient;
}

/**
 * Check if Deepgram is configured
 */
export function isDeepgramConfigured() {
    return !!process.env.DEEPGRAM_API_KEY;
}

/**
 * Transcribe audio using Deepgram
 * @param {Buffer} audioBuffer - Audio data as Buffer
 * @param {string} mimetype - Audio mimetype (e.g., "audio/webm")
 * @returns {Promise<{transcript: string, confidence: number}>}
 */
export async function transcribeAudio(audioBuffer, mimetype = "audio/webm") {
    const client = getDeepgramClient();
    if (!client) {
        throw new Error("Deepgram not configured");
    }

    try {
        const { result, error } = await client.listen.prerecorded.transcribeFile(
            audioBuffer,
            {
                model: "nova-2",
                smart_format: true,
                mimetype: mimetype,
            }
        );

        if (error) {
            console.error("Deepgram error:", error);
            throw new Error(error.message || "Transcription failed");
        }

        const transcript = result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
        const confidence = result?.results?.channels?.[0]?.alternatives?.[0]?.confidence || 0;

        return { transcript, confidence };
    } catch (error) {
        console.error("Deepgram transcription error:", error.message);
        throw error;
    }
}

/**
 * Create a live transcription connection for real-time streaming
 * This is for future WebSocket-based implementation
 */
export function createLiveTranscription(options = {}) {
    const client = getDeepgramClient();
    if (!client) {
        throw new Error("Deepgram not configured");
    }

    const connection = client.listen.live({
        model: "nova-2",
        smart_format: true,
        interim_results: true,
        utterance_end_ms: 1000,
        vad_events: true,
        ...options
    });

    return connection;
}
