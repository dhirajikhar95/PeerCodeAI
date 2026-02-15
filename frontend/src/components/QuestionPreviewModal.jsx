import { XIcon, CheckCircleIcon, AlertCircleIcon } from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

function QuestionPreviewModal({ question, onClose }) {
    if (!question) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h2 className="text-2xl font-bold">{question.title}</h2>
                            <span className={`badge ${getDifficultyBadgeClass(question.difficulty)}`}>
                                {question.difficulty}
                            </span>
                        </div>
                        <p className="text-sm text-base-content/50">
                            Created by {question.createdBy?.name || "You"}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-circle btn-ghost btn-sm"
                    >
                        <XIcon className="size-5" />
                    </button>
                </div>

                {/* Description */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 text-primary">Problem Description</h3>
                    <div className="bg-base-200 rounded-xl p-4">
                        <p className="whitespace-pre-wrap">{question.description}</p>
                    </div>
                </div>

                {/* Examples */}
                {question.examples && question.examples.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 text-primary">Examples</h3>
                        <div className="space-y-3">
                            {question.examples.map((example, idx) => (
                                <div key={idx} className="bg-base-200 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="badge badge-sm badge-primary">Example {idx + 1}</span>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-base-content/50 mb-1">Input:</p>
                                            <code className="block bg-base-300 p-2 rounded font-mono text-sm">
                                                {example.input}
                                            </code>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-base-content/50 mb-1">Output:</p>
                                            <code className="block bg-base-300 p-2 rounded font-mono text-sm">
                                                {example.output}
                                            </code>
                                        </div>
                                    </div>
                                    {example.explanation && (
                                        <p className="text-sm text-base-content/70 mt-2">
                                            <span className="font-medium">Explanation:</span> {example.explanation}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Constraints */}
                {question.constraints && question.constraints.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 text-primary">Constraints</h3>
                        <ul className="list-disc list-inside space-y-1 bg-base-200 rounded-xl p-4">
                            {question.constraints.map((constraint, idx) => (
                                <li key={idx} className="font-mono text-sm">{constraint}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Test Cases Summary */}
                {question.testCases && question.testCases.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2 text-primary">Test Cases</h3>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <CheckCircleIcon className="size-5 text-success" />
                                <span>{question.testCases.filter(tc => !tc.isHidden).length} visible tests</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <AlertCircleIcon className="size-5 text-warning" />
                                <span>{question.testCases.filter(tc => tc.isHidden).length} hidden tests</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Close Button */}
                <div className="modal-action">
                    <button className="btn btn-primary" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose} />
        </div>
    );
}

export default QuestionPreviewModal;
