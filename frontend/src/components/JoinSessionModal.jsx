import { useState } from "react";
import { useNavigate } from "react-router";
import { useJoinByAccessCode } from "../hooks/useSessions";
import { Loader2Icon, KeyRoundIcon, XIcon } from "lucide-react";

function JoinSessionModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [accessCode, setAccessCode] = useState("");
    const joinByCodeMutation = useJoinByAccessCode();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!accessCode.trim()) return;

        joinByCodeMutation.mutate(accessCode.trim().toUpperCase(), {
            onSuccess: (data) => {
                onClose();
                setAccessCode("");
                navigate(`/session/${data.session._id}`);
            },
        });
    };

    const handleCodeChange = (e) => {
        // Only allow alphanumeric, auto uppercase, max 6 chars
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
        setAccessCode(value);
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box relative">
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                >
                    <XIcon className="size-4" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="size-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                        <KeyRoundIcon className="size-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Join Session</h3>
                        <p className="text-base-content/60 text-sm">Enter the access code from your teacher</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-control">
                        <label className="label px-2">
                            <span className="block label-text font-medium">Access Code</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter 6-character code"
                            className="input input-bordered input-lg text-center font-mono text-xl tracking-widest uppercase"
                            value={accessCode}
                            onChange={handleCodeChange}
                            maxLength={6}
                            autoFocus
                        />
                    </div>

                    {joinByCodeMutation.isError && (
                        <div className="alert alert-error mt-4">
                            <span>{joinByCodeMutation.error?.response?.data?.message || "Invalid access code"}</span>
                        </div>
                    )}

                    <div className="modal-action">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={accessCode.length !== 6 || joinByCodeMutation.isPending}
                        >
                            {joinByCodeMutation.isPending ? (
                                <>
                                    <Loader2Icon className="size-4 animate-spin" />
                                    Joining...
                                </>
                            ) : (
                                "Join Session"
                            )}
                        </button>
                    </div>
                </form>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}

export default JoinSessionModal;
