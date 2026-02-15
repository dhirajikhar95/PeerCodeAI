import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import MobileRestriction from "./MobileRestriction";

function DashboardLayout({ children, role = "student" }) {
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem("sidebar_collapsed");
        return saved === "true";
    });
    const [isMobile, setIsMobile] = useState(false);

    // Persist collapsed state
    useEffect(() => {
        localStorage.setItem("sidebar_collapsed", isCollapsed);
    }, [isCollapsed]);

    // Handle responsive behavior
    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setIsCollapsed(true);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Show mobile restriction on small screens
    if (isMobile) {
        return <MobileRestriction />;
    }

    return (
        <div className="min-h-screen" style={{ background: 'var(--page-gradient)' }}>
            {/* Sidebar */}
            <Sidebar
                role={role}
                isCollapsed={isCollapsed}
                onToggle={() => setIsCollapsed(!isCollapsed)}
            />

            {/* Main Content */}
            <main
                className={`min-h-screen transition-all duration-300 ${isCollapsed ? "ml-20" : "ml-64"
                    }`}
            >
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;
