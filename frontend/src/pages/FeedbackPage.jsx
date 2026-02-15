import { useParams, useNavigate } from "react-router";
import { useSessionById } from "../hooks/useSessions";
import { useAIFeedback } from "../hooks/useAIFeedback";
import { useUserRole } from "../hooks/useUserRole";
import DashboardLayout from "../components/DashboardLayout";
import { format } from "date-fns";
import ReactDiffViewer, { DiffMethod } from "react-diff-viewer-continued";
import {
    Loader2Icon,
    ArrowLeftIcon,
    CodeIcon,
    LightbulbIcon,
    AlertCircleIcon,
    TrendingUpIcon,
    ClockIcon,
    DatabaseIcon,
    TagIcon,
    CheckCircleIcon,
    XCircleIcon,
    AlertTriangleIcon,
    UserIcon,
    CalendarIcon,
    TimerIcon,
    CodeXmlIcon,
    UsersIcon,
    GraduationCapIcon,
    AlertOctagonIcon,
    TestTube2Icon,
    CheckCircle2Icon,
    FileTextIcon,
    BrainCircuitIcon,
} from "lucide-react";
import axiosInstance from "../lib/axios";

import { useState } from "react";

const FeedbackPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: sessionData, isLoading: loadingSession } = useSessionById(id);
    const { data: feedback, isLoading: loadingFeedback } = useAIFeedback(id);
    const { data: userData } = useUserRole();
    const session = sessionData?.session;
    const role = userData?.role || "student";
    const [downloadingTranscript, setDownloadingTranscript] = useState(false);

    const isLoading = loadingSession || loadingFeedback;

    const getCorrectnessIcon = (correctness) => {
        switch (correctness?.toLowerCase()) {
            case "correct":
                return <CheckCircleIcon className="w-6 h-6 text-success" />;
            case "partially correct":
                return <AlertTriangleIcon className="w-6 h-6 text-warning" />;
            default:
                return <XCircleIcon className="w-6 h-6 text-error" />;
        }
    };

    const getCorrectnessClass = (correctness) => {
        switch (correctness?.toLowerCase()) {
            case "correct":
                return "text-success";
            case "partially correct":
                return "text-warning";
            default:
                return "text-error";
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return "text-success";
        if (score >= 50) return "text-warning";
        return "text-error";
    };

    const getLanguageLabel = (lang) => {
        const labels = {
            javascript: "JavaScript",
            python: "Python",
            java: "Java",
            cpp: "C++",
        };
        return labels[lang] || lang || "JavaScript";
    };

    const getFeedbackTypeBadge = (type) => {
        switch (type) {
            case "teacher_assisted":
                return <span className="badge badge-info gap-1"><UsersIcon className="w-3 h-3" /> Teacher Assisted</span>;
            case "no_student_code":
                return <span className="badge badge-warning gap-1"><AlertOctagonIcon className="w-3 h-3" /> No Student Code</span>;
            default:
                return null; // No badge for student_only (independent work)
        }
    };

    // Check if feedback actually has real AI content (not just an empty/stale document)
    const hasFeedbackContent = feedback && !feedback.isProcessing && (feedback.logicFeedback || feedback.correctness || feedback.feedbackType === "no_student_code");
    const isAIProcessing = !hasFeedbackContent;

    if (isLoading || isAIProcessing) {
        return (
            <DashboardLayout role={role}>
                <div className="flex flex-col items-center justify-center min-h-[70vh]">
                    <div className="relative mb-6">
                        <div className="size-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <BrainCircuitIcon className="size-10 text-primary animate-pulse" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-base-content mb-2">
                        {isLoading ? "Loading..." : "AI is Analyzing..."}
                    </h2>
                    <p className="text-base-content/60 text-center max-w-md mb-4">
                        {isLoading
                            ? "Loading session data..."
                            : feedback?.message || "The AI is reviewing the code and generating a detailed report. This usually takes 15-30 seconds."}
                    </p>
                    <div className="flex gap-2">
                        <span className="size-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="size-2 rounded-full bg-secondary animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="size-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!session) {
        return (
            <DashboardLayout role={role}>
                <div className="container mx-auto px-6 py-10">
                    <div className="alert alert-error">
                        <AlertCircleIcon className="w-6 h-6" />
                        <span>Session not found</span>
                    </div>
                </div>
            </DashboardLayout>
        );
    }
    // Get feedbackType - prefer session since it's determined at end, then feedback
    const feedbackType = session?.feedbackType || feedback?.feedbackType || "student_only";
    const isNoStudentCode = feedbackType === "no_student_code";
    const isTeacherAssisted = feedbackType === "teacher_assisted";
    const studentCode = feedback?.studentCode || session?.studentCodeSnapshot || "";
    const teacherCode = feedback?.teacherCode || session?.teacherCodeSnapshot || "";
    const testSummary = feedback?.testCaseSummary || session?.testCaseSummary;
    const testResults = feedback?.testCaseResults || session?.testCaseResults;

    // Handle back navigation - fallback to dashboard if no history
    const handleBack = () => {
        // Check if there's history to go back to
        if (window.history.length > 2) {
            navigate(-1);
        } else {
            // Fallback to appropriate dashboard
            navigate(role === "teacher" ? "/teacher/dashboard" : "/student/dashboard");
        }
    };

    const handleDownloadTranscript = async () => {
        setDownloadingTranscript(true);
        try {
            const response = await axiosInstance.get(`/sessions/${id}/transcript/pdf`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `transcript-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Failed to download transcript:', error);
        } finally {
            setDownloadingTranscript(false);
        }
    };

    return (
        <DashboardLayout role={role}>
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handleBack}
                    className="btn btn-ghost btn-sm gap-2"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    {role === "teacher" ? "Back to Sessions" : "Back to Dashboard"}
                </button>
                <button
                    onClick={handleDownloadTranscript}
                    className="btn btn-outline btn-sm gap-2"
                    title="Download session transcript"
                    disabled={downloadingTranscript}
                >
                    {downloadingTranscript ? (
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Downloading...
                        </>
                    ) : (
                        <>
                            <FileTextIcon className="w-4 h-4" />
                            Download Transcript
                        </>
                    )}
                </button>
            </div>

            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="size-14 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                        <TrendingUpIcon className="size-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI Report</span>
                        </h1>
                        <p className="text-base-content/60 mt-1">
                            AI-powered analysis of the coding session
                        </p>
                    </div>
                </div>

                {/* Session Info Card */}
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body">
                        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
                            <h3 className="font-semibold text-base-content/70">Session Details</h3>
                            {feedback && getFeedbackTypeBadge(feedbackType)}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <CodeXmlIcon className="size-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs text-base-content/50 uppercase tracking-wide">Problem</p>
                                    <p className="font-semibold text-base-content">{session.problem}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                                    <TimerIcon className="size-5 text-secondary" />
                                </div>
                                <div>
                                    <p className="text-xs text-base-content/50 uppercase tracking-wide">Difficulty</p>
                                    <span className={`badge badge-sm uppercase ${session.difficulty === 'easy' ? 'badge-success' : session.difficulty === 'medium' ? 'badge-warning' : 'badge-error'}`}>
                                        {session.difficulty}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <CodeIcon className="size-5 text-accent" />
                                </div>
                                <div>
                                    <p className="text-xs text-base-content/50 uppercase tracking-wide">Language</p>
                                    <p className="font-semibold text-base-content">{getLanguageLabel(session.language)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-info/10 flex items-center justify-center">
                                    <CalendarIcon className="size-5 text-info" />
                                </div>
                                <div>
                                    <p className="text-xs text-base-content/50 uppercase tracking-wide">Completed</p>
                                    <p className="font-semibold text-base-content">
                                        {session.updatedAt ? format(new Date(session.updatedAt), "MMM d, yyyy") : "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Case 3: Student Did Not Attempt */}
                    {isNoStudentCode && (
                        <div className="card bg-warning/10 shadow-lg border border-warning/30">
                            <div className="card-body">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-warning/20 rounded-full">
                                        <AlertOctagonIcon className="w-8 h-8 text-warning" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-warning">Student Did Not Attempt</h3>
                                        <p className="text-base-content/70 mt-1">
                                            No code was written by the student during this session.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4 p-4 bg-base-100 rounded-lg border border-base-300">
                                    <p className="text-base-content/80">
                                        The solution shown below was provided entirely by the teacher. To receive personalized AI feedback,
                                        students should attempt to write their own code in future sessions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Case 2: Teacher Assisted Info */}
                    {isTeacherAssisted && (
                        <div className="alert alert-info shadow-lg border border-info/30">
                            <UsersIcon className="w-6 h-6" />
                            <div>
                                <h3 className="font-bold">Teacher Assisted Session</h3>
                                <div className="text-sm">
                                    The teacher provided guidance during this session. See the code comparison below.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Test Case Results */}
                    {testSummary && testSummary.total > 0 && (
                        <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                                <h2 className="card-title gap-2 mb-3">
                                    <div className="size-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                                        <TestTube2Icon className="w-4 h-4 text-purple-500" />
                                    </div>
                                    Test Results
                                    <span className={`badge ml-2 ${testSummary.failed === 0 ? 'badge-success' : 'badge-error'}`}>
                                        {testSummary.passed}/{testSummary.total} Passed
                                    </span>
                                </h2>
                                <div className="grid grid-cols-3 gap-4 mt-2">
                                    <div className="text-center p-3 bg-base-200 rounded-lg">
                                        <div className="text-2xl font-bold">{testSummary.total}</div>
                                        <div className="text-xs text-base-content/60">Total Tests</div>
                                    </div>
                                    <div className="text-center p-3 bg-success/10 rounded-lg">
                                        <div className="text-2xl font-bold text-success">{testSummary.passed}</div>
                                        <div className="text-xs text-success">Passed</div>
                                    </div>
                                    <div className="text-center p-3 bg-error/10 rounded-lg">
                                        <div className="text-2xl font-bold text-error">{testSummary.failed}</div>
                                        <div className="text-xs text-error">Failed</div>
                                    </div>
                                </div>
                                {testResults && testResults.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {testResults.map((tc, idx) => (
                                            <div key={idx} className={`p-3 rounded-lg border ${tc.passed ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'}`}>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {tc.passed ? (
                                                        <CheckCircle2Icon className="w-4 h-4 text-success" />
                                                    ) : (
                                                        <XCircleIcon className="w-4 h-4 text-error" />
                                                    )}
                                                    <span className="font-medium text-sm">Test {idx + 1}</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 text-xs">
                                                    <div>
                                                        <span className="text-base-content/60">Input:</span>
                                                        <pre className="bg-base-200 p-1 rounded mt-1 overflow-x-auto">{tc.input}</pre>
                                                    </div>
                                                    <div>
                                                        <span className="text-base-content/60">Expected:</span>
                                                        <pre className="bg-base-200 p-1 rounded mt-1 overflow-x-auto">{tc.expected}</pre>
                                                    </div>
                                                    <div>
                                                        <span className="text-base-content/60">Actual:</span>
                                                        <pre className={`p-1 rounded mt-1 overflow-x-auto ${tc.passed ? 'bg-success/10' : 'bg-error/10'}`}>{tc.actual}</pre>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Score & Correctness - Only for Case 1 & 2 */}
                    {!isNoStudentCode && (
                        <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-base-200 rounded-full border border-base-300">
                                            {getCorrectnessIcon(feedback.correctness)}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold">
                                                <span className={getCorrectnessClass(feedback.correctness)}>
                                                    {feedback.correctness}
                                                </span>
                                            </h2>
                                            <p className="text-base-content/60 text-sm">Overall Assessment</p>
                                        </div>
                                    </div>
                                    <div className="text-center">
                                        <div
                                            className={`radial-progress ${getScoreColor(feedback.score)} font-bold shadow-lg border-4 border-base-200`}
                                            style={{ "--value": feedback.score, "--size": "5.5rem", "--thickness": "0.5rem" }}
                                            role="progressbar"
                                        >
                                            <span className="text-2xl">{feedback.score}</span>
                                        </div>
                                        <p className="text-xs text-base-content/50 mt-1">Score</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Logic Feedback */}
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <h2 className="card-title gap-2 border-b border-base-300 pb-3 mb-3">
                                <div className="size-8 rounded-lg bg-warning/10 flex items-center justify-center">
                                    <LightbulbIcon className="w-4 h-4 text-warning" />
                                </div>
                                {isNoStudentCode ? "AI Analysis" : "Logic & Approach Analysis"}
                            </h2>
                            <p className="text-base-content/80 whitespace-pre-wrap leading-relaxed">
                                {feedback.logicFeedback}
                            </p>
                        </div>
                    </div>

                    {/* Complexity Analysis - Only for Case 1 & 2 */}
                    {!isNoStudentCode && (
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="card bg-base-100 shadow-lg border border-base-300">
                                <div className="card-body">
                                    <h2 className="card-title gap-2 text-base">
                                        <div className="size-8 rounded-lg bg-info/10 flex items-center justify-center">
                                            <ClockIcon className="w-4 h-4 text-info" />
                                        </div>
                                        Time Complexity
                                    </h2>
                                    <p className="text-base font-mono font-semibold text-info mt-2">
                                        {feedback.timeComplexity}
                                    </p>
                                </div>
                            </div>
                            <div className="card bg-base-100 shadow-lg border border-base-300">
                                <div className="card-body">
                                    <h2 className="card-title gap-2 text-base">
                                        <div className="size-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                                            <DatabaseIcon className="w-4 h-4 text-secondary" />
                                        </div>
                                        Space Complexity
                                    </h2>
                                    <p className="text-base font-mono font-semibold text-secondary mt-2">
                                        {feedback.spaceComplexity}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mistakes - Only for Case 1 & 2 */}
                    {!isNoStudentCode && feedback.commonMistake && feedback.commonMistake !== "None identified" && (
                        <div className="card bg-error/5 shadow-lg border border-error/30">
                            <div className="card-body">
                                <h2 className="card-title gap-2 text-error">
                                    <div className="size-8 rounded-lg bg-error/10 flex items-center justify-center">
                                        <AlertCircleIcon className="w-4 h-4" />
                                    </div>
                                    Common Mistake Identified
                                </h2>
                                <p className="text-base-content/80 whitespace-pre-wrap mt-2">
                                    {feedback.commonMistake}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Improvements */}
                    {feedback.improvementSuggestion && (
                        <div className="card bg-success/5 shadow-lg border border-success/30">
                            <div className="card-body">
                                <h2 className="card-title gap-2 text-success">
                                    <div className="size-8 rounded-lg bg-success/10 flex items-center justify-center">
                                        <TrendingUpIcon className="w-4 h-4" />
                                    </div>
                                    {isNoStudentCode ? "Next Steps" : "Improvement Suggestion"}
                                </h2>
                                <p className="text-base-content/80 whitespace-pre-wrap mt-2">
                                    {feedback.improvementSuggestion}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Concept Tags - Only for Case 1 & 2 */}
                    {!isNoStudentCode && feedback.conceptTags && feedback.conceptTags.length > 0 && (
                        <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                                <h2 className="card-title gap-2 mb-3">
                                    <div className="size-8 rounded-lg bg-accent/10 flex items-center justify-center">
                                        <TagIcon className="w-4 h-4 text-accent" />
                                    </div>
                                    Programming Concepts
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {feedback.conceptTags.map((concept, idx) => (
                                        <span key={idx} className="badge badge-lg badge-accent badge-outline capitalize">
                                            {concept}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Code Diff View - Only for Case 2 */}
                    {isTeacherAssisted && studentCode && teacherCode && (
                        <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                                <h2 className="card-title gap-2 mb-3">
                                    <div className="size-8 rounded-lg bg-info/10 flex items-center justify-center">
                                        <UsersIcon className="w-4 h-4 text-info" />
                                    </div>
                                    Code Comparison
                                </h2>
                                {/* Legend */}
                                <div className="flex items-center gap-6 mb-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500/50"></div>
                                        <span className="text-base-content/70">Removed by teacher</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-green-500/30 border border-green-500/50"></div>
                                        <span className="text-base-content/70">Added by teacher</span>
                                    </div>
                                </div>
                                <div className="rounded-xl overflow-hidden border-2 border-base-300 shadow-inner">
                                    <ReactDiffViewer
                                        oldValue={studentCode}
                                        newValue={teacherCode}
                                        splitView={true}
                                        leftTitle="📝 Student's Original Code"
                                        rightTitle="✅ Teacher's Corrected Code"
                                        compareMethod={DiffMethod.LINES}
                                        useDarkTheme={true}
                                        showDiffOnly={false}
                                        styles={{
                                            variables: {
                                                dark: {
                                                    diffViewerBackground: '#1a1a2e',
                                                    diffViewerColor: '#e4e4e7',
                                                    addedBackground: '#1e3a29',
                                                    addedColor: '#4ade80',
                                                    removedBackground: '#3a1e1e',
                                                    removedColor: '#f87171',
                                                    wordAddedBackground: '#22c55e40',
                                                    wordRemovedBackground: '#ef444440',
                                                    addedGutterBackground: '#1e3a29',
                                                    removedGutterBackground: '#3a1e1e',
                                                    gutterBackground: '#16162a',
                                                    gutterBackgroundDark: '#0d0d1a',
                                                    highlightBackground: '#2563eb20',
                                                    highlightGutterBackground: '#2563eb30',
                                                    codeFoldGutterBackground: '#16162a',
                                                    codeFoldBackground: '#1a1a2e',
                                                    emptyLineBackground: '#1a1a2e',
                                                    titleBlock: '#1e1e2e',
                                                    titleBlockCursor: 'pointer',
                                                }
                                            },
                                            contentText: {
                                                fontSize: "13px",
                                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                                lineHeight: "1.6"
                                            },
                                            titleBlock: {
                                                padding: '12px 16px',
                                                fontWeight: '600',
                                                fontSize: '14px',
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Student Code - Case 1 only */}
                    {!isNoStudentCode && !isTeacherAssisted && studentCode && (
                        <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                                <h2 className="card-title gap-2 mb-3">
                                    <div className="size-8 rounded-lg bg-neutral/10 flex items-center justify-center">
                                        <GraduationCapIcon className="w-4 h-4 text-base-content" />
                                    </div>
                                    Student's Submitted Code
                                    <span className="badge badge-ghost badge-sm ml-2">{getLanguageLabel(session.language)}</span>
                                </h2>
                                <div className="bg-gray-900 rounded-lg text-sm overflow-x-auto">
                                    <pre className="px-6 py-4 text-gray-100 whitespace-pre-wrap"><code>{studentCode}</code></pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Teacher's Solution - Case 3 only */}
                    {isNoStudentCode && teacherCode && (
                        <div className="card bg-base-100 shadow-lg border border-primary/30">
                            <div className="card-body">
                                <h2 className="card-title gap-2 mb-3">
                                    <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <UserIcon className="w-4 h-4 text-primary" />
                                    </div>
                                    Teacher's Solution
                                    <span className="badge badge-primary badge-sm ml-2">{getLanguageLabel(session.language)}</span>
                                </h2>
                                <div className="bg-slate-800 rounded-lg text-sm overflow-x-auto border border-primary/30">
                                    <pre className="px-6 py-4 text-gray-100 whitespace-pre-wrap"><code>{teacherCode}</code></pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default FeedbackPage;
