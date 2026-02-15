import { MonitorIcon, LaptopIcon } from "lucide-react";

function MobileRestriction() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6" style={{ background: 'var(--page-gradient)' }}>
            <div className="text-center max-w-md">
                {/* Icon */}
                <div className="size-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-2xl">
                    <LaptopIcon className="size-12 text-white" />
                </div>

                {/* Title */}
                <h1 className="text-3xl font-bold mb-4">
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        Desktop Required
                    </span>
                </h1>

                {/* Message */}
                <p className="text-base-content/70 text-lg mb-6 leading-relaxed">
                    PeerCode AI is designed for collaborative coding and works best on larger screens.
                </p>

                <div className="card bg-base-100/50 border border-base-content/10 p-6 mb-6">
                    <div className="flex items-center justify-center gap-4 text-base-content/60">
                        <MonitorIcon className="size-8" />
                        <span className="text-lg font-medium">Please use a PC or Laptop</span>
                    </div>
                </div>

                <p className="text-sm text-base-content/50">
                    For the best experience with our code editor, video calls, and real-time collaboration features,
                    please access this platform from a desktop or laptop computer.
                </p>
            </div>
        </div>
    );
}

export default MobileRestriction;
