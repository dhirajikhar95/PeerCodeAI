// Piston API is a service for code execution

const PISTON_API = "https://emkc.org/api/v2/piston";

const LANGUAGE_VERSIONS = {
  javascript: { language: "javascript", version: "18.15.0" },
  python: { language: "python", version: "3.10.0" },
  java: { language: "java", version: "15.0.2" },
  cpp: { language: "c++", version: "10.2.0" },
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * Fetch with retry logic for transient HTTP errors (401, 429, 5xx)
 */
async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;

      // Retry on transient errors
      if ((response.status === 401 || response.status === 429 || response.status >= 500) && attempt < retries) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * Math.pow(2, attempt)));
        continue;
      }

      // Non-retryable error or retries exhausted
      return response;
    } catch (networkError) {
      if (attempt < retries) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * Math.pow(2, attempt)));
        continue;
      }
      throw networkError;
    }
  }
}

/**
 * @param {string} language - programming language
 * @param {string} code - source code to executed
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    const languageConfig = LANGUAGE_VERSIONS[language];

    if (!languageConfig) {
      return {
        success: false,
        error: `Unsupported language: ${language}`,
      };
    }

    const response = await fetchWithRetry(`${PISTON_API}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: languageConfig.language,
        version: languageConfig.version,
        files: [
          {
            name: `main.${getFileExtension(language)}`,
            content: code,
          },
        ],
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Code execution service is temporarily unavailable (status: ${response.status}). Please try again.`,
      };
    }

    const data = await response.json();

    const output = data.run.output || "";
    const stderr = data.run.stderr || "";

    if (stderr) {
      return {
        success: false,
        output: output,
        error: stderr,
      };
    }

    return {
      success: true,
      output: output || "No output",
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to execute code. Please check your connection and try again.`,
    };
  }
}

/**
 * Wrap user code to read from stdin and call their solution
 * Supports different patterns per language
 */
function wrapCodeWithInput(language, code, input) {
  // For LeetCode-style problems, we need to adapt the code to read input
  // This is a simplified approach - the actual implementation depends on code structure

  switch (language) {
    case "javascript":
      return `
const input = \`${input}\`;
const lines = input.trim().split('\\n');
let lineIndex = 0;
const readline = () => lines[lineIndex++] || '';

${code}
`;

    case "python":
      return `
import sys
from io import StringIO
sys.stdin = StringIO("""${input}""")

${code}
`;

    case "java":
      // Java needs the input passed via stdin
      return code;

    case "cpp":
      return code;

    default:
      return code;
  }
}

/**
 * Run a single test case
 * @param {string} language 
 * @param {string} code 
 * @param {string} input 
 * @param {string} expectedOutput 
 * @returns {Promise<{input: string, expected: string, actual: string, passed: boolean, error?: string}>}
 */
export async function runSingleTestCase(language, code, input, expectedOutput) {
  try {
    const languageConfig = LANGUAGE_VERSIONS[language];

    if (!languageConfig) {
      return {
        input,
        expected: expectedOutput,
        actual: "",
        passed: false,
        error: `Unsupported language: ${language}`,
      };
    }

    const response = await fetchWithRetry(`${PISTON_API}/execute`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        language: languageConfig.language,
        version: languageConfig.version,
        files: [
          {
            name: `main.${getFileExtension(language)}`,
            content: code,
          },
        ],
        stdin: input,
      }),
    });

    if (!response.ok) {
      return {
        input,
        expected: expectedOutput,
        actual: "",
        passed: false,
        error: `Code execution service temporarily unavailable (status: ${response.status}). Please try again.`,
      };
    }

    const data = await response.json();
    const actualOutput = (data.run.output || "").trim();
    const stderr = data.run.stderr || "";
    const expected = expectedOutput.trim();

    if (stderr) {
      return {
        input,
        expected,
        actual: actualOutput || stderr,
        passed: false,
        error: stderr,
      };
    }

    const passed = actualOutput === expected;

    return {
      input,
      expected,
      actual: actualOutput,
      passed,
    };
  } catch (error) {
    return {
      input,
      expected: expectedOutput,
      actual: "",
      passed: false,
      error: `Test execution failed. Please check your connection and try again.`,
    };
  }
}

/**
 * Run all test cases for a piece of code
 * @param {string} language 
 * @param {string} code 
 * @param {Array<{input: string, output: string}>} testCases 
 * @returns {Promise<{results: Array, summary: {total: number, passed: number, failed: number}}>}
 */
export async function runAllTestCases(language, code, testCases) {
  const results = [];

  for (const testCase of testCases) {
    const result = await runSingleTestCase(
      language,
      code,
      testCase.input,
      testCase.output
    );
    results.push(result);
  }

  const summary = {
    total: results.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
  };

  return { results, summary };
}

function getFileExtension(language) {
  const extensions = {
    javascript: "js",
    python: "py",
    java: "java",
    cpp: "cpp",
  };

  return extensions[language] || "txt";
}
