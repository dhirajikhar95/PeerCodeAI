import { useState } from "react";
import { useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { GraduationCapIcon, BookOpenIcon, Loader2Icon, SparklesIcon } from "lucide-react";
import axiosInstance from "../lib/axios";
import ThemeToggle from "../components/ThemeToggle";

const RoleSelectionPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [selectedRole, setSelectedRole] = useState(null);

    const updateRoleMutation = useMutation({
        mutationFn: async (role) => {
            const response = await axiosInstance.patch("/users/role", { role });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
            navigate("/dashboard");
        },
    });

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        updateRoleMutation.mutate(role);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 relative" style={{ background: 'var(--page-gradient)' }}>
            <div className="absolute top-4 right-4">
                <ThemeToggle />
            </div>
            <div className="max-w-4xl w-full">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-6">
                        <div className="size-16 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-xl">
                            <SparklesIcon className="size-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black mb-4">
                        Welcome to{" "}
                        <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                            PeerCode AI
                        </span>
                    </h1>
                    <p className="text-lg text-base-content/70 max-w-xl mx-auto">
                        Select your role to personalize your experience. Your choice shapes your dashboard and unlocks tailored features.
                    </p>
                </div>

                {/* Role Cards */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Teacher Card */}
                    <button
                        onClick={() => handleRoleSelect("teacher")}
                        disabled={updateRoleMutation.isPending}
                        className={`card bg-base-100 shadow-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${selectedRole === "teacher" ? "border-primary ring-4 ring-primary/20" : "border-transparent hover:border-primary/50"
                            }`}
                    >
                        <div className="card-body items-center text-center p-10">
                            <div className="size-24 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                                <GraduationCapIcon className="size-12 text-white" />
                            </div>
                            <h2 className="card-title text-2xl font-bold mb-2">Teacher</h2>
                            <p className="text-base-content/70 mb-6">
                                Empower students with curated coding challenges, lead real-time tutoring sessions, and leverage AI-driven insights to track learner progress.
                            </p>
                            <div className="space-y-2 text-left w-full">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="badge badge-primary badge-sm">✓</span>
                                    Create & manage coding challenges
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="badge badge-primary badge-sm">✓</span>
                                    Host interactive live sessions
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="badge badge-primary badge-sm">✓</span>
                                    Access AI-powered analytics & feedback
                                </div>
                            </div>
                            {updateRoleMutation.isPending && selectedRole === "teacher" && (
                                <div className="mt-4">
                                    <Loader2Icon className="size-6 animate-spin text-primary" />
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Student Card */}
                    <button
                        onClick={() => handleRoleSelect("student")}
                        disabled={updateRoleMutation.isPending}
                        className={`card bg-base-100 shadow-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${selectedRole === "student" ? "border-secondary ring-4 ring-secondary/20" : "border-transparent hover:border-secondary/50"
                            }`}
                    >
                        <div className="card-body items-center text-center p-10">
                            <div className="size-24 bg-gradient-to-br from-secondary to-accent rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                                <BookOpenIcon className="size-12 text-white" />
                            </div>
                            <h2 className="card-title text-2xl font-bold mb-2">Student</h2>
                            <p className="text-base-content/70 mb-6">
                                Access live tutoring sessions, collaborate with expert instructors, and accelerate your coding skills with personalized AI feedback.
                            </p>
                            <div className="space-y-2 text-left w-full">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="badge badge-secondary badge-sm">✓</span>
                                    Join live collaborative sessions
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="badge badge-secondary badge-sm">✓</span>
                                    Receive personalized AI feedback
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="badge badge-secondary badge-sm">✓</span>
                                    Track your skill progression
                                </div>
                            </div>
                            {updateRoleMutation.isPending && selectedRole === "student" && (
                                <div className="mt-4">
                                    <Loader2Icon className="size-6 animate-spin text-secondary" />
                                </div>
                            )}
                        </div>
                    </button>
                </div>

                {/* Error Message */}
                {updateRoleMutation.isError && (
                    <div className="alert alert-error mt-8">
                        <span>Failed to set role. Please try again.</span>
                    </div>
                )}

                {/* Footer Note */}
                <p className="text-center text-sm text-base-content/50 mt-8">
                    Your role selection helps us tailor your experience. You can explore all features once you're set up.
                </p>
            </div>
        </div>
    );
};

export default RoleSelectionPage;
