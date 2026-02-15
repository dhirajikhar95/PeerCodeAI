import { useNavigate, Link } from "react-router";
import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useMyRecentSessions } from "../hooks/useSessions";
import { SkeletonStat, SkeletonTable } from "../components/Skeletons";
import {
    ClockIcon,
    Loader2Icon,
    BookOpenIcon,
    HistoryIcon,
    EyeIcon,
    PlayIcon,
    CheckCircleIcon,
    AlertCircleIcon,
    UsersIcon,
    FileTextIcon,
} from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import axiosInstance from "../lib/axios";

const MySessionsPage = () => {
    const navigate = useNavigate();
    const { data: sessionsData, isLoading } = useMyRecentSessions();
    const sessions = sessionsData?.sessions || [];
    const [downloadingId, setDownloadingId] = useState(null);

    const activeSessions = sessions.filter(s => s.status === "active");
    const completedSessions = sessions.filter(s => s.status === "completed");

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

    if (isLoading) {
        return (
            <DashboardLayout role="student">
                {/* Skeleton Header */}
                <div className="mb-8 animate-pulse">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-12 rounded-2xl bg-base-300"></div>
                        <div className="space-y-2">
                            <div className="h-8 w-40 bg-base-300 rounded"></div>
                            <div className="h-4 w-64 bg-base-300 rounded"></div>
                        </div>
                    </div>
                </div>
                {/* Skeleton Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <SkeletonStat />
                    <SkeletonStat />
                    <SkeletonStat />
                </div>
                {/* Skeleton Table */}
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body">
                        <div className="h-6 w-48 bg-base-300 rounded mb-4"></div>
                        <SkeletonTable rows={4} columns={5} />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="student">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                        <HistoryIcon className="size-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                My Sessions
                            </span>
                        </h1>
                        <p className="text-base-content/60">View your tutoring session history and AI reports</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/50">Total Sessions</p>
                                <p className="text-3xl font-bold">{sessions.length}</p>
                            </div>
                            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <ClockIcon className="size-6 text-primary" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/50">Completed</p>
                                <p className="text-3xl font-bold">{completedSessions.length}</p>
                            </div>
                            <div className="size-12 rounded-xl bg-success/10 flex items-center justify-center">
                                <CheckCircleIcon className="size-6 text-success" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body p-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-base-content/50">Active</p>
                                <p className="text-3xl font-bold">{activeSessions.length}</p>
                            </div>
                            <div className="size-12 rounded-xl bg-warning/10 flex items-center justify-center">
                                <AlertCircleIcon className="size-6 text-warning" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sessions Table */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
                <div className="card-body">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <ClockIcon className="size-5 text-accent" />
                            Session History
                        </h2>
                        {sessions.length > 0 && (
                            <span className="badge badge-ghost">{sessions.length} sessions</span>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2Icon className="size-8 animate-spin text-primary" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="size-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                                <ClockIcon className="size-10 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
                            <p className="text-base-content/50 mb-6">
                                Join a tutoring session to get started
                            </p>
                            <Link to="/join-session" className="btn btn-primary">
                                Join a Session
                            </Link>
                        </div>
                    ) : (
                        <div className="max-h-[500px] overflow-y-auto rounded-xl border border-base-300">
                            <table className="table table-zebra w-full">
                                <thead className="sticky top-0 bg-base-200 z-10">
                                    <tr>
                                        <th className="text-base-content/70">Problem</th>
                                        <th className="text-base-content/70">Difficulty</th>
                                        <th className="text-base-content/70">Type</th>
                                        <th className="text-base-content/70">Date</th>
                                        <th className="text-base-content/70">Status</th>
                                        <th className="text-base-content/70 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessions.map((session) => (
                                        <tr key={session._id} className="hover:bg-base-200/50 transition-colors">
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${session.status === "active"
                                                        ? "bg-success/20 text-success"
                                                        : "bg-primary/10 text-primary"
                                                        }`}>
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
                                                <span className={`badge badge-sm badge-outline ${session.sessionType === 'class' ? 'badge-secondary' : 'badge-accent'
                                                    }`}>
                                                    {session.sessionType === 'class' ? 'Class' : '1:1'}
                                                </span>
                                            </td>
                                            <td className="text-sm text-base-content/60">
                                                {format(new Date(session.createdAt), "MMM d, yyyy")}
                                            </td>
                                            <td>
                                                {session.status === "active" ? (
                                                    <span className="badge badge-success gap-1">
                                                        <div className="w-1.5 h-1.5 bg-success-content rounded-full animate-pulse" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-ghost gap-1">
                                                        <CheckCircleIcon className="w-3 h-3" />
                                                        Completed
                                                    </span>
                                                )}
                                            </td>
                                            <td className="text-right">
                                                <div className="flex gap-2 justify-end">
                                                    {session.status === "completed" && (
                                                        <button
                                                            onClick={() => handleDownloadTranscript(session._id)}
                                                            className="btn btn-ghost btn-sm gap-1"
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
                                                    )}
                                                    {session.status === "completed" && session.sessionType === 'one_on_one' && (
                                                        <button
                                                            onClick={() => navigate(`/feedback/${session._id}`)}
                                                            className="btn btn-primary btn-sm gap-1"
                                                        >
                                                            <EyeIcon className="w-4 h-4" />
                                                            AI Report
                                                        </button>
                                                    )}
                                                    {session.status === "active" && (
                                                        <button
                                                            onClick={() => navigate(`/session/${session._id}`)}
                                                            className="btn btn-success btn-sm gap-1"
                                                        >
                                                            <PlayIcon className="w-4 h-4" />
                                                            Join
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
        </DashboardLayout>
    );
};

export default MySessionsPage;
