import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "../components/DashboardLayout";
import { useQuestionById } from "../hooks/useQuestions";
import axiosInstance from "../lib/axios";
import toast from "react-hot-toast";
import {
    PlusIcon,
    TrashIcon,
    CodeIcon,
    CheckCircleIcon,
    EyeIcon,
    EyeOffIcon,
    SaveIcon,
    AlertCircleIcon,
    PenLineIcon,
    ListIcon,
    BookOpenIcon,
    FlaskConicalIcon,
    Loader2
} from "lucide-react";

const LANGUAGES = ["javascript", "python", "java", "cpp"];

const EditQuestionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { data: questionData, isLoading, isError } = useQuestionById(id);
    const [codeTab, setCodeTab] = useState("javascript");

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        difficulty: "easy",
        examples: [{ input: "", output: "", explanation: "" }],
        constraints: [""],
        starterCode: {
            javascript: "// Write your solution here\nfunction solution(input) {\n  // Your code\n}\n",
            python: "# Write your solution here\ndef solution(input):\n    # Your code\n    pass\n",
            java: "// Write your solution here\nclass Solution {\n    public static void main(String[] args) {\n        // Your code\n    }\n}\n",
            cpp: "// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code\n    return 0;\n}\n",
        },
        testCases: [{ input: "", output: "", isHidden: false }],
    });

    useEffect(() => {
        if (questionData?.question) {
            const q = questionData.question;
            setFormData({
                title: q.title || "",
                description: q.description || "",
                difficulty: q.difficulty || "easy",
                examples: q.examples?.length > 0 ? q.examples : [{ input: "", output: "", explanation: "" }],
                constraints: q.constraints?.length > 0 ? q.constraints : [""],
                starterCode: q.starterCode || {
                    javascript: "// Write your solution here\nfunction solution(input) {\n  // Your code\n}\n",
                    python: "# Write your solution here\ndef solution(input):\n    # Your code\n    pass\n",
                    java: "// Write your solution here\nclass Solution {\n    public static void main(String[] args) {\n        // Your code\n    }\n}\n",
                    cpp: "// Write your solution here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code\n    return 0;\n}\n",
                },
                testCases: q.testCases?.length > 0 ? q.testCases : [{ input: "", output: "", isHidden: false }],
            });
        }
    }, [questionData]);

    const updateMutation = useMutation({
        mutationFn: async (data) => {
            const response = await axiosInstance.put(`/questions/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["questions"] });
            queryClient.invalidateQueries({ queryKey: ["question", id] });
            toast.success("Question updated successfully!");
            navigate("/my-questions");
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || "Failed to update question");
        },
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addExample = () => setFormData({ ...formData, examples: [...formData.examples, { input: "", output: "", explanation: "" }] });
    const updateExample = (idx, field, value) => {
        const updated = [...formData.examples];
        updated[idx][field] = value;
        setFormData({ ...formData, examples: updated });
    };
    const removeExample = (idx) => setFormData({ ...formData, examples: formData.examples.filter((_, i) => i !== idx) });

    const addConstraint = () => setFormData({ ...formData, constraints: [...formData.constraints, ""] });
    const updateConstraint = (idx, value) => {
        const updated = [...formData.constraints];
        updated[idx] = value;
        setFormData({ ...formData, constraints: updated });
    };
    const removeConstraint = (idx) => setFormData({ ...formData, constraints: formData.constraints.filter((_, i) => i !== idx) });

    const updateStarterCode = (lang, code) => setFormData({ ...formData, starterCode: { ...formData.starterCode, [lang]: code } });

    const addTestCase = () => setFormData({ ...formData, testCases: [...formData.testCases, { input: "", output: "", isHidden: false }] });
    const updateTestCase = (idx, field, value) => {
        const updated = [...formData.testCases];
        updated[idx][field] = value;
        setFormData({ ...formData, testCases: updated });
    };
    const removeTestCase = (idx) => setFormData({ ...formData, testCases: formData.testCases.filter((_, i) => i !== idx) });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error("Please enter a question title");
            return;
        }
        if (!formData.description.trim()) {
            toast.error("Please enter a problem description");
            return;
        }
        const cleanedData = {
            ...formData,
            constraints: formData.constraints.filter((c) => c.trim()),
        };
        updateMutation.mutate(cleanedData);
    };

    if (isLoading) {
        return (
            <DashboardLayout role="teacher">
                <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="size-12 animate-spin text-primary" />
                    <p className="text-base-content/50 font-medium">Loading question...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (isError) {
        return (
            <DashboardLayout role="teacher">
                <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
                    <div className="size-20 rounded-full bg-error/10 flex items-center justify-center text-error mb-6">
                        <AlertCircleIcon className="size-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-base-content mb-2">Question Not Found</h2>
                    <p className="text-base-content/50 max-w-md mb-8">We couldn't fetch the question details.</p>
                    <button onClick={() => navigate("/my-questions")} className="btn btn-primary px-8">
                        Return to My Questions
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="teacher">
            <div className="mx-auto pb-16">
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-12 rounded-2xl bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center shadow-lg">
                            <PenLineIcon className="size-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">
                                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    Edit Question
                                </span>
                            </h1>
                            <p className="text-base-content/60">Update and refine your coding challenge</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-12">
                    {/* Section 1: Basic Information */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md">
                                <BookOpenIcon className="size-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-base-content">Basic Information</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-base-content/70 mb-2">
                                    Question Title
                                </label>
                                <input
                                    type="text"
                                    name="title"
                                    className="input input-bordered w-full text-lg"
                                    placeholder="Two Sum"
                                    value={formData.title}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-base-content/70 mb-2">
                                    Difficulty Level
                                </label>
                                <div className="flex gap-3">
                                    {["easy", "medium", "hard"].map((diff) => (
                                        <button
                                            key={diff}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, difficulty: diff })}
                                            className={`btn flex-1 capitalize font-semibold ${formData.difficulty === diff
                                                ? diff === "easy"
                                                    ? "bg-success text-white border-success"
                                                    : diff === "medium"
                                                        ? "bg-warning text-white border-warning"
                                                        : "bg-error text-white border-error"
                                                : "btn-ghost bg-base-200"
                                                }`}
                                        >
                                            {diff}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Problem Description */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-xl bg-gradient-to-br from-secondary to-secondary/60 flex items-center justify-center shadow-md">
                                <CodeIcon className="size-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-base-content">Problem Details</h2>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-base-content/70 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    className="textarea textarea-bordered w-full min-h-48 text-base leading-relaxed"
                                    placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
                                    value={formData.description}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-semibold text-base-content/70">Constraints</label>
                                    <button type="button" className="btn btn-ghost btn-sm text-secondary gap-1" onClick={addConstraint}>
                                        <PlusIcon className="size-4" /> Add
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {formData.constraints.map((c, idx) => (
                                        <div key={idx} className="flex gap-3 items-center group">
                                            <span className="text-sm font-mono text-base-content/40 w-6">{idx + 1}.</span>
                                            <input
                                                type="text"
                                                className="input input-bordered input-sm flex-1 font-mono"
                                                placeholder="2 ≤ nums.length ≤ 10⁴"
                                                value={c}
                                                onChange={(e) => updateConstraint(idx, e.target.value)}
                                            />
                                            {formData.constraints.length > 1 && (
                                                <button
                                                    type="button"
                                                    className="btn btn-ghost btn-sm btn-square text-base-content/30 hover:text-error opacity-0 group-hover:opacity-100"
                                                    onClick={() => removeConstraint(idx)}
                                                >
                                                    <TrashIcon className="size-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Examples */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-gradient-to-br from-accent to-accent/60 flex items-center justify-center shadow-md">
                                    <CheckCircleIcon className="size-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-base-content">Examples</h2>
                            </div>
                            <button type="button" className="btn btn-ghost btn-sm gap-2" onClick={addExample}>
                                <PlusIcon className="size-4" /> Add Example
                            </button>
                        </div>

                        <div className="space-y-6">
                            {formData.examples.map((ex, idx) => (
                                <div key={idx} className="p-6 rounded-xl bg-base-200/50 border border-base-content/10 group relative">
                                    {formData.examples.length > 1 && (
                                        <button
                                            type="button"
                                            className="absolute top-4 right-4 btn btn-ghost btn-sm btn-square text-base-content/30 hover:text-error opacity-0 group-hover:opacity-100"
                                            onClick={() => removeExample(idx)}
                                        >
                                            <TrashIcon className="size-4" />
                                        </button>
                                    )}

                                    <div className="text-sm font-bold text-accent mb-4">Example {idx + 1}</div>

                                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-base-content/70 mb-2">
                                                Input
                                            </label>
                                            <textarea
                                                className="textarea textarea-bordered w-full font-mono text-sm h-24"
                                                placeholder='nums = [2,7,11,15], target = 9'
                                                value={ex.input}
                                                onChange={(e) => updateExample(idx, "input", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-base-content/70 mb-2">
                                                Output
                                            </label>
                                            <textarea
                                                className="textarea textarea-bordered w-full font-mono text-sm h-24"
                                                placeholder="[0, 1]"
                                                value={ex.output}
                                                onChange={(e) => updateExample(idx, "output", e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-base-content/70 mb-2">
                                            Explanation
                                        </label>
                                        <input
                                            type="text"
                                            className="input input-bordered input-sm w-full"
                                            placeholder="Because nums[0] + nums[1] == 9, we return [0, 1]."
                                            value={ex.explanation}
                                            onChange={(e) => updateExample(idx, "explanation", e.target.value)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Section 4: Starter Code */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="size-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-500/60 flex items-center justify-center shadow-md">
                                <ListIcon className="size-5 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-base-content">Starter Code</h2>
                        </div>

                        <div className="flex gap-2 p-1 bg-base-200 rounded-xl mb-4 w-fit">
                            {LANGUAGES.map((lang) => (
                                <button
                                    key={lang}
                                    type="button"
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${codeTab === lang
                                        ? "bg-primary text-white shadow-md"
                                        : "text-base-content/50 hover:text-base-content hover:bg-base-300"
                                        }`}
                                    onClick={() => setCodeTab(lang)}
                                >
                                    {lang === "cpp" ? "C++" : lang.charAt(0).toUpperCase() + lang.slice(1)}
                                </button>
                            ))}
                        </div>

                        <div className="relative rounded-xl overflow-hidden border border-base-content/10 bg-base-300">
                            <div className="absolute left-0 top-0 bottom-0 w-10 bg-base-content/5 flex flex-col items-center pt-4 select-none border-r border-base-content/10 pointer-events-none">
                                {Array.from({ length: 12 }, (_, i) => (
                                    <span key={i} className="text-xs font-mono leading-6 text-base-content/30">{i + 1}</span>
                                ))}
                            </div>
                            <textarea
                                className="w-full h-72 bg-transparent font-mono text-sm leading-6 p-4 pl-14 resize-none focus:outline-none"
                                value={formData.starterCode[codeTab]}
                                onChange={(e) => updateStarterCode(codeTab, e.target.value)}
                                spellCheck="false"
                            />
                        </div>
                    </section>

                    {/* Section 5: Test Cases */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-500/60 flex items-center justify-center shadow-md">
                                    <FlaskConicalIcon className="size-5 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-base-content">Test Cases</h2>
                            </div>
                            <button type="button" className="btn btn-sm bg-orange-500 hover:bg-orange-600 text-white border-0 gap-2" onClick={addTestCase}>
                                <PlusIcon className="size-4" /> Add Test Case
                            </button>
                        </div>

                        <div className="space-y-6">
                            {formData.testCases.map((tc, idx) => (
                                <div key={idx} className="p-6 rounded-xl bg-base-200/50 border border-base-content/10 group relative">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-base-content/40">#{idx + 1}</span>
                                            <button
                                                type="button"
                                                className={`btn btn-xs rounded-full border-0 gap-1 ${tc.isHidden
                                                    ? "bg-warning/15 text-warning"
                                                    : "bg-success/15 text-success"
                                                    }`}
                                                onClick={() => updateTestCase(idx, "isHidden", !tc.isHidden)}
                                            >
                                                {tc.isHidden ? <><EyeOffIcon className="size-3" /> Hidden</> : <><EyeIcon className="size-3" /> Public</>}
                                            </button>
                                        </div>
                                        {formData.testCases.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-sm btn-square text-base-content/30 hover:text-error opacity-0 group-hover:opacity-100"
                                                onClick={() => removeTestCase(idx)}
                                            >
                                                <TrashIcon className="size-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-base-content/70 mb-2">
                                                Input
                                            </label>
                                            <textarea
                                                className="textarea textarea-bordered w-full font-mono text-sm h-28"
                                                placeholder="[2, 7, 11, 15]&#10;9"
                                                value={tc.input}
                                                onChange={(e) => updateTestCase(idx, "input", e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-base-content/70 mb-2">
                                                Expected Output
                                            </label>
                                            <textarea
                                                className="textarea textarea-bordered w-full font-mono text-sm h-28"
                                                placeholder="[0, 1]"
                                                value={tc.output}
                                                onChange={(e) => updateTestCase(idx, "output", e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-base-content/10">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => navigate("/my-questions")}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary px-8 gap-2"
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? (
                                <span className="loading loading-spinner loading-sm" />
                            ) : (
                                <SaveIcon className="size-4" />
                            )}
                            Update Question
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default EditQuestionPage;
