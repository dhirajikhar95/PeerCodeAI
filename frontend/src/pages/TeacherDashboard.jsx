import { useNavigate } from "react-router";
import { useState } from "react";
import { Link } from "react-router";
import { useUser } from "@clerk/clerk-react";
import DashboardLayout from "../components/DashboardLayout";
import { useQuestions } from "../hooks/useQuestions";
import { useCreateSession, useMyRecentSessions } from "../hooks/useSessions";
import CreateSessionModal from "../components/CreateSessionModal";
import SessionTypeModal from "../components/SessionTypeModal";
import AccessCodeDisplay from "../components/AccessCodeDisplay";
import axiosInstance from "../lib/axios";
import {
    PlusIcon,
    BookOpenIcon,
    ClockIcon,
    FileTextIcon,
    TrendingUpIcon,
    Loader2Icon,
    XIcon,
    UsersIcon,
    SparklesIcon,
    ArrowRightIcon,
    PlayIcon,
} from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";

const TeacherDashboard = () => {
    const navigate = useNavigate();
    const [showSessionTypeModal, setShowSessionTypeModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [sessionType, setSessionType] = useState("one_on_one"); // "one_on_one" or "class"
    const [roomConfig, setRoomConfig] = useState({ questionId: "", problem: "", difficulty: "" });
    const [createdSession, setCreatedSession] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);

    const { user } = useUser();
    const { data: questionsData, isLoading: loadingQuestions } = useQuestions();
    const { data: recentSessionsData, isLoading: loadingRecentSessions } = useMyRecentSessions();

    const createSessionMutation = useCreateSession();

    // Filter questions created by the current teacher (not system questions)
    const questions = (questionsData || []).filter(
        (q) => !q.isSystem && q.createdBy?.clerkId === user?.id
    );
    const recentSessions = recentSessionsData?.sessions || [];

    const handleCreateRoom = () => {
        if (!roomConfig.questionId) return;

        createSessionMutation.mutate(
            {
                questionId: roomConfig.questionId,
                problem: roomConfig.problem,
                difficulty: roomConfig.difficulty.toLowerCase(),
                sessionType: sessionType,
            },
            {
                onSuccess: (data) => {
                    setShowCreateModal(false);
                    setRoomConfig({ questionId: "", problem: "", difficulty: "" });
                    setCreatedSession(data);
                },
            }
        );
    };

    const handleJoinCreatedSession = () => {
        if (createdSession?.session?._id) {
            navigate(`/session/${createdSession.session._id}`);
        }
    };

    const handleDownloadTranscript = async (sessionId) => {
        setDownloadingId(sessionId);
        try {
            const response = await axiosInstance.get(`/sessions/${sessionId}/transcript/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transcript-${sessionId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download transcript:', error);
        } finally {
            setDownloadingId(null);
        }
    };

    const stats = [
        {
            label: "Total Questions",
            value: questions.length,
            icon: FileTextIcon,
            gradient: "from-primary to-secondary",
        },
        {
            label: "Sessions Completed",
            value: recentSessions.length,
            icon: ClockIcon,
            gradient: "from-secondary to-accent",
        },
        {
            label: "Students Taught",
            value: new Set(recentSessions.map(s => s.participant?.clerkId)).size || 0,
            icon: UsersIcon,
            gradient: "from-accent to-primary",
        },
    ];

    return (
        <DashboardLayout role="teacher">
            {/* Welcome Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                        <SparklesIcon className="size-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Teacher Dashboard</span>
                        </h1>
                        <p className="text-base-content/60">Create questions, start sessions, and track student progress</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {stats.map((stat, idx) => (
                    <div
                        key={idx}
                        className="card bg-base-100 shadow-xl border border-base-content/10 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
                    >
                        <div className="card-body p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-base-content/50 mb-1">{stat.label}</p>
                                    <p className="text-3xl font-bold">{stat.value}</p>
                                </div>
                                <div className={`size-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                    <stat.icon className="size-7 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Create Question Card */}
                <Link
                    to="/questions/create"
                    className="card bg-base-100 shadow-xl border border-base-content/10 hover:shadow-2xl hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group"
                >
                    <div className="card-body p-8">
                        <div className="flex items-start gap-5">
                            <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                                <PlusIcon className="size-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2">Create Question</h2>
                                <p className="text-base-content/60 mb-4">
                                    Add a new coding problem with test cases for your students
                                </p>
                                <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                                    Get Started <ArrowRightIcon className="size-4" />
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Start Session Card */}
                <button
                    onClick={() => setShowSessionTypeModal(true)}
                    className="card bg-base-100 shadow-xl border border-base-content/10 hover:shadow-2xl hover:border-secondary/30 hover:scale-[1.01] transition-all duration-300 group text-left"
                >
                    <div className="card-body p-8">
                        <div className="flex items-start gap-5">
                            <div className="size-14 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg">
                                <PlayIcon className="size-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-2xl font-bold mb-2">Start Session</h2>
                                <p className="text-base-content/60 mb-4">
                                    Create a tutoring session and share the access code with your student
                                </p>
                                <span className="inline-flex items-center gap-2 text-secondary font-semibold group-hover:gap-3 transition-all">
                                    Launch Session <ArrowRightIcon className="size-4" />
                                </span>
                            </div>
                        </div>
                    </div>
                </button>
            </div>

            {/* Content Grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* My Questions */}
                <div className="card bg-base-100 shadow-xl border border-base-content/10">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <BookOpenIcon className="size-5 text-primary" />
                                My Questions
                            </h2>
                            <Link to="/questions/create" className="btn btn-ghost btn-sm">
                                + Add
                            </Link>
                        </div>

                        {loadingQuestions ? (
                            <div className="flex justify-center py-8">
                                <Loader2Icon className="size-8 animate-spin text-primary" />
                            </div>
                        ) : questions.length === 0 ? (
                            <div className="text-center py-8">
                                <FileTextIcon className="size-12 mx-auto text-base-content/20 mb-3" />
                                <p className="text-base-content/50 mb-4">No questions yet</p>
                                <Link to="/questions/create" className="btn btn-primary btn-sm">
                                    Create First Question
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-72 overflow-y-auto">
                                {questions.slice(0, 6).map((q) => (
                                    <div
                                        key={q._id}
                                        className="flex items-center justify-between p-3 bg-base-200/50 rounded-xl hover:bg-base-200 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{q.title}</p>
                                            <span className={`badge badge-sm ${getDifficultyBadgeClass(q.difficulty)}`}>
                                                {q.difficulty}
                                            </span>
                                        </div>
                                        <span className="text-xs text-base-content/40 ml-2">
                                            {q.testCases?.length || 0} tests
                                        </span>
                                    </div>
                                ))}
                                {questions.length > 6 && (
                                    <p className="text-center text-sm text-base-content/40 pt-2">
                                        +{questions.length - 6} more
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* How It Works */}
                <div className="card bg-base-100 shadow-xl border border-base-content/10">
                    <div className="card-body">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <TrendingUpIcon className="size-5 text-accent" />
                            How Sessions Work
                        </h2>
                        <div className="space-y-5">
                            {[
                                { num: 1, title: "Create a Session", desc: "Select a question and start a new session", color: "primary" },
                                { num: 2, title: "Share Access Code", desc: "Send the 6-digit code to your student", color: "secondary" },
                                { num: 3, title: "Start Tutoring", desc: "Collaborate with video, chat, and code editor", color: "accent" },
                            ].map((step) => (
                                <div key={step.num} className="flex gap-4">
                                    <div className={`size-10 rounded-xl bg-${step.color}/10 flex items-center justify-center text-${step.color} font-bold flex-shrink-0`}>
                                        {step.num}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{step.title}</p>
                                        <p className="text-sm text-base-content/50">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Sessions */}
            <div className="card bg-base-100 shadow-xl border border-base-content/10">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ClockIcon className="size-5 text-accent" />
                            Recent Sessions
                        </h2>
                        <Link to="/sessions" className="btn btn-ghost btn-sm">
                            View All
                        </Link>
                    </div>

                    {loadingRecentSessions ? (
                        <div className="flex justify-center py-8">
                            <Loader2Icon className="size-8 animate-spin text-accent" />
                        </div>
                    ) : recentSessions.length === 0 ? (
                        <div className="text-center py-8">
                            <ClockIcon className="size-12 mx-auto text-base-content/20 mb-3" />
                            <p className="text-base-content/50">No completed sessions yet</p>
                        </div>
                    ) : (
                        <div className="max-h-[400px] overflow-y-auto rounded-xl border border-base-300">
                            <table className="table table-zebra w-full">
                                <thead className="sticky top-0 bg-base-200 z-10">
                                    <tr>
                                        <th className="text-base-content/70">Problem</th>
                                        <th className="text-base-content/70">Difficulty</th>
                                        <th className="text-base-content/70">Type</th>
                                        <th className="text-base-content/70">Student</th>
                                        <th className="text-base-content/70">Completed</th>
                                        <th className="text-base-content/70 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentSessions.slice(0, 10).map((session) => (
                                        <tr key={session._id} className="hover:bg-base-200/50 transition-colors">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm bg-primary/10 text-primary">
                                                        <BookOpenIcon className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-base-content">{session.problem}</div>
                                                        <div className="text-xs text-base-content/50">
                                                            {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge badge-sm ${getDifficultyBadgeClass(session.difficulty)}`}>
                                                    {session.difficulty}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-sm ${session.sessionType === 'class' ? 'badge-secondary' : 'badge-accent'} badge-outline`}>
                                                    {session.sessionType === 'class' ? 'Class' : '1:1'}
                                                </span>
                                            </td>
                                            <td className="text-base-content/80">{session.participant?.name || "—"}</td>
                                            <td className="text-sm text-base-content/60">
                                                {formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true })}
                                            </td>
                                            <td className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => handleDownloadTranscript(session._id)}
                                                        className="btn btn-ghost btn-xs gap-1"
                                                        title="Download Transcript"
                                                        disabled={downloadingId === session._id}
                                                    >
                                                        {downloadingId === session._id ? (
                                                            <>
                                                                <Loader2Icon className="w-4 h-4 animate-spin" />
                                                                <span className="hidden sm:inline">Downloading...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FileTextIcon className="w-4 h-4" />
                                                                <span className="hidden sm:inline">Transcript</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    {session.sessionType === 'one_on_one' && (
                                                        <button
                                                            onClick={() => navigate(`/feedback/${session._id}`)}
                                                            className="btn btn-primary btn-xs gap-1"
                                                        >
                                                            AI Report
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Session Type Selection Modal */}
            <SessionTypeModal
                isOpen={showSessionTypeModal}
                onClose={() => setShowSessionTypeModal(false)}
                onSelectType={(type) => {
                    setSessionType(type);
                    setShowSessionTypeModal(false);
                    setShowCreateModal(true);
                }}
            />

            {/* Create Session Modal */}
            <CreateSessionModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                roomConfig={roomConfig}
                setRoomConfig={setRoomConfig}
                onCreateRoom={handleCreateRoom}
                isCreating={createSessionMutation.isPending}
                sessionType={sessionType}
            />

            {/* Access Code Modal */}
            {createdSession && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <button
                            onClick={() => setCreatedSession(null)}
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        >
                            <XIcon className="size-4" />
                        </button>

                        <h3 className="text-xl font-bold mb-4">🎉 Session Created!</h3>

                        <AccessCodeDisplay
                            accessCode={createdSession.accessCode}
                            sessionId={createdSession.session._id}
                            sessionType={sessionType}
                        />

                        <div className="modal-action">
                            <button className="btn btn-ghost" onClick={() => setCreatedSession(null)}>
                                Close
                            </button>
                            <button className="btn btn-primary" onClick={handleJoinCreatedSession}>
                                Enter Session
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setCreatedSession(null)}></div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default TeacherDashboard;
