import { useUser } from "@clerk/clerk-react";
import { ArrowRightIcon, BookOpenIcon, SparklesIcon, ZapIcon } from "lucide-react";

function WelcomeSection({ onCreateSession, showCreateButton = false }) {
  const { user } = useUser();

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-b border-base-300 mt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
      <div className="relative max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary via-primary/80 to-secondary flex items-center justify-center shadow-lg shadow-primary/25">
                <SparklesIcon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Welcome back, {user?.firstName || "there"}!
              </h1>
            </div>
            <p className="text-lg text-base-content/70 ml-0 md:ml-16">
              {showCreateButton
                ? "Ready to level up your coding skills?"
                : "Browse available sessions and join to start learning!"}
            </p>
          </div>
          {showCreateButton ? (
            <button
              onClick={onCreateSession}
              className="group px-8 py-4 bg-gradient-to-r from-primary to-secondary rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40"
            >
              <div className="flex items-center gap-3 text-white font-bold text-lg">
                <ZapIcon className="w-6 h-6" />
                <span>Create Session</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-3 px-6 py-4 bg-base-200/80 backdrop-blur-sm rounded-2xl border border-secondary/30 shadow-lg">
              <BookOpenIcon className="w-6 h-6 text-secondary" />
              <span className="text-base-content/80 font-medium">Join a session below to start coding!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default WelcomeSection;


