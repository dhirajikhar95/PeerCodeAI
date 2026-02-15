import { useState, useEffect } from "react";
import { runAllTestCases } from "../lib/piston";
import {
    PlayIcon,
    CheckCircle2Icon,
    XCircleIcon,
    Loader2Icon,
    ChevronDownIcon,
    ChevronUpIcon,
    TestTube2Icon,
    EyeOffIcon,
} from "lucide-react";
import axiosInstance from "../lib/axios";

export default function TestCasePanel({
    sessionId,
    testCases,
    code,
    language,
    onResultsUpdate,
    emitTestResults,
    emitRunningState,
    remoteTestResults,
    remoteRunningState,
    clearRemoteTestResults,
    clearRemoteRunningState
}) {
    const [results, setResults] = useState([]);
    const [hiddenResults, setHiddenResults] = useState([]);
    const [summary, setSummary] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [expandedCase, setExpandedCase] = useState(null);

    // Filter out hidden test cases for display
    const visibleTestCases = testCases?.filter(tc => !tc.isHidden) || [];
    const hiddenTestCases = testCases?.filter(tc => tc.isHidden) || [];

    useEffect(() => {
        if (remoteTestResults) {
            setResults(remoteTestResults.results || []);
            setHiddenResults(remoteTestResults.hiddenResults || []);
            setSummary(remoteTestResults.summary || null);
            if (clearRemoteTestResults) {
                clearRemoteTestResults();
            }
        }
    }, [remoteTestResults, clearRemoteTestResults]);

    // Handle remote running state sync
    useEffect(() => {
        if (remoteRunningState !== null) {
            setIsRunning(remoteRunningState);
            if (clearRemoteRunningState) {
                clearRemoteRunningState();
            }
        }
    }, [remoteRunningState, clearRemoteRunningState]);

    const handleRunTests = async () => {
        if (!code || (visibleTestCases.length === 0 && hiddenTestCases.length === 0)) return;

        setIsRunning(true);
        if (emitRunningState) emitRunningState(true);
        setResults([]);
        setHiddenResults([]);
        setSummary(null);

        try {
            // Run visible test cases
            let visibleResults = [];
            if (visibleTestCases.length > 0) {
                const { results: vResults } = await runAllTestCases(
                    language,
                    code,
                    visibleTestCases
                );
                visibleResults = vResults;
            }

            // Run hidden test cases
            let hiddenTestResults = [];
            if (hiddenTestCases.length > 0) {
                const { results: hResults } = await runAllTestCases(
                    language,
                    code,
                    hiddenTestCases
                );
                hiddenTestResults = hResults;
            }

            // Calculate combined summary
            const allResults = [...visibleResults, ...hiddenTestResults];
            const totalPassed = allResults.filter(r => r.passed).length;
            const combinedSummary = {
                total: allResults.length,
                passed: totalPassed,
                failed: allResults.length - totalPassed
            };

            setResults(visibleResults);
            setHiddenResults(hiddenTestResults);
            setSummary(combinedSummary);

            if (emitTestResults) {
                emitTestResults(visibleResults, combinedSummary, hiddenTestResults);
            }

            // Save results to backend
            try {
                if (sessionId) {
                    await axiosInstance.patch(`/sessions/${sessionId}/test-results`, {
                        testCaseResults: allResults,
                        testCaseSummary: combinedSummary,
                    });
                }
            } catch (e) {
                console.error("Failed to save test results:", e);
            }

            if (onResultsUpdate) {
                onResultsUpdate(allResults, combinedSummary);
            }
        } catch (error) {
            console.error("Error running tests:", error);
        } finally {
            setIsRunning(false);
            if (emitRunningState) emitRunningState(false);
        }
    };

    if (!testCases || testCases.length === 0) {
        return (
            <div className="p-4 text-center text-base-content/50">
                <TestTube2Icon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No test cases available</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-base-200 border-b border-base-300">
                <div className="flex items-center gap-2">
                    <TestTube2Icon className="w-5 h-5 text-primary" />
                    <span className="font-semibold">Test Cases</span>
                    {summary && (
                        <span className={`badge badge-sm ${summary.failed === 0 ? 'badge-success' : 'badge-error'}`}>
                            {summary.passed}/{summary.total} passed
                        </span>
                    )}
                </div>
                <button
                    onClick={handleRunTests}
                    disabled={isRunning || !code}
                    className="btn btn-primary btn-sm gap-2"
                >
                    {isRunning ? (
                        <>
                            <Loader2Icon className="w-4 h-4 animate-spin" />
                            Running...
                        </>
                    ) : (
                        <>
                            <PlayIcon className="w-4 h-4" />
                            Run Tests
                        </>
                    )}
                </button>
            </div>

            {/* Test Cases List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {visibleTestCases.map((testCase, index) => {
                    const result = results[index];
                    const isExpanded = expandedCase === index;

                    return (
                        <div
                            key={index}
                            className={`rounded-lg border ${result
                                ? result.passed
                                    ? 'border-success/30 bg-success/5'
                                    : 'border-error/30 bg-error/5'
                                : 'border-base-300 bg-base-100'
                                }`}
                        >
                            <button
                                onClick={() => setExpandedCase(isExpanded ? null : index)}
                                className="w-full flex items-center justify-between p-3"
                            >
                                <div className="flex items-center gap-2">
                                    {result ? (
                                        result.passed ? (
                                            <CheckCircle2Icon className="w-5 h-5 text-success" />
                                        ) : (
                                            <XCircleIcon className="w-5 h-5 text-error" />
                                        )
                                    ) : (
                                        <div className="w-5 h-5 rounded-full border-2 border-base-300" />
                                    )}
                                    <span className="font-medium">Test Case {index + 1}</span>
                                </div>
                                {isExpanded ? (
                                    <ChevronUpIcon className="w-4 h-4" />
                                ) : (
                                    <ChevronDownIcon className="w-4 h-4" />
                                )}
                            </button>

                            {isExpanded && (
                                <div className="px-3 pb-3 space-y-2 text-sm">
                                    <div>
                                        <label className="text-base-content/60 text-xs uppercase">Input</label>
                                        <div className="bg-base-200 p-2 rounded font-mono text-xs whitespace-pre-wrap">
                                            {testCase.input}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-base-content/60 text-xs uppercase">Expected Output</label>
                                        <div className="bg-base-200 p-2 rounded font-mono text-xs whitespace-pre-wrap">
                                            {testCase.output}
                                        </div>
                                    </div>
                                    {result && (
                                        <div>
                                            <label className="text-base-content/60 text-xs uppercase">Your Output</label>
                                            <div className={`p-2 rounded font-mono text-xs whitespace-pre-wrap ${result.passed ? 'bg-success/10' : 'bg-error/10'
                                                }`}>
                                                {result.actual || result.error || "(No output)"}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Hidden Test Cases Section */}
                {hiddenTestCases.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-base-300">
                        <div className="flex items-center gap-2 mb-3">
                            <EyeOffIcon className="w-4 h-4 text-base-content/50" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-base-content/50">Hidden Test Cases</span>
                        </div>
                        <div className="space-y-2">
                            {hiddenTestCases.map((_, index) => {
                                const hiddenResult = hiddenResults[index];
                                const hasRun = hiddenResult !== undefined;
                                const passed = hiddenResult?.passed;

                                return (
                                    <div
                                        key={`hidden-${index}`}
                                        className={`flex items-center justify-between p-3 rounded-lg border ${!hasRun
                                            ? 'border-base-300 bg-base-100'
                                            : passed
                                                ? 'border-success/30 bg-success/5'
                                                : 'border-error/30 bg-error/5'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {!hasRun ? (
                                                <div className="w-5 h-5 rounded-full border-2 border-base-300" />
                                            ) : passed ? (
                                                <CheckCircle2Icon className="w-5 h-5 text-success" />
                                            ) : (
                                                <XCircleIcon className="w-5 h-5 text-error" />
                                            )}
                                            <span className="font-medium text-sm">Hidden Test {index + 1}</span>
                                            <EyeOffIcon className="w-4 h-4 text-base-content/40" />
                                        </div>
                                        <span className={`text-sm ${!hasRun
                                            ? 'text-base-content/40'
                                            : passed
                                                ? 'text-success'
                                                : 'text-error'
                                            }`}>
                                            {!hasRun ? 'Not executed' : passed ? 'Passed' : 'Failed'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Summary */}
            {summary && (
                <div className={`p-3 border-t ${summary.failed === 0 ? 'bg-success/10' : 'bg-error/10'}`}>
                    <div className="flex items-center justify-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                            <CheckCircle2Icon className="w-4 h-4 text-success" />
                            {summary.passed} Passed
                        </span>
                        <span className="flex items-center gap-1">
                            <XCircleIcon className="w-4 h-4 text-error" />
                            {summary.failed} Failed
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
