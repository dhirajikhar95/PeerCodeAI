import { useState } from "react";
import { useSendInvite } from "../hooks/useSessions";
import { CopyIcon, CheckIcon, MailIcon, Loader2Icon, UsersIcon, UserIcon } from "lucide-react";

function AccessCodeDisplay({ accessCode, sessionId, sessionType = "one_on_one" }) {
    const [copied, setCopied] = useState(false);
    const [email, setEmail] = useState("");
    const [showEmailInput, setShowEmailInput] = useState(false);
    const sendInviteMutation = useSendInvite();

    const isOneOnOne = sessionType === "one_on_one";

    const handleCopy = async () => {
        await navigator.clipboard.writeText(accessCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendInvite = (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        sendInviteMutation.mutate(
            { sessionId, email: email.trim() },
            {
                onSuccess: () => {
                    setEmail("");
                    setShowEmailInput(false);
                },
            }
        );
    };

    return (
        <div className="space-y-4">
            {/* Session Type Badge */}
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${isOneOnOne ? "bg-primary/10 text-primary" : "bg-secondary/10 text-secondary"}`}>
                {isOneOnOne ? <UserIcon className="size-4" /> : <UsersIcon className="size-4" />}
                {isOneOnOne ? "One-on-One Session" : "Class Session"}
            </div>

            {/* Access Code Section - Always shown for class sessions */}
            {!isOneOnOne && (
                <div className="bg-gradient-to-br from-secondary/10 to-accent/10 rounded-xl p-4 border border-secondary/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-base-content/70">Share Access Code</span>
                        <button
                            onClick={handleCopy}
                            className="btn btn-ghost btn-xs gap-1"
                            title="Copy code"
                        >
                            {copied ? (
                                <>
                                    <CheckIcon className="size-3 text-success" /> Copied!
                                </>
                            ) : (
                                <>
                                    <CopyIcon className="size-3" /> Copy
                                </>
                            )}
                        </button>
                    </div>

                    <div className="bg-base-100 rounded-lg p-4 text-center">
                        <span className="font-mono text-3xl font-bold tracking-[0.3em] text-secondary">
                            {accessCode}
                        </span>
                    </div>

                    <p className="text-sm text-base-content/60 mt-3 text-center">
                        Students can join using this code. Share it with your class!
                    </p>
                </div>
            )}

            {/* Email Invite Section - Only for 1:1 sessions */}
            {isOneOnOne && (
                <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl p-4 border border-primary/20">
                    <div className="flex items-center gap-2 mb-3">
                        <MailIcon className="size-5 text-primary" />
                        <span className="font-medium">Send Email Invitation</span>
                    </div>

                    {!showEmailInput ? (
                        <div className="space-y-3">
                            <p className="text-sm text-base-content/60">
                                Enter your student's email to send them a personalized invitation.
                            </p>
                            <button
                                onClick={() => setShowEmailInput(true)}
                                className="btn btn-primary w-full gap-2"
                            >
                                <MailIcon className="size-4" />
                                Send Invitation
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSendInvite} className="space-y-3">
                            <input
                                type="email"
                                placeholder="student@email.com"
                                className="input input-bordered w-full"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1"
                                    disabled={!email.trim() || sendInviteMutation.isPending}
                                >
                                    {sendInviteMutation.isPending ? (
                                        <Loader2Icon className="size-4 animate-spin" />
                                    ) : (
                                        "Send Invite"
                                    )}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => setShowEmailInput(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Small code display for reference */}
                    <div className="mt-4 pt-4 border-t border-base-content/10">
                        <p className="text-xs text-base-content/50 mb-2">Or share this access code:</p>
                        <div className="flex items-center gap-2">
                            <code className="font-mono text-lg font-bold text-primary tracking-widest">
                                {accessCode}
                            </code>
                            <button
                                onClick={handleCopy}
                                className="btn btn-ghost btn-xs"
                            >
                                {copied ? <CheckIcon className="size-3 text-success" /> : <CopyIcon className="size-3" />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AccessCodeDisplay;

