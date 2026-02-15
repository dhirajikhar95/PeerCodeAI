import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuestionById } from "../hooks/useQuestions";
import Navbar from "../components/Navbar";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import TestCasePanel from "../components/TestCasePanel";
import Editor from "@monaco-editor/react";
import {
  Loader2Icon,
  ArrowLeftIcon,
  GripVerticalIcon,
  GripHorizontalIcon,
} from "lucide-react";
import { getDifficultyBadgeClass } from "../lib/utils";

const LANGUAGE_CONFIG = {
  javascript: { name: "JavaScript", monacoLang: "javascript", logo: "/javascript.svg" },
  python: { name: "Python", monacoLang: "python", logo: "/python.svg" },
  java: { name: "Java", monacoLang: "java", logo: "/java.svg" },
  cpp: { name: "C++", monacoLang: "cpp", logo: "/cpp.svg" },
};

function ProblemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuestionById(id);
  const problem = data?.question;

  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  // Initialize code when problem loads
  useEffect(() => {
    if (problem?.starterCode?.[selectedLanguage]) {
      setCode(problem.starterCode[selectedLanguage]);
    }
  }, [problem, selectedLanguage]);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setSelectedLanguage(newLang);
    if (problem?.starterCode?.[newLang]) {
      setCode(problem.starterCode[newLang]);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--page-gradient)' }}>
        <Loader2Icon className="size-12 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--page-gradient)' }}>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-error text-lg mb-4">Problem not found</p>
          <button onClick={() => navigate("/problems")} className="btn btn-primary">
            Back to Problems
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--page-gradient)' }}>
      {/* Header */}
      <header className="bg-base-200 border-b border-base-300 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/problems")} className="btn btn-ghost btn-sm">
            <ArrowLeftIcon className="size-4" />
          </button>
          <h1 className="font-bold text-lg">{problem.title}</h1>
          <span className={`badge ${getDifficultyBadgeClass(problem.difficulty)}`}>
            {problem.difficulty}
          </span>
          {problem.isSystem && <span className="badge badge-ghost">System</span>}
        </div>
        <div className="text-sm text-base-content/60">
          By: {problem.isSystem ? "CodeTutor" : problem.createdBy?.name || "Teacher"}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal">
          {/* Problem Description */}
          <Panel defaultSize={40} minSize={25}>
            <div className="h-full bg-base-100 overflow-y-auto p-6">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap mb-6 text-base">{problem.description}</p>

                {problem.examples?.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-bold mb-3">Examples</h3>
                    {problem.examples.map((ex, idx) => (
                      <div key={idx} className="bg-base-200 p-4 rounded-xl mb-3 border border-base-300">
                        <p className="font-mono text-sm mb-1">
                          <span className="font-bold text-primary">Input:</span> {ex.input}
                        </p>
                        <p className="font-mono text-sm mb-1">
                          <span className="font-bold text-success">Output:</span> {ex.output}
                        </p>
                        {ex.explanation && (
                          <p className="text-xs text-base-content/70 mt-2 italic">
                            <span className="font-bold">Explanation:</span> {ex.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {problem.constraints?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold mb-3">Constraints</h3>
                    <ul className="list-disc list-inside text-sm font-mono space-y-1">
                      {problem.constraints.map((c, i) => (
                        <li key={i} className="text-base-content/80">{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </Panel>

          <PanelResizeHandle className="w-2 bg-base-300 hover:bg-primary flex items-center justify-center cursor-col-resize group">
            <GripVerticalIcon className="size-4 text-base-content/30 group-hover:text-primary" />
          </PanelResizeHandle>

          {/* Code Editor + Test Cases */}
          <Panel defaultSize={60} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Editor */}
              <Panel defaultSize={60} minSize={30}>
                <div className="h-full flex flex-col bg-[#1e1e1e] rounded-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e1e] border-b border-[#333]">
                    <div className="flex items-center gap-2 bg-[#2d2d2d] px-2 py-1 rounded border border-[#333]">
                      <img
                        src={LANGUAGE_CONFIG[selectedLanguage].logo}
                        alt={LANGUAGE_CONFIG[selectedLanguage].name}
                        className="size-5"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      <select
                        className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer text-gray-200"
                        value={selectedLanguage}
                        onChange={handleLanguageChange}
                      >
                        {Object.entries(LANGUAGE_CONFIG).map(([key, cfg]) => (
                          <option key={key} value={key} className="bg-[#1e1e1e]">
                            {cfg.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex-1 min-h-0">
                    <Editor
                      height="100%"
                      language={LANGUAGE_CONFIG[selectedLanguage].monacoLang}
                      value={code}
                      onChange={setCode}
                      theme="vs-dark"
                      options={{
                        fontSize: 14,
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        padding: { top: 16 },
                      }}
                    />
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-2 bg-base-300 hover:bg-primary flex items-center justify-center cursor-row-resize group">
                <GripHorizontalIcon className="size-4 text-base-content/30 group-hover:text-primary" />
              </PanelResizeHandle>

              {/* Test Cases Panel */}
              <Panel defaultSize={40} minSize={25}>
                <div className="h-full bg-base-200 rounded-lg overflow-hidden">
                  <TestCasePanel
                    sessionId={null}
                    testCases={problem.testCases}
                    code={code}
                    language={selectedLanguage}
                  />
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}

export default ProblemPage;
