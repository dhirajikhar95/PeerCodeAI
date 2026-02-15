import { useEffect, useState } from "react";
import { SunIcon, MoonIcon } from "lucide-react";

function ThemeToggle() {
    const [theme, setTheme] = useState(() => {
        // Check localStorage first, then system preference, default to dark
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem("peercode-theme");
            if (stored) return stored;
            if (window.matchMedia("(prefers-color-scheme: light)").matches) {
                return "peercode-light";
            }
        }
        return "peercode-dark";
    });

    useEffect(() => {
        // Apply theme to document
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("peercode-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) =>
            prev === "peercode-dark" ? "peercode-light" : "peercode-dark"
        );
    };

    const isDark = theme === "peercode-dark";

    return (
        <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-circle relative overflow-hidden group"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
            <div className="relative w-5 h-5">
                {/* Sun icon */}
                <SunIcon
                    className={`absolute inset-0 w-5 h-5 text-accent transition-all duration-300 ${isDark
                        ? "opacity-0 rotate-90 scale-0"
                        : "opacity-100 rotate-0 scale-100"
                        }`}
                />
                {/* Moon icon */}
                <MoonIcon
                    className={`absolute inset-0 w-5 h-5 text-secondary transition-all duration-300 ${isDark
                        ? "opacity-100 rotate-0 scale-100"
                        : "opacity-0 -rotate-90 scale-0"
                        }`}
                />
            </div>
        </button>
    );
}

export default ThemeToggle;
