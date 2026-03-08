// Wandbox API for code execution (free, no auth required)
// Replaced Piston (emkc.org) which shut down Feb 2026
// API docs: https://github.com/melpon/wandbox/blob/master/kennel2/API.md

const WANDBOX_API = "https://wandbox.org/api/compile.json";

// Wandbox compiler names for each language
const COMPILER_MAP = {
  javascript: { compiler: "nodejs-20.17.0", name: "JavaScript" },
  python: { compiler: "cpython-3.14.0", name: "Python" },
  java: { compiler: "openjdk-jdk-22+36", name: "Java" },
  cpp: { compiler: "gcc-13.2.0", name: "C++" },
};

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;

/**
 * Execute code via Wandbox API with retry
 */
async function wandboxExecute(code, compiler, stdin = "") {
  const body = {
    code,
    compiler,
    ...(stdin ? { stdin } : {}),
  };

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(WANDBOX_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        return await response.json();
      }

      // Retry on server errors or rate limits
      if ((response.status >= 500 || response.status === 429) && attempt < MAX_RETRIES) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * Math.pow(2, attempt)));
        continue;
      }

      throw new Error(`Code execution service error (status: ${response.status}). Please try again.`);
    } catch (error) {
      if (attempt < MAX_RETRIES && !error.message.includes("status:")) {
        await new Promise(r => setTimeout(r, RETRY_DELAY_MS * Math.pow(2, attempt)));
        continue;
      }
      throw error;
    }
  }
}

/**
 * @param {string} language - programming language
 * @param {string} code - source code to execute
 * @returns {Promise<{success:boolean, output?:string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    const langConfig = COMPILER_MAP[language];

    if (!langConfig) {
      return {
        success: false,
        error: `Unsupported language: ${language}`,
      };
    }

    const result = await wandboxExecute(code, langConfig.compiler);

    const stdout = result.program_output || "";
    const stderr = result.program_error || "";
    const compilerError = result.compiler_error || "";
    const status = result.status;

    // Compilation error
    if (compilerError && status !== "0") {
      return {
        success: false,
        output: "",
        error: compilerError,
      };
    }

    // Runtime error (non-zero exit status)
    if (status !== "0" && status !== 0) {
      return {
        success: false,
        output: stdout,
        error: stderr || result.signal || "Runtime error",
      };
    }

    // Has stderr but still ran (warnings etc.)
    if (stderr && !stdout) {
      return {
        success: false,
        output: stdout,
        error: stderr,
      };
    }

    return {
      success: true,
      output: stdout || "No output",
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to execute code. Please try again.",
    };
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
    const langConfig = COMPILER_MAP[language];

    if (!langConfig) {
      return {
        input,
        expected: expectedOutput,
        actual: "",
        passed: false,
        error: `Unsupported language: ${language}`,
      };
    }

    const result = await wandboxExecute(code, langConfig.compiler, input);

    const stdout = result.program_output || "";
    const stderr = result.program_error || "";
    const compilerError = result.compiler_error || "";
    const status = result.status;
    const actualOutput = stdout.trim();
    const expected = expectedOutput.trim();

    // Compilation error
    if (compilerError && status !== "0") {
      return {
        input,
        expected,
        actual: compilerError,
        passed: false,
        error: compilerError,
      };
    }

    // Runtime error
    if (stderr && status !== "0" && status !== 0) {
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
      error: error.message || "Test execution failed. Please try again.",
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
