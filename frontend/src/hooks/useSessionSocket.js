import { useEffect, useRef, useState, useCallback } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export function useSessionSocket(sessionId, userId, role) {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [remoteCode, setRemoteCode] = useState(null);
    const [remoteLanguage, setRemoteLanguage] = useState(null);
    const [remoteOutput, setRemoteOutput] = useState(null);
    const [remoteTestResults, setRemoteTestResults] = useState(null);
    const [remoteRunningState, setRemoteRunningState] = useState(null);

    useEffect(() => {
        if (!sessionId || !userId) return;

        // Create socket connection
        const socket = io(SOCKET_URL, {
            transports: ["websocket", "polling"],
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            setIsConnected(true);
            // Join the session room
            socket.emit("session:join", { sessionId, userId, role });
        });

        socket.on("disconnect", () => {
            setIsConnected(false);
        });

        // Receive initial session state (only apply if we don't have local state)
        socket.on("session:state", (state) => {
            // Only apply initial state - let code:update handle subsequent syncs
            if (state.code) setRemoteCode(state.code);
            if (state.language) setRemoteLanguage(state.language);
            if (state.testResults) setRemoteTestResults(state.testResults);
        });

        // Receive code updates from other participants
        socket.on("code:update", ({ code, userId: senderId }) => {
            if (senderId !== userId) {
                setRemoteCode(code);
            }
        });

        // Receive language changes
        socket.on("language:change", ({ language, userId: senderId }) => {
            if (senderId !== userId) {
                setRemoteLanguage(language);
            }
        });

        // Receive output updates
        socket.on("output:update", ({ output, userId: senderId }) => {
            if (senderId !== userId) {
                setRemoteOutput(output);
            }
        });

        socket.on("testResults:update", ({ results, hiddenResults, summary, userId: senderId }) => {
            if (senderId !== userId) {
                setRemoteTestResults({ results, hiddenResults, summary });
            }
        });

        socket.on("testRunning:update", ({ isRunning, userId: senderId }) => {
            if (senderId !== userId) {
                setRemoteRunningState(isRunning);
            }
        });

        // Cleanup on unmount
        return () => {
            socket.emit("session:leave", { sessionId });
            socket.disconnect();
        };
    }, [sessionId, userId, role]);

    // Emit code update
    const emitCodeUpdate = useCallback(
        (code) => {
            if (socketRef.current && isConnected && sessionId) {
                socketRef.current.emit("code:update", { sessionId, code, userId });
            }
        },
        [sessionId, userId, isConnected]
    );

    // Emit language change
    const emitLanguageChange = useCallback(
        (language) => {
            if (socketRef.current && isConnected) {
                socketRef.current.emit("language:change", { sessionId, language, userId });
            }
        },
        [sessionId, userId, isConnected]
    );

    // Emit output update
    const emitOutputUpdate = useCallback(
        (output) => {
            if (socketRef.current && isConnected) {
                socketRef.current.emit("output:update", { sessionId, output, userId });
            }
        },
        [sessionId, userId, isConnected]
    );

    const emitTestResults = useCallback(
        (results, summary, hiddenResults) => {
            if (socketRef.current && isConnected) {
                socketRef.current.emit("testResults:update", { sessionId, results, hiddenResults, summary, userId });
            }
        },
        [sessionId, userId, isConnected]
    );

    const emitRunningState = useCallback(
        (isRunning) => {
            if (socketRef.current && isConnected) {
                socketRef.current.emit("testRunning:update", { sessionId, isRunning, userId });
            }
        },
        [sessionId, userId, isConnected]
    );

    // Emit transcript update (for speech-to-text)
    const emitTranscript = useCallback(
        (speaker, speakerId, text) => {
            if (socketRef.current && isConnected && text?.trim()) {
                socketRef.current.emit("transcript:update", { sessionId, speaker, speakerId, text });
            }
        },
        [sessionId, isConnected]
    );

    return {
        isConnected,
        remoteCode,
        remoteLanguage,
        remoteOutput,
        remoteTestResults,
        remoteRunningState,
        emitCodeUpdate,
        emitLanguageChange,
        emitOutputUpdate,
        emitTestResults,
        emitRunningState,
        emitTranscript,
        clearRemoteCode: () => setRemoteCode(null),
        clearRemoteLanguage: () => setRemoteLanguage(null),
        clearRemoteOutput: () => setRemoteOutput(null),
        clearRemoteTestResults: () => setRemoteTestResults(null),
        clearRemoteRunningState: () => setRemoteRunningState(null),
    };
}
