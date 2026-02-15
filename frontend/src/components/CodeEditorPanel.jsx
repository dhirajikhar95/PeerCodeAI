import Editor from "@monaco-editor/react";
import { Loader2Icon, PlayIcon } from "lucide-react";

const LANGUAGE_CONFIG = {
  javascript: { name: "JavaScript", monacoLang: "javascript", icon: "/js.png" },
  python: { name: "Python", monacoLang: "python", icon: "/python.png" },
  java: { name: "Java", monacoLang: "java", icon: "/java.png" },
  cpp: { name: "C++", monacoLang: "cpp", icon: "/cpp.png" },
};

function CodeEditorPanel({
  selectedLanguage,
  code,
  isRunning,
  onLanguageChange,
  onCodeChange,
  onRunCode,
  hideToolbar = false,
}) {
  const langConfig = LANGUAGE_CONFIG[selectedLanguage] || LANGUAGE_CONFIG.javascript;

  return (
    <div className="h-full bg-base-300 flex flex-col">
      {!hideToolbar && (
        <div className="flex items-center justify-between px-4 py-3 bg-base-100 border-b border-base-300">
          <div className="flex items-center gap-3">
            <img src={langConfig.icon} alt={langConfig.name} className="size-6" />
            <select className="select select-sm" value={selectedLanguage} onChange={onLanguageChange}>
              {Object.entries(LANGUAGE_CONFIG).map(([key, lang]) => (
                <option key={key} value={key}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button className="btn btn-primary btn-sm gap-2" disabled={isRunning} onClick={onRunCode}>
            {isRunning ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <PlayIcon className="size-4" />
                Run Code
              </>
            )}
          </button>
        </div>
      )}

      <div className="flex-1">
        <Editor
          height="100%"
          language={langConfig.monacoLang}
          value={code}
          onChange={onCodeChange}
          theme="vs-dark"
          options={{
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
            padding: { top: 10 },
          }}
        />
      </div>
    </div>
  );
}

export default CodeEditorPanel;
