import { useUser } from "@clerk/clerk-react";
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import { useEndSession, useJoinSession, useSessionById } from "../hooks/useSessions";
import { useQuestionById } from "../hooks/useQuestions";
import { useSessionSocket } from "../hooks/useSessionSocket";
import { executeCode } from "../lib/piston";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { getDifficultyBadgeClass } from "../lib/utils";
import {
  Loader2Icon,
  PlayIcon,
  WifiIcon,
  WifiOffIcon,
  GripVerticalIcon,
  GripHorizontalIcon,
  CopyIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import Editor from "@monaco-editor/react";
import useStreamClient from "../hooks/useStreamClient";
import { StreamCall, StreamVideo } from "@stream-io/video-react-sdk";
import VideoCallUI from "../components/VideoCallUI";
import TestCasePanel from "../components/TestCasePanel";
import axiosInstance from "../lib/axios";

// Language config with logos (matching public folder files)
const LANGUAGE_CONFIG = {
  javascript: { name: "JavaScript", monacoLang: "javascript", logo: "/javascript.png" },
  python: { name: "Python", monacoLang: "python", logo: "/python.png" },
  java: { name: "Java", monacoLang: "java", logo: "/java.png" },
  cpp: { name: "C++", monacoLang: "cpp", logo: "/cpp.png" },
};

function SessionPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useUser();
  const debounceTimerRef = useRef(null);
  const mainPanelGroupRef = useRef(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const { data: sessionData, isLoading: loadingSession, refetch } = useSessionById(id);
  const joinSessionMutation = useJoinSession();

  const session = sessionData?.session;
  const isHost = session?.host?.clerkId === user?.id;
  // Check if user is the 1:1 participant OR in the participants array for class sessions
  const isParticipant =
    session?.participant?.clerkId === user?.id ||
    session?.participants?.some(p => p.clerkId === user?.id || p._id === user?.id);

  const userRole = isHost ? "teacher" : "student";

  const { data: questionData } = useQuestionById(session?.questionId);
  const question = questionData?.question;

  const {
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
    clearRemoteCode,
    clearRemoteLanguage,
    clearRemoteOutput,
    clearRemoteTestResults,
    clearRemoteRunningState,
  } = useSessionSocket(id, user?.id, userRole);

  const { call, channel, chatClient, isInitializingCall, streamClient } = useStreamClient(
    session,
    loadingSession,
    isHost,
    isParticipant
  );

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Track if student typed locally (not from socket sync)
  const hasStudentTypedRef = useRef(false);
  // Store student's OWN code separately (not affected by teacher's remote edits)
  const studentOwnCodeRef = useRef("");

  useEffect(() => {
    if (question?.starterCode?.[selectedLanguage]) {
      setCode(question.starterCode[selectedLanguage]);
    }
  }, [question, selectedLanguage]);

  useEffect(() => {
    if (remoteCode !== null) { setCode(remoteCode); clearRemoteCode(); }
  }, [remoteCode, clearRemoteCode]);

  useEffect(() => {
    if (remoteLanguage !== null) { setSelectedLanguage(remoteLanguage); clearRemoteLanguage(); }
  }, [remoteLanguage, clearRemoteLanguage]);

  // Sync output from other participants
  useEffect(() => {
    if (remoteOutput !== null) { setOutput(remoteOutput); clearRemoteOutput(); }
  }, [remoteOutput, clearRemoteOutput]);

  useEffect(() => {
    if (!session || !user || loadingSession || isHost || isParticipant) return;
    joinSessionMutation.mutate(id, { onSuccess: refetch });
  }, [session, user, loadingSession, isHost, isParticipant, id]);

  useEffect(() => {
    if (!session || loadingSession) return;
    if (session.status === "completed") {
      // Redirect to AI Report for 1:1 sessions (both teacher and student)
      if (session.sessionType !== "class") {
        navigate(`/feedback/${id}`);
      } else {
        // Class sessions go to dashboard
        navigate(userRole === "teacher" ? "/teacher/dashboard" : "/student/dashboard");
      }
    }
  }, [session, loadingSession, navigate, userRole, id]);

  useEffect(() => {
    if (!session || userRole !== "student" || !hasStudentTypedRef.current || !studentOwnCodeRef.current) return;
    const studentCode = studentOwnCodeRef.current;
    const timer = setTimeout(async () => {
      try {
        await axiosInstance.patch(`/sessions/${id}/snapshot`, {
          studentCodeSnapshot: studentCode,
          language: selectedLanguage,
          studentTyped: true
        });
      } catch (e) { }
    }, 3000);
    return () => clearTimeout(timer);
  }, [code, selectedLanguage, session, userRole, id]);

  // Teacher code snapshot - save final code before ending session
  useEffect(() => {
    if (!session || userRole !== "teacher" || !code) return;
    const timer = setTimeout(async () => {
      try { await axiosInstance.patch(`/sessions/${id}/teacher-snapshot`, { teacherCodeSnapshot: code, language: selectedLanguage }); } catch (e) { }
    }, 3000);
    return () => clearTimeout(timer);
  }, [code, selectedLanguage, session, userRole, id]);

  const handleCodeChange = useCallback((value) => {
    setCode(value || "");
    // Track that student typed locally (not from socket sync)
    if (userRole === "student") {
      hasStudentTypedRef.current = true;
      studentOwnCodeRef.current = value || "";
    }
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => emitCodeUpdate(value || ""), 150);
  }, [emitCodeUpdate, userRole]);

  const handleLanguageChange = useCallback((e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    emitLanguageChange(newLang);
    if (question?.starterCode?.[newLang]) {
      setCode(question.starterCode[newLang]);
      emitCodeUpdate(question.starterCode[newLang]);
    }
    setOutput(null);
  }, [emitLanguageChange, emitCodeUpdate, question]);

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput(null);
    const result = await executeCode(selectedLanguage, code);
    setOutput(result);
    // Sync output to other participants
    emitOutputUpdate(result);
    setIsRunning(false);
  };

  // Handle chat toggle - resize panels to ensure chat is visible
  const handleChatToggle = useCallback((isOpen) => {
    setIsChatOpen(isOpen);
    if (isOpen && mainPanelGroupRef.current) {
      // When chat opens, ensure right panel has enough space (min 45%)
      const api = mainPanelGroupRef.current;
      const sizes = api.getLayout();
      // If right panel is less than 45% (Left > 55), give it more space
      if (sizes[0] > 55) {
        api.setLayout([55, 45]);
      }
    }
  }, []);

  if (loadingSession || isInitializingCall) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-gradient)' }}>
        <Loader2Icon className="size-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-gradient)' }}>
        <p className="text-error">Session not found</p>
      </div>
    );
  }

  return (
    <div className="h-screen p-2 flex flex-col" style={{ background: 'var(--page-gradient)' }}>
      {/* Compact Header */}
      <header className="bg-base-100 rounded-lg px-4 py-2 mb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-bold text-lg">{question?.title || session.problem}</span>
          <span className={`badge ${getDifficultyBadgeClass(session.difficulty)}`}>{session.difficulty}</span>
          <span className={`badge ${isHost ? "badge-primary" : "badge-secondary"}`}>{userRole}</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Access Code for Teacher */}
          {isHost && session.accessCode && (
            <div className="flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-lg border border-primary/20">
              <span className="text-xs text-base-content/60">Code:</span>
              <span className="font-mono font-bold text-primary">{session.accessCode}</span>
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(session.accessCode);
                  toast.success("Code copied!");
                }}
                className="btn btn-ghost btn-xs p-0"
                title="Copy code"
              >
                <CopyIcon className="size-3" />
              </button>
            </div>
          )}
          <span className={`flex items-center gap-1 ${isConnected ? "text-success" : "text-error"}`}>
            {isConnected ? <WifiIcon className="size-4" /> : <WifiOffIcon className="size-4" />}
            <span className="text-sm">{isConnected ? "Connected" : "Offline"}</span>
          </span>
        </div>
      </header>

      {/* Main Content - All Resizable */}
      <div className="flex-1 min-h-0">
        <PanelGroup
          direction="horizontal"
          ref={mainPanelGroupRef}
        >
          {/* LEFT: Question + Code Editor + Output */}
          <Panel defaultSize={isChatOpen ? 50 : 55} minSize={35}>
            <PanelGroup direction="vertical">
              {/* Question Section */}
              <Panel defaultSize={30} minSize={15}>
                <div className="h-full bg-base-100 rounded-lg p-4 overflow-y-auto">
                  <h3 className="font-bold text-lg mb-2">Coding Question</h3>
                  {question ? (
                    <div className="space-y-3">
                      <p className="whitespace-pre-wrap">{question.description}</p>
                      {question.examples?.map((ex, i) => (
                        <div key={i} className="bg-base-200 p-3 rounded-lg font-mono text-sm">
                          <div><b>Input:</b> {ex.input}</div>
                          <div><b>Output:</b> {ex.output}</div>
                          {ex.explanation && <div className="text-base-content/70 mt-1">{ex.explanation}</div>}
                        </div>
                      ))}
                      {question.constraints?.length > 0 && (
                        <div>
                          <h4 className="font-semibold">Constraints</h4>
                          <ul className="list-disc list-inside text-sm">
                            {question.constraints.map((c, i) => <li key={i}>{c}</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-base-content/50">{session.problem}</p>
                  )}
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary flex items-center justify-center cursor-row-resize group">
                <GripHorizontalIcon className="size-4 text-base-content/30 group-hover:text-primary" />
              </PanelResizeHandle>

              {/* Code Editor Section */}
              <Panel defaultSize={50} minSize={25}>
                <div className="h-full bg-base-100 rounded-lg overflow-hidden flex flex-col">
                  {/* Editor Header */}
                  <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#333]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-[#2d2d2d] px-2 py-1 rounded border border-[#333]">
                        <img
                          src={LANGUAGE_CONFIG[selectedLanguage].logo}
                          alt={LANGUAGE_CONFIG[selectedLanguage].name}
                          className="size-5"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <select
                          className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-gray-200"
                          value={selectedLanguage}
                          onChange={handleLanguageChange}
                        >
                          {Object.entries(LANGUAGE_CONFIG).map(([k, c]) => (
                            <option key={k} value={k} className="bg-[#1e1e1e]">{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400">Use "Run Tests" below</span>
                  </div>
                  <div className="flex-1 min-h-0">
                    <Editor
                      height="100%"
                      language={LANGUAGE_CONFIG[selectedLanguage].monacoLang}
                      value={code}
                      onChange={handleCodeChange}
                      theme="vs-dark"
                      options={{
                        fontSize: 15,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: true,
                        automaticLayout: true,
                        wordWrap: "on"
                      }}
                    />
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary flex items-center justify-center cursor-row-resize group">
                <GripHorizontalIcon className="size-4 text-base-content/30 group-hover:text-primary" />
              </PanelResizeHandle>

              {/* Output/Test Cases Section */}
              <Panel defaultSize={20} minSize={10}>
                <div className="h-full bg-base-100 rounded-lg overflow-hidden">
                  {question?.testCases?.length > 0 ? (
                    <TestCasePanel
                      sessionId={id}
                      testCases={question.testCases}
                      code={code}
                      language={selectedLanguage}
                      emitTestResults={emitTestResults}
                      emitRunningState={emitRunningState}
                      remoteTestResults={remoteTestResults}
                      remoteRunningState={remoteRunningState}
                      clearRemoteTestResults={clearRemoteTestResults}
                      clearRemoteRunningState={clearRemoteRunningState}
                    />
                  ) : (
                    <div className="h-full p-4 overflow-y-auto">
                      <h4 className="font-semibold mb-2">Output</h4>
                      {output ? (
                        <pre className="font-mono whitespace-pre-wrap">
                          {output.success ? output.output : <span className="text-error">{output.error}</span>}
                        </pre>
                      ) : (
                        <p className="text-base-content/50">Click "Run Code" to see output here...</p>
                      )}
                    </div>
                  )}
                </div>
              </Panel>
            </PanelGroup>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary flex items-center justify-center cursor-col-resize group">
            <GripVerticalIcon className="size-4 text-base-content/30 group-hover:text-primary" />
          </PanelResizeHandle>

          {/* RIGHT: Video Call */}
          <Panel defaultSize={isChatOpen ? 50 : 45} minSize={35}>
            <div className="h-full rounded-lg overflow-hidden">
              {streamClient && call ? (
                <StreamVideo client={streamClient}>
                  <StreamCall call={call}>
                    <VideoCallUI
                      chatClient={chatClient}
                      channel={channel}
                      isHost={isHost}
                      onChatToggle={handleChatToggle}
                      sessionType={session.sessionType}
                      userName={user?.fullName || user?.firstName || "User"}
                      userId={user?.id}
                      onTranscript={emitTranscript}
                    />
                  </StreamCall>
                </StreamVideo>
              ) : (
                <div className="h-full flex items-center justify-center bg-base-100 rounded-lg">
                  <Loader2Icon className="size-8 animate-spin text-primary" />
                </div>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default SessionPage;
