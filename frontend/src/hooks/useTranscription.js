import { useState, useEffect, useRef, useCallback } from "react";
import axiosInstance from "../lib/axios";

/**
 * Custom hook for speech transcription
 * 
 * Strategy:
 * 1. First check if Deepgram is available on the backend
 * 2. If yes, use audio recording + backend transcription (reliable in production)
 * 3. If no, fall back to Web Speech API (may not work in all environments)
 * 
 * This hook records audio in chunks and sends them to the backend for processing.
 */
export function useTranscription({ speakerName, speakerId, isMicOn, onTranscript }) {
    const [isSupported, setIsSupported] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState(null);
    const [useDeepgram, setUseDeepgram] = useState(false);
    const [deepgramChecked, setDeepgramChecked] = useState(false);

    // Audio recording refs
    const mediaRecorderRef = useRef(null);
    const streamRef = useRef(null);
    const recordingIntervalRef = useRef(null);

    // Web Speech API refs (fallback)
    const recognitionRef = useRef(null);
    const isMicOnRef = useRef(isMicOn);
    const isStoppingRef = useRef(false);

    // Keep refs updated
    useEffect(() => {
        isMicOnRef.current = isMicOn;
        if (isMicOn) {
            isStoppingRef.current = false;
            setIsActive(true);
            setError(null);
        } else {
            setIsActive(false);
        }
    }, [isMicOn]);

    // Check for Deepgram availability on backend
    useEffect(() => {
        async function checkDeepgram() {
            try {
                const response = await axiosInstance.get("/transcription/status");
                if (response.data?.available) {

                    setUseDeepgram(true);
                    setIsSupported(true);
                } else {

                    setUseDeepgram(false);
                    checkWebSpeechSupport();
                }
            } catch (e) {

                setUseDeepgram(false);
                checkWebSpeechSupport();
            }
            setDeepgramChecked(true);
        }

        function checkWebSpeechSupport() {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                setIsSupported(true);
            } else {
                setIsSupported(false);
                setError("Speech recognition not supported");
            }
        }

        checkDeepgram();
    }, []);

    // ============= DEEPGRAM AUDIO RECORDING =============

    const processAudioChunk = useCallback(async (audioBlob) => {
        if (audioBlob.size < 1000) return; // Skip too-small chunks

        try {
            const formData = new FormData();
            formData.append("audio", audioBlob, "audio.webm");

            const response = await axiosInstance.post("/transcription/process", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            const transcript = response.data?.transcript?.trim();
            if (transcript && onTranscript) {

                onTranscript(speakerName, speakerId, transcript);
            }
        } catch (e) {
            // Silent fail for individual chunks - don't spam console
            if (e.response?.status !== 503) {
                console.warn("🎤 Transcription chunk failed");
            }
        }
    }, [speakerName, speakerId, onTranscript]);

    const startDeepgramRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4"
            });
            mediaRecorderRef.current = mediaRecorder;

            let chunks = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunks.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                if (chunks.length > 0) {
                    const blob = new Blob(chunks, { type: mediaRecorder.mimeType });
                    processAudioChunk(blob);
                    chunks = [];
                }
            };

            // Record in 5-second intervals for better transcription
            mediaRecorder.start();
            setIsListening(true);


            // Stop and restart every 5 seconds to process chunks
            recordingIntervalRef.current = setInterval(() => {
                if (mediaRecorderRef.current?.state === "recording" && isMicOnRef.current) {
                    mediaRecorderRef.current.stop();
                    setTimeout(() => {
                        if (isMicOnRef.current && streamRef.current?.active) {
                            try {
                                mediaRecorderRef.current.start();
                            } catch (e) {
                                // Stream might have ended
                            }
                        }
                    }, 100);
                }
            }, 5000);

        } catch (e) {
            console.error("🎤 Failed to start recording:", e.message);
            setError("Microphone access denied");
            setIsListening(false);
        }
    }, [processAudioChunk]);

    const stopDeepgramRecording = useCallback(() => {
        if (recordingIntervalRef.current) {
            clearInterval(recordingIntervalRef.current);
            recordingIntervalRef.current = null;
        }

        if (mediaRecorderRef.current?.state === "recording") {
            try {
                mediaRecorderRef.current.stop();
            } catch (e) {
                // Ignore
            }
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        mediaRecorderRef.current = null;
        setIsListening(false);

    }, []);

    // ============= WEB SPEECH API FALLBACK =============

    const startWebSpeech = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        let networkErrorCount = 0;

        recognition.onstart = () => {
            setIsListening(true);
            setError(null);
        };

        recognition.onresult = (event) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    const transcript = result[0].transcript.trim();
                    if (transcript && onTranscript) {

                        onTranscript(speakerName, speakerId, transcript);
                    }
                }
            }
        };

        recognition.onerror = (event) => {
            if (isStoppingRef.current) return;

            if (event.error === "not-allowed") {
                setError("Microphone permission denied");
            } else if (event.error === "network") {
                networkErrorCount++;
                if (networkErrorCount === 1) {
                    console.warn("🎤 Web Speech API network error - this is a known limitation in production");
                    setError("Speech recognition requires internet connection");
                }
            } else if (event.error !== "no-speech" && event.error !== "aborted") {
                console.warn("🎤 Speech error:", event.error);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            // Don't auto-restart - network errors are too common
        };

        recognitionRef.current = recognition;

        try {
            recognition.start();
        } catch (e) {
            console.error("🎤 Failed to start Web Speech:", e.message);
        }
    }, [speakerName, speakerId, onTranscript]);

    const stopWebSpeech = useCallback(() => {
        isStoppingRef.current = true;
        if (recognitionRef.current) {
            try {
                recognitionRef.current.abort();
            } catch (e) {
                // Ignore
            }
            recognitionRef.current = null;
        }
        setIsListening(false);
    }, []);

    // ============= MAIN EFFECT: React to mic state =============

    useEffect(() => {
        if (!deepgramChecked || !isSupported) return;

        if (isMicOn) {
            if (useDeepgram) {
                startDeepgramRecording();
            } else {
                startWebSpeech();
            }
        } else {
            if (useDeepgram) {
                stopDeepgramRecording();
            } else {
                stopWebSpeech();
            }
        }

        return () => {
            if (useDeepgram) {
                stopDeepgramRecording();
            } else {
                stopWebSpeech();
            }
        };
    }, [isMicOn, deepgramChecked, isSupported, useDeepgram, startDeepgramRecording, stopDeepgramRecording, startWebSpeech, stopWebSpeech]);

    return {
        isSupported,
        isListening,
        isActive: isActive && isSupported,
        error,
        provider: useDeepgram ? "deepgram" : "webspeech"
    };
}
