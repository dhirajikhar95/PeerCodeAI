import { useState, useEffect, useRef, useCallback } from "react";
import { StreamChat } from "stream-chat";
import toast from "react-hot-toast";
import { initializeStreamClient, disconnectStreamClient } from "../lib/stream";
import { sessionApi } from "../api/sessions";

function useStreamClient(session, loadingSession, isHost, isParticipant) {
  const [streamClient, setStreamClient] = useState(null);
  const [call, setCall] = useState(null);
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [isInitializingCall, setIsInitializingCall] = useState(true);

  // Use refs to track initialization state to prevent re-runs
  const isInitializedRef = useRef(false);
  const videoCallRef = useRef(null);
  const chatClientRef = useRef(null);
  const channelRef = useRef(null);
  const isCleanedUpRef = useRef(false);

  useEffect(() => {
    const initCall = async () => {
      // Guard: Don't re-initialize if already done
      if (isInitializedRef.current) return;

      // Guard: Wait for session data
      if (!session?.callId) return;

      // Guard: Session must be active
      if (session.status === "completed") {
        setIsInitializingCall(false);
        return;
      }

      // Guard: User must be host or participant
      if (!isHost && !isParticipant) return;

      // Mark as initialized to prevent re-runs
      isInitializedRef.current = true;

      try {
        const { token, userId, userName, userImage } = await sessionApi.getStreamToken();

        const client = await initializeStreamClient(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );

        setStreamClient(client);

        const videoCall = client.call("default", session.callId);
        await videoCall.join({ create: true });
        videoCallRef.current = videoCall;
        setCall(videoCall);

        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        const chatClientInstance = StreamChat.getInstance(apiKey);

        await chatClientInstance.connectUser(
          {
            id: userId,
            name: userName,
            image: userImage,
          },
          token
        );
        chatClientRef.current = chatClientInstance;
        setChatClient(chatClientInstance);

        const chatChannel = chatClientInstance.channel("messaging", session.callId);
        await chatChannel.watch();
        channelRef.current = chatChannel;
        setChannel(chatChannel);
      } catch (error) {
        toast.error("Failed to join video call");
        console.error("Error init call", error);
        // Reset on error so user can retry
        isInitializedRef.current = false;
      } finally {
        setIsInitializingCall(false);
      }
    };

    if (session && !loadingSession) {
      initCall();
    }
  }, [session, loadingSession, isHost, isParticipant]);

  // Graceful pre-navigation cleanup.
  // Called BEFORE navigate() so that Chat/Stream components are
  // already torn down before React unmounts the tree.
  // This prevents "You can't use a channel after client.disconnect()" errors.
  const cleanupBeforeNavigate = useCallback(async () => {
    if (isCleanedUpRef.current) return;
    isCleanedUpRef.current = true;

    // 1. Clear state first — this causes React to stop rendering
    //    Chat/Channel components (they check for null chatClient/channel)
    setChatClient(null);
    setChannel(null);
    setCall(null);
    setStreamClient(null);

    // 2. Give React one frame to process the state changes and unmount children
    await new Promise((resolve) => setTimeout(resolve, 50));

    // 3. Now safely disconnect — components are already unmounted
    // Unwatch channel first
    try {
      if (channelRef.current) {
        await channelRef.current.stopWatching();
        channelRef.current = null;
      }
    } catch (e) {
      // Channel may already be unwatched
    }

    // Disconnect chat client
    try {
      if (chatClientRef.current) {
        await chatClientRef.current.disconnectUser();
        chatClientRef.current = null;
      }
    } catch (e) {
      // Chat client may already be disconnected
    }

    // Leave video call
    try {
      if (videoCallRef.current) {
        await videoCallRef.current.leave();
        videoCallRef.current = null;
      }
    } catch (e) {
      // Call may already be left/deleted
    }

    // Disconnect Stream video client
    try {
      await disconnectStreamClient();
    } catch (e) {
      // Client may already be disconnected
    }
  }, []);

  // Fallback cleanup on component unmount — handles cases where
  // cleanupBeforeNavigate wasn't called (e.g., browser back button)
  useEffect(() => {
    return () => {
      if (isCleanedUpRef.current) return; // Already cleaned up gracefully
      isCleanedUpRef.current = true;

      // Each step gets its own try-catch so one failure doesn't skip the rest
      (async () => {
        try {
          if (channelRef.current) {
            await channelRef.current.stopWatching();
          }
        } catch (e) { /* channel may already be unwatched */ }

        try {
          if (chatClientRef.current) {
            await chatClientRef.current.disconnectUser();
          }
        } catch (e) { /* chat client may already be disconnected */ }

        try {
          if (videoCallRef.current) {
            await videoCallRef.current.leave();
          }
        } catch (e) { /* call may already be left/deleted */ }

        try {
          await disconnectStreamClient();
        } catch (e) { /* client may already be disconnected */ }
      })();
    };
  }, []); // Empty deps = only runs on unmount

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
    cleanupBeforeNavigate,
  };
}

export default useStreamClient;
