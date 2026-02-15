import { useState, useEffect, useRef } from "react";
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

  // Separate cleanup effect that ONLY runs on component unmount
  useEffect(() => {
    return () => {
      (async () => {
        try {
          if (videoCallRef.current) {
            await videoCallRef.current.leave();
          }
          if (chatClientRef.current) {
            await chatClientRef.current.disconnectUser();
          }
          await disconnectStreamClient();
        } catch (error) {
          console.error("Cleanup error:", error);
        }
      })();
    };
  }, []); // Empty deps = only runs on unmount

  return {
    streamClient,
    call,
    chatClient,
    channel,
    isInitializingCall,
  };
}

export default useStreamClient;
