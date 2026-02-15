import { Link } from "react-router";
import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useQuestions } from "../hooks/useQuestions";
import { useUserRole } from "../hooks/useUserRole";
import {
  Code2Icon,
  ChevronRightIcon,
  Loader2Icon,
  SearchIcon,
} from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function ProblemsPage() {
  const { data: questions, isLoading, error } = useQuestions();
  const { data: userData } = useUserRole();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const userRole = userData?.role || "student";

  const filteredProblems = (questions || []).filter((q) => {
    const matchesDifficulty = filter === "all" || q.difficulty === filter;
    const matchesSearch =
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.description.toLowerCase().includes(search.toLowerCase());
    return matchesDifficulty && matchesSearch;
  });

  const easyCount = (questions || []).filter((q) => q.difficulty === "easy").length;
  const mediumCount = (questions || []).filter((q) => q.difficulty === "medium").length;
  const hardCount = (questions || []).filter((q) => q.difficulty === "hard").length;

  if (isLoading) {
    return (
      <DashboardLayout role={userRole}>
        {/* Skeleton Header */}
        <div className="mb-8 animate-pulse">
          <div className="flex items-center gap-3 mb-2">
            <div className="size-12 rounded-2xl bg-base-300"></div>
            <div className="space-y-2">
              <div className="h-8 w-48 bg-base-300 rounded"></div>
              <div className="h-4 w-64 bg-base-300 rounded"></div>
            </div>
          </div>
        </div>

        {/* Skeleton Filters */}
        <div className="flex flex-wrap gap-4 mb-6 animate-pulse">
          <div className="flex-1 min-w-64">
            <div className="h-12 bg-base-300 rounded-lg"></div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 bg-base-300 rounded"></div>
            ))}
          </div>
        </div>

        {/* Skeleton Problems List */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card bg-base-100/80 border border-base-content/5 animate-pulse">
              <div className="card-body py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="size-12 rounded-lg bg-base-300"></div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-40 bg-base-300 rounded"></div>
                        <div className="h-5 w-16 bg-base-300 rounded"></div>
                      </div>
                      <div className="h-4 w-32 bg-base-300 rounded"></div>
                    </div>
                  </div>
                  <div className="h-5 w-16 bg-base-300 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Skeleton Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card bg-base-100/80 border border-base-content/5">
              <div className="card-body p-4 text-center space-y-2">
                <div className="h-4 w-16 bg-base-300 rounded mx-auto"></div>
                <div className="h-8 w-12 bg-base-300 rounded mx-auto"></div>
              </div>
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role={userRole}>
        <div className="flex items-center justify-center h-96">
          <p className="text-error">Failed to load problems</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={userRole}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
            <Code2Icon className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Practice Problems
              </span>
            </h1>
            <p className="text-base-content/60">Solve coding challenges to sharpen your skills</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-64">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/50" />
            <input
              type="text"
              placeholder="Search problems..."
              className="input input-bordered w-full pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`btn btn-sm ${filter === "easy" ? "btn-success" : "btn-ghost"}`}
            onClick={() => setFilter("easy")}
          >
            Easy ({easyCount})
          </button>
          <button
            className={`btn btn-sm ${filter === "medium" ? "btn-warning" : "btn-ghost"}`}
            onClick={() => setFilter("medium")}
          >
            Medium ({mediumCount})
          </button>
          <button
            className={`btn btn-sm ${filter === "hard" ? "btn-error" : "btn-ghost"}`}
            onClick={() => setFilter("hard")}
          >
            Hard ({hardCount})
          </button>
        </div>
      </div>

      {/* Problems List */}
      <div className="space-y-3">
        {filteredProblems.length === 0 ? (
          <div className="card bg-base-100/80 p-8 text-center border border-base-content/5">
            <p className="text-base-content/60">No problems found</p>
          </div>
        ) : (
          filteredProblems.map((problem) => (
            <Link
              key={problem._id}
              to={`/problem/${problem._id}`}
              className="card bg-base-100/80 hover:shadow-xl hover:scale-[1.01] hover:bg-base-100 transition-all duration-300 border border-base-content/5"
            >
              <div className="card-body py-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="size-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                      <Code2Icon className="size-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h2 className="text-lg font-bold">{problem.title}</h2>
                        <span className={`badge badge-sm ${getDifficultyBadgeClass(problem.difficulty)}`}>
                          {problem.difficulty}
                        </span>
                        {problem.isSystem && (
                          <span className="badge badge-sm badge-ghost">System</span>
                        )}
                      </div>
                      <p className="text-sm text-base-content/60 truncate">
                        By: {problem.isSystem ? "CodeTutor" : problem.createdBy?.name || "Teacher"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-primary flex-shrink-0">
                    <span className="font-medium text-sm">Solve</span>
                    <ChevronRightIcon className="size-5" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-base-100/80 border border-base-content/5 hover:scale-[1.01] transition-transform">
          <div className="card-body p-4 text-center">
            <p className="text-sm text-base-content/50">Total</p>
            <p className="text-2xl font-bold text-primary">{questions?.length || 0}</p>
          </div>
        </div>
        <div className="card bg-base-100/80 border border-base-content/5 hover:scale-[1.01] transition-transform">
          <div className="card-body p-4 text-center">
            <p className="text-sm text-base-content/50">Easy</p>
            <p className="text-2xl font-bold text-success">{easyCount}</p>
          </div>
        </div>
        <div className="card bg-base-100/80 border border-base-content/5 hover:scale-[1.01] transition-transform">
          <div className="card-body p-4 text-center">
            <p className="text-sm text-base-content/50">Medium</p>
            <p className="text-2xl font-bold text-warning">{mediumCount}</p>
          </div>
        </div>
        <div className="card bg-base-100/80 border border-base-content/5 hover:scale-[1.01] transition-transform">
          <div className="card-body p-4 text-center">
            <p className="text-sm text-base-content/50">Hard</p>
            <p className="text-2xl font-bold text-error">{hardCount}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ProblemsPage;

