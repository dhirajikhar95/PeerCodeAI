import { useState } from "react";
import { Link } from "react-router";
import DashboardLayout from "../components/DashboardLayout";
import { useQuestions, useDeleteQuestion } from "../hooks/useQuestions";
import { useUser } from "@clerk/clerk-react";
import QuestionPreviewModal from "../components/QuestionPreviewModal";
import {
    FileTextIcon,
    PlusIcon,
    Loader2Icon,
    EditIcon,
    TrashIcon,
    EyeIcon,
    SearchIcon,
    AlertTriangleIcon,
} from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";
import { formatDistanceToNow } from "date-fns";

const MyQuestionsPage = () => {
    const { user } = useUser();
    const { data: questions, isLoading } = useQuestions();
    const deleteQuestionMutation = useDeleteQuestion();
    const [search, setSearch] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [previewQuestion, setPreviewQuestion] = useState(null);

    // Filter questions created by the current teacher (not system questions)
    const myQuestions = (questions || []).filter(
        (q) => !q.isSystem && q.createdBy?.clerkId === user?.id
    );

    // Search filter
    const filteredQuestions = myQuestions.filter((q) =>
        q.title.toLowerCase().includes(search.toLowerCase())
    );

    const handleDelete = async (questionId) => {
        deleteQuestionMutation.mutate(questionId, {
            onSuccess: () => {
                setConfirmDelete(null);
            },
        });
    };

    return (
        <DashboardLayout role="teacher">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="size-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                        <FileTextIcon className="size-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            My Questions
                        </h1>
                        <p className="text-base-content/60">
                            Manage your coding problems and test cases
                        </p>
                    </div>
                </div>
                <Link to="/questions/create" className="btn btn-primary gap-2 shadow-lg">
                    <PlusIcon className="size-5" />
                    Create Question
                </Link>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
                    <input
                        type="text"
                        placeholder="Search your questions..."
                        className="input input-bordered w-full pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="card bg-base-100 border border-base-content/10 p-4 text-center hover:scale-[1.01] transition-transform">
                    <p className="text-2xl font-bold text-primary">{myQuestions.length}</p>
                    <p className="text-sm text-base-content/50">Total Questions</p>
                </div>
                <div className="card bg-base-100 border border-base-content/10 p-4 text-center hover:scale-[1.01] transition-transform">
                    <p className="text-2xl font-bold text-success">
                        {myQuestions.filter((q) => q.difficulty === "easy").length}
                    </p>
                    <p className="text-sm text-base-content/50">Easy</p>
                </div>
                <div className="card bg-base-100 border border-base-content/10 p-4 text-center hover:scale-[1.01] transition-transform">
                    <p className="text-2xl font-bold text-warning">
                        {myQuestions.filter((q) => q.difficulty === "medium").length}
                    </p>
                    <p className="text-sm text-base-content/50">Medium</p>
                </div>
                <div className="card bg-base-100 border border-base-content/10 p-4 text-center hover:scale-[1.01] transition-transform">
                    <p className="text-2xl font-bold text-error">
                        {myQuestions.filter((q) => q.difficulty === "hard").length}
                    </p>
                    <p className="text-sm text-base-content/50">Hard</p>
                </div>
            </div>

            {/* Questions List */}
            <div className="card bg-base-100/80 backdrop-blur-sm shadow-xl border border-base-content/5">
                <div className="card-body">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader2Icon className="size-8 animate-spin text-primary" />
                        </div>
                    ) : myQuestions.length === 0 ? (
                        <div className="text-center py-12">
                            <FileTextIcon className="size-16 mx-auto text-base-content/20 mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No questions yet</h3>
                            <p className="text-base-content/50 mb-6">
                                Create your first coding problem to get started
                            </p>
                            <Link to="/questions/create" className="btn btn-primary">
                                Create Question
                            </Link>
                        </div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="text-center py-12">
                            <SearchIcon className="size-12 mx-auto text-base-content/20 mb-4" />
                            <h3 className="text-lg font-semibold">No matching questions</h3>
                            <p className="text-base-content/50">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredQuestions.map((question) => (
                                <div
                                    key={question._id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-base-200/30 hover:bg-base-200/50 border border-base-content/5 transition-all group"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="size-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                                            <FileTextIcon className="size-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold truncate">{question.title}</h3>
                                            <div className="flex items-center gap-3 mt-1 text-sm text-base-content/50">
                                                <span className={`badge badge-xs ${getDifficultyBadgeClass(question.difficulty)}`}>
                                                    {question.difficulty}
                                                </span>
                                                <span>{question.testCases?.length || 0} tests</span>
                                                <span>
                                                    {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setPreviewQuestion(question)}
                                            className="btn btn-ghost btn-sm gap-1"
                                            title="Preview"
                                        >
                                            <EyeIcon className="size-4" />
                                            <span className="hidden sm:inline">View</span>
                                        </button>
                                        <Link
                                            to={`/questions/edit/${question._id}`}
                                            className="btn btn-ghost btn-sm text-primary gap-1"
                                            title="Edit"
                                        >
                                            <EditIcon className="size-4" />
                                            <span className="hidden sm:inline">Edit</span>
                                        </Link>
                                        <button
                                            onClick={() => setConfirmDelete(question)}
                                            className="btn btn-ghost btn-sm text-error gap-1"
                                            title="Delete"
                                        >
                                            <TrashIcon className="size-4" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Question Preview Modal */}
            <QuestionPreviewModal
                question={previewQuestion}
                onClose={() => setPreviewQuestion(null)}
            />

            {/* Delete Confirmation Modal */}
            {confirmDelete && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <div className="flex items-center gap-3 text-error mb-4">
                            <AlertTriangleIcon className="size-8" />
                            <h3 className="font-bold text-lg">Delete Question?</h3>
                        </div>
                        <p className="text-base-content/70 mb-2">
                            Are you sure you want to delete "<span className="font-medium">{confirmDelete.title}</span>"?
                        </p>
                        <p className="text-sm text-base-content/50 mb-6">
                            This action cannot be undone. All test cases will be permanently removed.
                        </p>
                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setConfirmDelete(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={() => handleDelete(confirmDelete._id)}
                                disabled={deleteQuestionMutation.isPending}
                            >
                                {deleteQuestionMutation.isPending ? (
                                    <Loader2Icon className="size-4 animate-spin" />
                                ) : (
                                    <>
                                        <TrashIcon className="size-4" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setConfirmDelete(null)} />
                </div>
            )}
        </DashboardLayout>
    );
};

export default MyQuestionsPage;

