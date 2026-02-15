import { Link, useLocation } from "react-router";
import { useUser, UserButton } from "@clerk/clerk-react";
import {
    LayoutDashboardIcon,
    BookOpenIcon,
    PlusCircleIcon,
    FileTextIcon,
    ClockIcon,
    BarChart3Icon,
    KeyRoundIcon,
    TrendingUpIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from "lucide-react";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

// Navigation items based on role
const getNavItems = (role) => {
    const common = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboardIcon },
        { path: "/problems", label: "Problems", icon: BookOpenIcon },
    ];

    const teacherItems = [
        { path: "/questions/create", label: "Create Question", icon: PlusCircleIcon },
        { path: "/my-questions", label: "My Questions", icon: FileTextIcon },
        { path: "/sessions", label: "Sessions", icon: ClockIcon },
        { path: "/analytics", label: "Analytics", icon: BarChart3Icon },
    ];

    const studentItems = [
        { path: "/join-session", label: "Join Session", icon: KeyRoundIcon },
        { path: "/my-progress", label: "My Progress", icon: TrendingUpIcon },
        { path: "/my-sessions", label: "My Sessions", icon: ClockIcon },
    ];

    return role === "teacher"
        ? [...common, ...teacherItems]
        : [...common, ...studentItems];
};

function Sidebar({ role = "student", isCollapsed, onToggle }) {
    const location = useLocation();
    const { user } = useUser();

    const navItems = getNavItems(role);

    const isActive = (path) => location.pathname === path;

    return (
        <aside
            className={`fixed left-0 top-0 h-screen bg-base-300/95 backdrop-blur-xl border-r border-base-content/5 z-40 transition-all duration-300 flex flex-col ${isCollapsed ? "w-20" : "w-64"
                }`}
        >
            {/* Logo Section with gradient background matching homepage */}
            <div className="p-4 border-b border-base-content/5" style={{ background: 'var(--navbar-gradient)' }}>
                <Link to="/" className="flex items-center gap-3">
                    <div
                        className={`${isCollapsed ? "w-12" : "w-full"} rounded-xl flex items-center justify-center`}

                    >
                        {isCollapsed ? (
                            <img src="/icon.png" alt="PeerCode AI" className="w-15 h-15 object-contain" />
                        ) : (
                            <img src="/logo.png" alt="PeerCode AI" className="w-56 h-15 object-contain" />
                        )}
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto overflow-x-hidden">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group overflow-hidden ${isActive(item.path)
                            ? "bg-primary text-primary-content shadow-lg shadow-primary/30"
                            : "hover:bg-base-200 text-base-content/70 hover:text-base-content"
                            } ${isCollapsed ? "justify-center" : ""}`}
                    >
                        <item.icon className={`size-5 flex-shrink-0 ${isActive(item.path) ? "" : "group-hover:text-primary"}`} />
                        {!isCollapsed && (
                            <span className="font-medium truncate">{item.label}</span>
                        )}
                    </Link>
                ))}
            </nav>

            {/* Bottom Section */}
            <div className="p-3 border-t border-base-content/5 space-y-2">

                {/* Collapse Toggle */}
                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl hover:bg-base-200 text-base-content/50 hover:text-base-content transition-all"
                >
                    {isCollapsed ? (
                        <ChevronRightIcon className="size-5" />
                    ) : (
                        <>
                            <ChevronLeftIcon className="size-5" />
                            <span className="text-sm">Collapse</span>
                        </>
                    )}
                </button>

                {/* Theme Toggle */}
                <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between px-3"}`}>
                    {!isCollapsed && <span className="text-sm text-base-content/50">Theme</span>}
                    <ThemeToggle />
                </div>



                {/* User Profile */}
                <div
                    className={`flex items-center gap-3 p-3 rounded-xl ${isCollapsed ? "justify-center" : ""}`}
                    style={{ background: 'var(--navbar-gradient)' }}
                >
                    <UserButton />
                    {!isCollapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-white">{user?.firstName || "User"}</p>
                            <p className="text-xs text-white/70 truncate capitalize">{role}</p>
                        </div>
                    )}
                </div>


            </div>
        </aside>
    );
}

export default Sidebar;
