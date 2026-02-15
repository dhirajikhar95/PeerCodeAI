import { Link, useNavigate } from "react-router";
import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useMyRecentSessions } from "../hooks/useSessions";
import { SkeletonStat, SkeletonTable } from "../components/Skeletons";
import {
    ClockIcon,
    Loader2Icon,
    BookOpenIcon,
    PlayIcon,
    FileTextIcon,
    CheckCircleIcon,
    EyeIcon,
} from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import axiosInstance from "../lib/axios";

const SessionsPage = () => {
    const navigate = useNavigate();
    const { data: sessionsData, isLoading } = useMyRecentSessions();
    const sessions = sessionsData?.sessions || [];
    const [downloadingId, setDownloadingId] = useState(null);

    // Separate active and completed sessions
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
            <DashboardLayout role="teacher">
                {/* Skeleton Header */}
                <div className="mb-8 animate-pulse">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-12 rounded-2xl bg-base-300"></div>
                        <div className="space-y-2">
                            <div className="h-8 w-40 bg-base-300 rounded"></div>
                            <div className="h-4 w-56 bg-base-300 rounded"></div>
                        </div>
                    </div>
                </div>
                {/* Skeleton Table */}
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body">
                        <div className="h-6 w-32 bg-base-300 rounded mb-4"></div>
                        <SkeletonTable rows={5} columns={6} />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="teacher">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                        <ClockIcon className="size-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Sessions</span>
                        </h1>
                        <p className="text-base-content/60">View and manage your tutoring sessions</p>
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {/* Active Sessions */}
                {activeSessions.length > 0 && (
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                                <PlayIcon className="size-5 text-success" />
                                Active Sessions
                            </h2>
                            <div className="grid gap-4">
                                {activeSessions.map((session) => (
                                    <div
                                        key={session._id}
                                        className="flex items-center justify-between p-4 bg-success/10 rounded-xl border border-success/20"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm bg-success/20 text-success">
                                                <BookOpenIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-semibold">{session.problem}</p>
                                                <p className="text-sm text-base-content/50">
                                                    Started {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/session/${session._id}`)}
                                            className="btn btn-success btn-sm"
                                        >
                                            Join
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Completed Sessions */}
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <ClockIcon className="size-5 text-accent" />
                                Session History
                            </h2>
                            {completedSessions.length > 0 && (
                                <span className="badge badge-ghost">{completedSessions.length} sessions</span>
                            )}
                        </div>

                        {completedSessions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="size-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                                    <ClockIcon className="size-10 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">No sessions yet</h3>
                                <p className="text-base-content/50">
                                    Your completed sessions will appear here
                                </p>
                            </div>
                        ) : (
                            <div className="max-h-[500px] overflow-y-auto rounded-xl border border-base-300">
                                <table className="table table-zebra w-full">
                                    <thead className="sticky top-0 bg-base-200 z-10">
                                        <tr>
                                            <th className="text-base-content/70">Problem</th>
                                            <th className="text-base-content/70">Difficulty</th>
                                            <th className="text-base-content/70">Type</th>
                                            <th className="text-base-content/70">Student</th>
                                            <th className="text-base-content/70">Date</th>
                                            <th className="text-base-content/70">Status</th>
                                            <th className="text-base-content/70 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {completedSessions.map((session) => (
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
                                                    <span className={`badge badge-sm badge-outline ${session.sessionType === 'class' ? 'badge-secondary' : 'badge-accent'}`}>
                                                        {session.sessionType === 'class' ? 'Class' : '1:1'}
                                                    </span>
                                                </td>
                                                <td className="text-base-content/80">
                                                    {session.participant?.name || "—"}
                                                </td>
                                                <td className="text-sm text-base-content/60">
                                                    {format(new Date(session.createdAt), "MMM d, yyyy")}
                                                </td>
                                                <td>
                                                    <span className="badge badge-ghost gap-1">
                                                        <CheckCircleIcon className="w-3 h-3" />
                                                        Completed
                                                    </span>
                                                </td>
                                                <td className="text-right">
                                                    <div className="flex gap-2 justify-end">
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
                                                        {session.sessionType === 'one_on_one' && (
                                                            <button
                                                                onClick={() => navigate(`/feedback/${session._id}`)}
                                                                className="btn btn-primary btn-sm gap-1"
                                                            >
                                                                <EyeIcon className="w-4 h-4" />
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
            </div>
        </DashboardLayout>
    );
};

export default SessionsPage;
