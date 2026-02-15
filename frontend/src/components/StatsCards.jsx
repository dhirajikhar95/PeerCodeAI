import { TrophyIcon, UsersIcon } from "lucide-react";

function StatsCards({ activeSessionsCount, recentSessionsCount }) {
  return (
    <div className="lg:col-span-1 grid grid-cols-1 gap-6">
      {/* Active Count */}
      <div className="card bg-base-200/50 backdrop-blur-sm border border-primary/20 shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:border-primary/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/20">
              <UsersIcon className="w-7 h-7 text-primary" />
            </div>
            <div className="badge badge-primary gap-1.5 shadow-lg shadow-primary/20">
              <div className="w-2 h-2 bg-primary-content rounded-full animate-pulse"></div>
              Live
            </div>
          </div>
          <div className="text-4xl font-black text-base-content mb-1">{activeSessionsCount}</div>
          <div className="text-sm text-base-content/60">Active Sessions</div>
        </div>
      </div>

      {/* Recent Count */}
      <div className="card bg-base-200/50 backdrop-blur-sm border border-secondary/20 shadow-lg hover:shadow-secondary/10 transition-all duration-300 hover:border-secondary/40">
        <div className="card-body">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl border border-secondary/20">
              <TrophyIcon className="w-7 h-7 text-secondary" />
            </div>
          </div>
          <div className="text-4xl font-black text-base-content mb-1">{recentSessionsCount}</div>
          <div className="text-sm text-base-content/60">Total Sessions</div>
        </div>
      </div>
    </div>
  );
}

export default StatsCards;


