import { Link, useLocation } from "react-router";
import { BookOpenIcon, LayoutDashboardIcon } from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-base-200/80 backdrop-blur-xl border-b border-base-content/10 fixed top-0 w-full z-50 shadow-lg shadow-base-300/50">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="group flex items-center gap-3 hover:scale-105 transition-transform duration-300"
        >
          <div className="w-40 h-14 rounded-xl flex items-center justify-start">
            <img src="/logo.png" alt="PeerCode AI Logo" className="w-full h-full object-contain object-left" />
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="flex items-center gap-2 bg-base-100/50 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-base-content/5 shadow-sm">
          {/* PROBLEMS PAGE LINK */}
          <Link
            to={"/problems"}
            className={`px-4 py-2.5 rounded-xl transition-all duration-300 
              ${isActive("/problems")
                ? "bg-primary text-primary-content shadow-lg shadow-primary/30"
                : "hover:bg-base-300/50 text-base-content/70 hover:text-base-content"
              }`}
          >
            <div className="flex items-center gap-x-2.5">
              <BookOpenIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Problems</span>
            </div>
          </Link>

          {/* DASHBOARD PAGE LINK */}
          <Link
            to={"/dashboard"}
            className={`px-4 py-2.5 rounded-xl transition-all duration-300 
              ${isActive("/dashboard")
                ? "bg-primary text-primary-content shadow-lg shadow-primary/30"
                : "hover:bg-base-300/50 text-base-content/70 hover:text-base-content"
              }`}
          >
            <div className="flex items-center gap-x-2.5">
              <LayoutDashboardIcon className="size-4" />
              <span className="font-medium hidden sm:inline">Dashboard</span>
            </div>
          </Link>

          <ThemeToggle />
          <div className="ml-1">
            <UserButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
export default Navbar;
