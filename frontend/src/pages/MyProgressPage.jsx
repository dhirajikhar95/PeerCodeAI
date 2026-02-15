import DashboardLayout from "../components/DashboardLayout";
import { useMyRecentSessions } from "../hooks/useSessions";
import { useMyFeedbackHistory, useMySkillSummary } from "../hooks/useAIFeedback";
import {
    TrendingUpIcon,
    Loader2Icon,
    BookOpenIcon,
    CheckCircleIcon,
    ClockIcon,
    StarIcon,
    TargetIcon,
    BrainIcon,
    TrophyIcon,
    AlertCircleIcon,
    BarChart3Icon,
    ZapIcon,
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
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    Legend,
} from "recharts";

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#f97316', '#eab308'];

function MyProgressPage() {
    const { data: sessionsData, isLoading: loadingSessions } = useMyRecentSessions();
    const { data: feedbackData, isLoading: loadingFeedback } = useMyFeedbackHistory();
    const { data: skillData, isLoading: loadingSkills } = useMySkillSummary();

    const sessions = sessionsData?.sessions || [];
    const feedbackHistory = feedbackData?.feedbackHistory || [];
    const skills = skillData?.skills || [];
    const stats = skillData?.stats || { totalSessions: 0, avgScore: 0, correctCount: 0 };

    const isLoading = loadingSessions || loadingFeedback || loadingSkills;

    // Prepare score trend data (last 10 sessions, chronological)
    const scoreTrendData = [...feedbackHistory]
        .slice(0, 10)
        .reverse()
        .map((fb, idx) => ({
            session: `S${idx + 1}`,
            score: fb.score || 0,
            problem: fb.problemId?.title?.substring(0, 15) || "Problem",
        }));

    // Prepare difficulty distribution
    const difficultyCount = { easy: 0, medium: 0, hard: 0 };
    feedbackHistory.forEach(fb => {
        const diff = fb.problemId?.difficulty?.toLowerCase();
        if (diff && difficultyCount.hasOwnProperty(diff)) {
            difficultyCount[diff]++;
        }
    });
    const difficultyData = [
        { name: "Easy", value: difficultyCount.easy, color: "#22c55e" },
        { name: "Medium", value: difficultyCount.medium, color: "#f59e0b" },
        { name: "Hard", value: difficultyCount.hard, color: "#ef4444" },
    ].filter(d => d.value > 0);

    // Prepare correctness distribution
    const correctnessCount = { Correct: 0, "Partially Correct": 0, Incorrect: 0 };
    feedbackHistory.forEach(fb => {
        if (fb.correctness && correctnessCount.hasOwnProperty(fb.correctness)) {
            correctnessCount[fb.correctness]++;
        }
    });
    const correctnessData = [
        { name: "Correct", value: correctnessCount.Correct, color: "#22c55e" },
        { name: "Partial", value: correctnessCount["Partially Correct"], color: "#f59e0b" },
        { name: "Incorrect", value: correctnessCount.Incorrect, color: "#ef4444" },
    ].filter(d => d.value > 0);

    // Prepare skills radar data
    const radarData = skills.slice(0, 6).map(s => ({
        skill: s._id?.charAt(0).toUpperCase() + s._id?.slice(1) || "Skill",
        proficiency: Math.round(s.avgScore || 0),
        fullMark: 100,
    }));

    // Stats cards data
    const statsCards = [
        {
            label: "Total Sessions",
            value: stats.totalSessions,
            icon: ClockIcon,
            gradient: "from-primary to-secondary",
            subtext: "completed",
        },
        {
            label: "Average Score",
            value: Math.round(stats.avgScore || 0),
            icon: TargetIcon,
            gradient: "from-secondary to-accent",
            subtext: "out of 100",
        },
        {
            label: "Correct Solutions",
            value: stats.correctCount,
            icon: CheckCircleIcon,
            gradient: "from-success to-emerald-400",
            subtext: `${stats.totalSessions > 0 ? Math.round((stats.correctCount / stats.totalSessions) * 100) : 0}% success rate`,
        },
        {
            label: "Skills Practiced",
            value: skills.length,
            icon: BrainIcon,
            gradient: "from-accent to-primary",
            subtext: "unique concepts",
        },
    ];

    if (isLoading) {
        return (
            <DashboardLayout role="student">
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2Icon className="w-10 h-10 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    const hasEnoughData = stats.totalSessions >= 4;

    return (
        <DashboardLayout role="student">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                        <TrendingUpIcon className="size-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">My Progress</span>
                        </h1>
                        <p className="text-base-content/60">Track your coding journey and skill development</p>
                    </div>
                </div>
            </div>

            {/* Note for insufficient data */}
            {!hasEnoughData && (
                <div className="alert alert-info mb-6 shadow-lg">
                    <AlertCircleIcon className="w-5 h-5" />
                    <div>
                        <h3 className="font-bold">Build Your Analytics Profile</h3>
                        <p className="text-sm">
                            Complete {4 - stats.totalSessions} more detailed sessions to unlock comprehensive analytics.
                            Charts and insights work best with 4-5+ completed sessions with AI feedback.
                        </p>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Score Trend Chart */}
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body">
                        <h2 className="card-title gap-2 mb-4">
                            <BarChart3Icon className="w-5 h-5 text-primary" />
                            Score Trend
                        </h2>
                        {scoreTrendData.length >= 2 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={scoreTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                        <XAxis dataKey="session" stroke="#9ca3af" fontSize={12} />
                                        <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#1f2937',
                                                border: '1px solid #374151',
                                                borderRadius: '8px'
                                            }}
                                            labelStyle={{ color: '#e5e7eb' }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#6366f1"
                                            strokeWidth={3}
                                            dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                                            activeDot={{ r: 6, stroke: '#6366f1', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-base-content/50">
                                Complete more sessions to see your score trend
                            </div>
                        )}
                    </div>
                </div>

                {/* Skills Radar Chart */}
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body">
                        <h2 className="card-title gap-2 mb-4">
                            <BrainIcon className="w-5 h-5 text-secondary" />
                            Skill Proficiency
                        </h2>
                        {radarData.length >= 3 ? (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#374151" />
                                        <PolarAngleAxis dataKey="skill" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                                        <PolarRadiusAxis
                                            angle={30}
                                            domain={[0, 100]}
                                            tick={{ fill: '#9ca3af', fontSize: 10 }}
                                        />
                                        <Radar
                                            name="Proficiency"
                                            dataKey="proficiency"
                                            stroke="#8b5cf6"
                                            fill="#8b5cf6"
                                            fillOpacity={0.4}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-64 flex items-center justify-center text-base-content/50">
                                Practice more concepts to see skill radar
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Charts Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Difficulty Distribution */}
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body">
                        <h2 className="card-title gap-2 mb-4">
                            <ZapIcon className="w-5 h-5 text-warning" />
                            Difficulty Breakdown
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
                                No difficulty data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Correctness Distribution */}
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body">
                        <h2 className="card-title gap-2 mb-4">
                            <CheckCircleIcon className="w-5 h-5 text-success" />
                            Solution Accuracy
                        </h2>
                        {correctnessData.length > 0 ? (
                            <div className="h-52">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={correctnessData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                                        <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                                        <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={60} />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                            {correctnessData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="h-52 flex items-center justify-center text-base-content/50">
                                No accuracy data yet
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Skills */}
                <div className="card bg-base-100 shadow-lg border border-base-300">
                    <div className="card-body">
                        <h2 className="card-title gap-2 mb-4">
                            <TrophyIcon className="w-5 h-5 text-accent" />
                            Top Skills
                        </h2>
                        {skills.length > 0 ? (
                            <div className="space-y-3">
                                {skills.slice(0, 5).map((skill, idx) => (
                                    <div key={skill._id} className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold`}
                                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                        >
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium capitalize">{skill._id}</span>
                                                <span className="text-sm text-base-content/60">{skill.count}x</span>
                                            </div>
                                            <div className="w-full bg-base-200 rounded-full h-1.5 mt-1">
                                                <div
                                                    className="h-1.5 rounded-full"
                                                    style={{
                                                        width: `${skill.avgScore}%`,
                                                        backgroundColor: COLORS[idx % COLORS.length]
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-52 flex items-center justify-center text-base-content/50">
                                Complete sessions to see skills
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent AI Report Table */}
            <div className="card bg-base-100 shadow-lg border border-base-300">
                <div className="card-body">
                    <h2 className="card-title gap-2 mb-4">
                        <BookOpenIcon className="w-5 h-5 text-info" />
                        Recent AI Report History
                    </h2>
                    {feedbackHistory.length > 0 ? (
                        <div className="overflow-x-auto max-h-80 rounded-lg border border-base-300">
                            <table className="table table-zebra w-full">
                                <thead className="sticky top-0 bg-base-200 z-10">
                                    <tr>
                                        <th>Problem</th>
                                        <th>Difficulty</th>
                                        <th>Score</th>
                                        <th>Result</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feedbackHistory.map((fb) => (
                                        <tr key={fb._id}>
                                            <td className="font-medium">{fb.problemId?.title || "Unknown"}</td>
                                            <td>
                                                <span className={`badge badge-sm ${fb.problemId?.difficulty === 'easy' ? 'badge-success' :
                                                    fb.problemId?.difficulty === 'medium' ? 'badge-warning' : 'badge-error'
                                                    }`}>
                                                    {fb.problemId?.difficulty || "N/A"}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`font-bold ${fb.score >= 80 ? 'text-success' :
                                                    fb.score >= 50 ? 'text-warning' : 'text-error'
                                                    }`}>
                                                    {fb.score}/100
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge badge-sm ${fb.correctness === 'Correct' ? 'badge-success' :
                                                    fb.correctness === 'Partially Correct' ? 'badge-warning' : 'badge-error'
                                                    }`}>
                                                    {fb.correctness}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 text-base-content/50">
                            <BookOpenIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No AI reports yet. Complete sessions with AI feedback enabled!</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default MyProgressPage;
