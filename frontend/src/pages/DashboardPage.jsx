import { useUser } from "@clerk/clerk-react";
import { useState } from "react";
import { useMyRecentSessions } from "../hooks/useSessions";

import DashboardLayout from "../components/DashboardLayout";
import RecentSessions from "../components/RecentSessions";
import JoinSessionModal from "../components/JoinSessionModal";
import { SkeletonStat, SkeletonSessionCard } from "../components/Skeletons";
import {
  KeyRoundIcon,
  BookOpenIcon,
  ClockIcon,
  TrendingUpIcon,
  GraduationCapIcon,
  ArrowRightIcon,
  ZapIcon,
} from "lucide-react";
import { Link } from "react-router";

function DashboardPage() {
  const { user, isLoaded: userLoaded } = useUser();
  const [showJoinModal, setShowJoinModal] = useState(false);

  const { data: recentSessionsData, isLoading: loadingRecentSessions } = useMyRecentSessions();
  const recentSessions = recentSessionsData?.sessions || [];

  const stats = [
    {
      label: "Sessions Completed",
      value: recentSessions.length,
      icon: ClockIcon,
      gradient: "from-primary to-secondary",
    },
    {
      label: "Active Streak",
      value: "3 days",
      icon: ZapIcon,
      gradient: "from-secondary to-accent",
    },
    {
      label: "Problems Solved",
      value: recentSessions.length * 2,
      icon: TrendingUpIcon,
      gradient: "from-accent to-primary",
    },
  ];

  // Show skeleton while user data is loading
  if (!userLoaded || loadingRecentSessions) {
    return (
      <DashboardLayout role="student">
        {/* Skeleton Header */}
        <div className="mb-8 animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-12 rounded-2xl bg-base-300"></div>
            <div className="space-y-2">
              <div className="h-8 w-56 bg-base-300 rounded"></div>
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

        {/* Skeleton Action Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card bg-base-100/90 shadow-lg border border-base-content/5 animate-pulse">
            <div className="card-body p-8">
              <div className="flex items-start gap-5">
                <div className="size-14 rounded-2xl bg-base-300"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-40 bg-base-300 rounded"></div>
                  <div className="h-4 w-64 bg-base-300 rounded"></div>
                  <div className="h-4 w-32 bg-base-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="card bg-base-100/90 shadow-lg border border-base-content/5 animate-pulse">
            <div className="card-body p-8">
              <div className="flex items-start gap-5">
                <div className="size-14 rounded-2xl bg-base-300"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-6 w-40 bg-base-300 rounded"></div>
                  <div className="h-4 w-64 bg-base-300 rounded"></div>
                  <div className="h-4 w-32 bg-base-300 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skeleton Recent Sessions */}
        <div className="card bg-base-100 shadow-lg border border-base-300 mt-8">
          <div className="card-body">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-base-300 w-10 h-10"></div>
              <div className="h-6 w-40 bg-base-300 rounded"></div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonSessionCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
            <GraduationCapIcon className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              Welcome back, <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{user?.firstName || "Student"}</span>! 👋
            </h1>
            <p className="text-base-content/60">Ready to level up your coding skills today?</p>
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
        {/* Join Session Card */}
        <button
          onClick={() => setShowJoinModal(true)}
          className="card bg-base-100 shadow-xl border border-base-content/10 hover:shadow-2xl hover:border-primary/30 hover:scale-[1.01] transition-all duration-300 group text-left"
        >
          <div className="card-body p-8">
            <div className="flex items-start gap-5">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <KeyRoundIcon className="size-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Join a Session</h2>
                <p className="text-base-content/60 mb-4">
                  Enter the access code from your teacher to join a live tutoring session
                </p>
                <span className="inline-flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
                  Enter Code <ArrowRightIcon className="size-4" />
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Practice Problems Card */}
        <Link
          to="/problems"
          className="card bg-base-100 shadow-xl border border-base-content/10 hover:shadow-2xl hover:border-secondary/30 hover:scale-[1.01] transition-all duration-300 group"
        >
          <div className="card-body p-8">
            <div className="flex items-start gap-5">
              <div className="size-14 rounded-2xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center shadow-lg">
                <BookOpenIcon className="size-8 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h2 className="text-2xl font-bold mb-2">Practice Problems</h2>
                <p className="text-base-content/60 mb-4">
                  Sharpen your skills with curated coding challenges at your own pace
                </p>
                <span className="inline-flex items-center gap-2 text-secondary font-semibold group-hover:gap-3 transition-all">
                  Browse Problems <ArrowRightIcon className="size-4" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Sessions */}
      <RecentSessions sessions={recentSessions} isLoading={loadingRecentSessions} />

      {/* Join Session Modal */}
      <JoinSessionModal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} />
    </DashboardLayout>
  );
}

export default DashboardPage;
