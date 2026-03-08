import {
  CallingState,
  SpeakerLayout,
  useCallStateHooks,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  CancelCallButton,
  ScreenShareButton,
} from "@stream-io/video-react-sdk";
import { Loader2Icon, MessageSquareIcon, UsersIcon, XIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import { useEndSession } from "../hooks/useSessions";
import { useTranscription } from "../hooks/useTranscription";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel, isHost = false, onChatToggle, sessionType, userName, userId, onTranscript }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { useCallCallingState, useParticipantCount, useMicrophoneState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const { isMute } = useMicrophoneState();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const hasExplicitlyLeftRef = useRef(false);

  // Transcription - enabled when mic is on, uses main session socket via onTranscript callback
  // isActive: true when mic is on (for badge visibility)
  // isListening: true when recognition is actually running
  const { isActive: isTranscribing } = useTranscription({
    speakerName: userName || "Unknown",
    speakerId: userId || "",
    isMicOn: !isMute,
    onTranscript,
  });

  const endSessionMutation = useEndSession();

  // Watch for call ending
  // Only navigate when the user has explicitly left/ended the session.
  // Transient CallingState.LEFT events (e.g., network hiccups, chat ops) are ignored.
  useEffect(() => {
    if (callingState === CallingState.LEFT && hasExplicitlyLeftRef.current) {
      if (sessionType !== "class") {
        navigate(`/feedback/${id}`);
      } else {
        navigate("/dashboard");
      }
    }
  }, [callingState, navigate, id, sessionType]);

  // Listen for new messages to update unread count
  useEffect(() => {
    if (!channel) return;

    const handleNewMessage = (event) => {
      if (!isChatOpen && event.user?.id !== chatClient.userID) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    channel.on("message.new", handleNewMessage);

    return () => {
      channel.off("message.new", handleNewMessage);
    };
  }, [channel, isChatOpen, chatClient.userID]);

  const handleChatToggle = () => {
    const newState = !isChatOpen;
    setIsChatOpen(newState);
    if (newState) {
      setUnreadCount(0); // Reset unread count when opening
    }
    // Notify parent to resize panels
    if (onChatToggle) {
      onChatToggle(newState);
    }
  };

  const handleLeave = () => {
    hasExplicitlyLeftRef.current = true;
    if (isHost) {
      if (confirm("End this session for everyone?")) {
        endSessionMutation.mutate(id, {
          onSuccess: () => {
            if (sessionType !== "class") {
              navigate(`/feedback/${id}`);
            } else {
              navigate("/dashboard");
            }
          },
        });
      } else {
        hasExplicitlyLeftRef.current = false;
      }
    } else {
      navigate("/dashboard");
    }
  };

  if (callingState === CallingState.JOINING) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2Icon className="w-12 h-12 mx-auto animate-spin text-primary mb-4" />
          <p className="text-lg">Joining call...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex gap-3 relative str-video">
      {/* Video section - always full width */}
      <div className="flex flex-col gap-3 w-full">
        {/* Participants & Chat Toggle */}
        <div className="flex items-center justify-between gap-2 bg-base-100 p-3 rounded-lg shadow border border-base-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-primary" />
              <span className="font-semibold text-base-content">
                {participantCount} {participantCount === 1 ? "participant" : "participants"}
              </span>
            </div>
            {/* Live Transcribing Badge */}
            {isTranscribing && (
              <div className="flex items-center gap-1.5 px-2 py-1 bg-error/10 rounded-full">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-error"></span>
                </span>
                <span className="text-xs font-medium text-error">Live Transcribing</span>
              </div>
            )}
          </div>
          {chatClient && channel && (
            <div className="relative">
              <button
                onClick={handleChatToggle}
                className={`btn btn-sm gap-2 ${isChatOpen ? "btn-primary" : "btn-ghost"}`}
                title={isChatOpen ? "Hide chat" : "Show chat"}
              >
                <MessageSquareIcon className="size-4" />
                Chat
              </button>
              {unreadCount > 0 && !isChatOpen && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 bg-base-300 rounded-lg overflow-hidden relative border border-base-200">
          <SpeakerLayout />
        </div>

        {/* Custom Call Controls (No Reactions) */}
        <div className="bg-base-100 p-3 rounded-lg shadow flex justify-center gap-4 border border-base-200">
          <ToggleAudioPublishingButton />
          <ToggleVideoPublishingButton />
          <ScreenShareButton />
          <CancelCallButton onLeave={handleLeave} />
        </div>
      </div>

      {/* CHAT SECTION - Smooth slide animation */}
      {chatClient && channel && (
        <div
          className={`absolute top-0 right-0 h-full w-80 flex flex-col rounded-l-lg shadow-lg overflow-hidden bg-base-100 border-l border-base-300 transition-transform duration-300 ease-out ${isChatOpen ? "translate-x-0" : "translate-x-full"
            }`}
          style={{ zIndex: 40 }}
        >
          <div className="bg-base-200 p-3 border-b border-base-300 flex items-center justify-between">
            <h3 className="font-semibold text-base-content">Session Chat</h3>
            <button
              onClick={handleChatToggle}
              className="btn btn-ghost btn-xs btn-circle"
              title="Close chat"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <Chat client={chatClient}>
              <Channel channel={channel}>
                <Window>
                  <MessageList />
                  <MessageInput noFiles />
                </Window>
                <Thread />
              </Channel>
            </Chat>
          </div>
        </div>
      )}
    </div>
  );
}

export default VideoCallUI;
