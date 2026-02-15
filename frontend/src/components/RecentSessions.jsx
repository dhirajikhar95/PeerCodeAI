import { Clock, Users, EyeIcon, Loader2Icon, TrophyIcon, CheckCircleIcon, FileTextIcon, BookOpenIcon, PlayIcon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import { Link, useNavigate } from "react-router";
import axiosInstance from "../lib/axios";
import { useState } from "react";

function RecentSessions({ sessions, isLoading }) {
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState(null);

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


  return (
    <div className="card bg-base-100 shadow-lg border border-base-300 mt-8">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-accent to-secondary rounded-xl shadow-lg">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-base-content">Your Past Sessions</h2>
          </div>
          {sessions.length > 0 && (
            <span className="badge badge-ghost">{sessions.length} sessions</span>
          )}
        </div>

        {/* Scrollable Table Container */}
        <div className="max-h-[500px] overflow-y-auto rounded-xl border border-base-300">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2Icon className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : sessions.length > 0 ? (
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
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-accent/20 to-secondary/20 rounded-2xl flex items-center justify-center">
                <TrophyIcon className="w-8 h-8 text-accent" />
              </div>
              <p className="text-lg font-semibold text-base-content/80 mb-1">No sessions yet</p>
              <p className="text-sm text-base-content/50">Join a session to start your coding journey!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecentSessions;
