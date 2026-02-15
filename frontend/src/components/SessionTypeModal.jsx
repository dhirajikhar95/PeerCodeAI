import { UserIcon, UsersIcon, MailIcon, KeyIcon, SparklesIcon, XIcon } from "lucide-react";

function SessionTypeModal({ isOpen, onClose, onSelectType }) {
    if (!isOpen) return null;

    const sessionTypes = [
        {
            type: "one_on_one",
            title: "One-on-One Tutoring",
            description: "Personalized 1:1 session with AI-generated report",
            icon: UserIcon,
            features: [
                { icon: MailIcon, text: "Email invitation" },
                { icon: SparklesIcon, text: "AI report enabled" },
            ],
            gradient: "from-primary to-secondary",
            borderColor: "border-primary/20",
            hoverBorder: "hover:border-primary/40",
        },
        {
            type: "class",
            title: "Class Session",
            description: "Teach multiple students at once in a group setting",
            icon: UsersIcon,
            features: [
                { icon: KeyIcon, text: "Access code join" },
                { icon: UsersIcon, text: "Unlimited students" },
            ],
            gradient: "from-secondary to-accent",
            borderColor: "border-secondary/20",
            hoverBorder: "hover:border-secondary/40",
        },
    ];

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                <button
                    onClick={onClose}
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                >
                    <XIcon className="size-4" />
                </button>

                <h3 className="text-2xl font-bold mb-2">Choose Session Type</h3>
                <p className="text-base-content/60 mb-6">
                    Select the type of tutoring session you want to create
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                    {sessionTypes.map((session) => (
                        <button
                            key={session.type}
                            onClick={() => onSelectType(session.type)}
                            className={`card bg-base-100 border ${session.borderColor} ${session.hoverBorder} shadow-lg hover:shadow-xl transition-all duration-300 text-left group`}
                        >
                            <div className="card-body p-6">
                                <div className={`size-14 rounded-2xl bg-gradient-to-br ${session.gradient} flex items-center justify-center shadow-lg mb-4`}>
                                    <session.icon className="size-7 text-white" />
                                </div>

                                <h4 className="text-lg font-bold mb-1">{session.title}</h4>
                                <p className="text-sm text-base-content/60 mb-4">
                                    {session.description}
                                </p>

                                <div className="space-y-2">
                                    {session.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-sm text-base-content/70">
                                            <feature.icon className="size-4" />
                                            <span>{feature.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="modal-action">
                    <button className="btn btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
}

export default SessionTypeModal;
