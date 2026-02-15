import { useState } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "../components/DashboardLayout";
import { useJoinByAccessCode } from "../hooks/useSessions";
import {
    KeyRoundIcon,
    Loader2Icon,
    ArrowRightIcon,
} from "lucide-react";
import toast from "react-hot-toast";

const JoinSessionPage = () => {
    const navigate = useNavigate();
    const [accessCode, setAccessCode] = useState("");
    const joinSessionMutation = useJoinByAccessCode();

    const handleJoin = () => {
        if (!accessCode.trim()) {
            toast.error("Please enter an access code");
            return;
        }

        joinSessionMutation.mutate(
            accessCode.toUpperCase(),
            {
                onSuccess: (data) => {
                    toast.success("Joined session successfully!");
                    navigate(`/session/${data.session._id}`);
                },
                onError: (error) => {
                    toast.error(error.response?.data?.message || "Invalid access code or session not found");
                },
            }
        );
    };

    return (
        <DashboardLayout role="student">
            <div className="max-w-lg mx-auto mt-12">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="size-20 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <KeyRoundIcon className="size-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold">
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Join Session
                        </span>
                    </h1>
                    <p className="text-base-content/60 mt-2">
                        Enter the 6-character access code from your teacher
                    </p>
                </div>

                {/* Join Form */}
                <div className="card bg-base-100/80 backdrop-blur-sm shadow-xl border border-base-content/5">
                    <div className="card-body">
                        <div>
                            <label className="block text-sm font-semibold text-base-content/70 mb-2">
                                Access Code
                            </label>
                            <input
                                type="text"
                                placeholder="Enter code (e.g., ABC123)"
                                className="input input-bordered input-lg w-full text-center tracking-widest font-mono uppercase"
                                value={accessCode}
                                onChange={(e) => setAccessCode(e.target.value.toUpperCase().slice(0, 6))}
                                maxLength={6}
                            />
                        </div>

                        <button
                            onClick={handleJoin}
                            disabled={joinSessionMutation.isPending || accessCode.length < 6}
                            className="btn btn-primary btn-lg mt-6 gap-2"
                        >
                            {joinSessionMutation.isPending ? (
                                <>
                                    <Loader2Icon className="size-5 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                <>
                                    Join Session
                                    <ArrowRightIcon className="size-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Help Text */}
                <p className="text-center text-sm text-base-content/50 mt-6">
                    Don't have a code? Ask your teacher to share the session access code with you.
                </p>
            </div>
        </DashboardLayout>
    );
};

export default JoinSessionPage;
