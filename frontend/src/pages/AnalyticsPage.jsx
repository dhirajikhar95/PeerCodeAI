import DashboardLayout from "../components/DashboardLayout";
import { useQuestions } from "../hooks/useQuestions";
import { useMyRecentSessions } from "../hooks/useSessions";
import {
    BarChart3Icon,
    TrendingUpIcon,
    UsersIcon,
    FileTextIcon,
    ClockIcon,
    Loader2Icon,
    CheckCircleIcon,
    AlertCircleIcon,
    BookOpenIcon,
    CalendarIcon,
    ZapIcon,
    GraduationCapIcon,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area,
    Legend,
} from "recharts";
import { format, subDays, isSameDay, parseISO } from "date-fns";

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#22c55e'];

const AnalyticsPage = () => {
    const { data: questions, isLoading: loadingQuestions } = useQuestions();
    const { data: sessionsData, isLoading: loadingSessions } = useMyRecentSessions();

    const sessions = sessionsData?.sessions || [];
    const completedSessions = sessions.filter(s => s.status === "completed");
    const uniqueStudents = new Set(sessions.map(s => s.participant?.clerkId).filter(Boolean));

    // Calculate stats
    const totalQuestions = questions?.length || 0;
    const totalSessions = sessions.length;
    const totalStudents = uniqueStudents.size;
    const avgSessionsPerStudent = totalStudents > 0 ? (totalSessions / totalStudents).toFixed(1) : 0;

    // Difficulty distribution
    const difficultyStats = {
        easy: questions?.filter(q => q.difficulty === "easy").length || 0,
        medium: questions?.filter(q => q.difficulty === "medium").length || 0,
        hard: questions?.filter(q => q.difficulty === "hard").length || 0,
    };

    const difficultyData = [
        { name: "Easy", value: difficultyStats.easy, color: "#22c55e" },
        { name: "Medium", value: difficultyStats.medium, color: "#f59e0b" },
        { name: "Hard", value: difficultyStats.hard, color: "#ef4444" },
    ].filter(d => d.value > 0);

    // Session type distribution
    const sessionTypeCount = { one_on_one: 0, class: 0 };
    sessions.forEach(s => {
        if (s.sessionType === 'class') sessionTypeCount.class++;
        else sessionTypeCount.one_on_one++;
    });
    const sessionTypeData = [
        { name: "1:1 Sessions", value: sessionTypeCount.one_on_one, color: "#6366f1" },
        { name: "Class Sessions", value: sessionTypeCount.class, color: "#8b5cf6" },
    ].filter(d => d.value > 0);

    // Sessions over last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const count = sessions.filter(s =>
            isSameDay(parseISO(s.createdAt), date)
        ).length;
        return {
            date: format(date, "EEE"),
            sessions: count,
        };
    });

    // Most used questions
    const questionUsage = {};
    sessions.forEach(s => {
        const problem = s.problem;
        if (problem) {
            questionUsage[problem] = (questionUsage[problem] || 0) + 1;
        }
    });
    const topQuestions = Object.entries(questionUsage)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name: name.substring(0, 20), count }));

    const isLoading = loadingQuestions || loadingSessions;
    const hasEnoughData = totalSessions >= 4;

    // Stats cards
    const statsCards = [
        {
            label: "Total Questions",
            value: totalQuestions,
            icon: FileTextIcon,
            gradient: "from-primary to-secondary",
            subtext: "in your library",
        },
        {
            label: "Total Sessions",
            value: totalSessions,
            icon: ClockIcon,
            gradient: "from-secondary to-accent",
            subtext: `${completedSessions.length} completed`,
        },
        {
            label: "Students Taught",
            value: totalStudents,
            icon: UsersIcon,
            gradient: "from-accent to-primary",
            subtext: "unique students",
        },
        {
            label: "Completion Rate",
            value: `${totalSessions > 0 ? Math.round((completedSessions.length / totalSessions) * 100) : 0}%`,
            icon: CheckCircleIcon,
            gradient: "from-success to-emerald-400",
            subtext: "of sessions",
        },
    ];

    return (
        <DashboardLayout role="teacher">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                        <BarChart3Icon className="size-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Teaching Analytics</span>
                        </h1>
                        <p className="text-base-content/60">Track your teaching impact and student engagement</p>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2Icon className="size-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Info Note */}
                    {!hasEnoughData && (
                        <div className="alert alert-info shadow-lg">
                            <AlertCircleIcon className="w-5 h-5" />
                            <div>
                                <h3 className="font-bold">Build Your Analytics Profile</h3>
                                <p className="text-sm">
                                    Conduct {4 - totalSessions} more sessions to unlock comprehensive analytics.
                                    Charts and insights work best with 4-5+ completed sessions.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {statsCards.map((stat, idx) => (
                            <div
                                key={idx}
                                className="card bg-base-100 shadow-lg border border-base-300 hover:shadow-xl transition-all duration-300"
                            >
                                <div className="card-body p-5">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-base-content/50 mb-1">{stat.label}</p>
                                            <p className="text-3xl font-bold">{stat.value}</p>
                                            <p className="text-xs text-base-content/40 mt-1">{stat.subtext}</p>
                                        </div>
                                        <div className={`size-14 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-lg`}>
                                            <stat.icon className="size-7 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Row 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sessions Over Time */}
                        <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                                <h2 className="card-title gap-2 mb-4">
                                    <CalendarIcon className="w-5 h-5 text-primary" />
                                    Sessions This Week
                                </h2>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={last7Days}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                                            <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1f2937',
                                                    border: '1px solid #374151',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="sessions"
                                                stroke="#6366f1"
                                                fill="#6366f1"
                                                fillOpacity={0.3}
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Top Questions */}
                        <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                                <h2 className="card-title gap-2 mb-4">
                                    <BookOpenIcon className="w-5 h-5 text-secondary" />
                                    Most Used Questions
                                </h2>
                                {topQuestions.length > 0 ? (
                                    <div className="h-64">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={topQuestions} layout="vertical">
                                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={11} width={100} />
                                                <Tooltip />
                                                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-base-content/50">
                                        No session data yet
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Charts Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Question Difficulty Distribution */}
                        <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                                <h2 className="card-title gap-2 mb-4">
                                    <ZapIcon className="w-5 h-5 text-warning" />
                                    Question Difficulty
                                </h2>
                                {difficultyData.length > 0 ? (
                                    <div className="h-52">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={difficultyData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {difficultyData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Legend
                                                    verticalAlign="bottom"
                                                    height={36}
                                                    formatter={(value) => <span className="text-xs text-base-content">{value}</span>}
                                                />
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-52 flex items-center justify-center text-base-content/50">
                                        No questions yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Session Types */}
                        <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                                <h2 className="card-title gap-2 mb-4">
                                    <GraduationCapIcon className="w-5 h-5 text-accent" />
                                    Session Types
                                </h2>
                                {sessionTypeData.length > 0 ? (
                                    <div className="h-52">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={sessionTypeData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={40}
                                                    outerRadius={70}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {sessionTypeData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Legend
                                                    verticalAlign="bottom"
                                                    height={36}
                                                    formatter={(value) => <span className="text-xs text-base-content">{value}</span>}
                                                />
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-52 flex items-center justify-center text-base-content/50">
                                        No sessions yet
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick Insights */}
                        <div className="card bg-base-100 shadow-lg border border-base-300">
                            <div className="card-body">
                                <h2 className="card-title gap-2 mb-4">
                                    <TrendingUpIcon className="w-5 h-5 text-success" />
                                    Quick Insights
                                </h2>
                                <div className="space-y-4">
                                    <div className="p-4 bg-base-200 rounded-xl">
                                        <p className="text-sm text-base-content/50">Avg Sessions per Student</p>
                                        <p className="text-2xl font-bold">{avgSessionsPerStudent}</p>
                                    </div>
                                    <div className="p-4 bg-base-200 rounded-xl">
                                        <p className="text-sm text-base-content/50">1:1 vs Class Ratio</p>
                                        <p className="text-2xl font-bold">
                                            {sessionTypeCount.one_on_one}:{sessionTypeCount.class}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-base-200 rounded-xl">
                                        <p className="text-sm text-base-content/50">Sessions Today</p>
                                        <p className="text-2xl font-bold">{last7Days[6]?.sessions || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Sessions Table */}
                    <div className="card bg-base-100 shadow-lg border border-base-300">
                        <div className="card-body">
                            <h2 className="card-title gap-2 mb-4">
                                <ClockIcon className="w-5 h-5 text-info" />
                                Recent Sessions
                            </h2>
                            {sessions.length > 0 ? (
                                <div className="overflow-x-auto max-h-80 rounded-lg border border-base-300">
                                    <table className="table table-zebra w-full">
                                        <thead className="sticky top-0 bg-base-200 z-10">
                                            <tr>
                                                <th>Problem</th>
                                                <th>Student</th>
                                                <th>Type</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sessions.slice(0, 10).map((session) => (
                                                <tr key={session._id}>
                                                    <td className="font-medium">{session.problem}</td>
                                                    <td>
                                                        {session.participant?.name || "No student yet"}
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-sm badge-outline ${session.sessionType === 'class' ? 'badge-secondary' : 'badge-accent'
                                                            }`}>
                                                            {session.sessionType === 'class' ? 'Class' : '1:1'}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge badge-sm ${session.status === 'completed' ? 'badge-success' : 'badge-warning'
                                                            }`}>
                                                            {session.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-sm text-base-content/60">
                                                        {format(new Date(session.createdAt), "MMM d, h:mm a")}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-base-content/50">
                                    <ClockIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p>No sessions yet. Create your first session to see analytics!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default AnalyticsPage;
