import {
  CallingState,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ScreenShareButton,
} from "@stream-io/video-react-sdk";
import { Loader2Icon, MessageSquareIcon, UsersIcon, XIcon, PhoneOffIcon } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "react-router";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import { useEndSession } from "../hooks/useSessions";
import { useTranscription } from "../hooks/useTranscription";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import "stream-chat-react/dist/css/v2/index.css";

function VideoCallUI({ chatClient, channel, isHost = false, onChatToggle, sessionType, userName, userId, onTranscript, onNavigateAway }) {
  const { id } = useParams();
  const call = useCall();
  const { useCallCallingState, useParticipantCount, useMicrophoneState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participantCount = useParticipantCount();
  const { isMute } = useMicrophoneState();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  // Prevent double-navigation from competing redirect paths
  const hasNavigatedRef = useRef(false);

  // Transcription - enabled when mic is on, uses main session socket via onTranscript callback
  const { isActive: isTranscribing } = useTranscription({
    speakerName: userName || "Unknown",
    speakerId: userId || "",
    isMicOn: !isMute,
    onTranscript,
  });

  const endSessionMutation = useEndSession();

  // Helper: navigate to the correct page after session ends.
  // Uses the parent's navigateAway which does graceful cleanup
  // (unmounts Chat components first, then disconnects clients).
  const navigateAfterEnd = useCallback(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    const target = sessionType !== "class" ? `/feedback/${id}` : "/dashboard";
    if (onNavigateAway) {
      onNavigateAway(target);
    }
  }, [id, sessionType, onNavigateAway]);

  // Watch for call ending via CallingState changes.
  // Handle ALL terminal call states — not just LEFT.
  useEffect(() => {
    if (
      callingState === CallingState.LEFT ||
      callingState === CallingState.RECONNECTING_FAILED ||
      callingState === CallingState.OFFLINE
    ) {
      navigateAfterEnd();
    }
  }, [callingState, navigateAfterEnd]);

  // Listen for the Stream SDK 'call.ended' event.
  useEffect(() => {
    if (!call) return;

    const handleCallEnded = () => {
      navigateAfterEnd();
    };

    call.on("call.ended", handleCallEnded);
    return () => {
      call.off("call.ended", handleCallEnded);
    };
  }, [call, navigateAfterEnd]);

  // Listen for new messages to update unread count
  useEffect(() => {
    if (!channel) return;

    const handleNewMessage = (event) => {
      if (!isChatOpen && event.user?.id !== chatClient?.userID) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    channel.on("message.new", handleNewMessage);

    return () => {
      channel.off("message.new", handleNewMessage);
    };
  }, [channel, isChatOpen, chatClient?.userID]);

  const handleChatToggle = () => {
    const newState = !isChatOpen;
    setIsChatOpen(newState);
    if (newState) {
      setUnreadCount(0);
    }
    if (onChatToggle) {
      onChatToggle(newState);
    }
  };

  // Custom leave handler — we fully control the flow.
  const handleLeave = async () => {
    if (isEnding) return;

    if (isHost) {
      if (!confirm("End this session for everyone?")) return;

      setIsEnding(true);
      endSessionMutation.mutate(id, {
        onSuccess: () => {
          navigateAfterEnd();
        },
        onError: () => {
          navigateAfterEnd();
        },
      });
    } else {
      navigateAfterEnd();
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

        {/* Custom Call Controls */}
        <div className="bg-base-100 p-3 rounded-lg shadow flex justify-center gap-4 border border-base-200">
          <ToggleAudioPublishingButton />
          <ToggleVideoPublishingButton />
          <ScreenShareButton />
          <button
            onClick={handleLeave}
            disabled={isEnding}
            className="str-video__composite-button str-video__end-call-button"
            title={isHost ? "End session for everyone" : "Leave session"}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: isEnding ? '#666' : '#dc2626',
              border: 'none',
              cursor: isEnding ? 'not-allowed' : 'pointer',
              color: 'white',
              transition: 'background-color 0.2s',
            }}
          >
            {isEnding ? (
              <Loader2Icon className="size-5 animate-spin" />
            ) : (
              <PhoneOffIcon className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* CHAT SECTION — only render if chatClient and channel are still valid */}
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
