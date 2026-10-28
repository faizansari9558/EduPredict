# 21 — Coding Assessment Engine Design

## 1. Coding Engine Architecture & Runtime Pipeline

The EduPredict Coding Assessment Engine provides a browser-based IDE, sandboxed code execution, test case management, and automated evaluation across multiple programming languages.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CODING ARENA EXECUTION PIPELINE                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ STUDENT CODING ARENA (/coding/:problemId) ]                              │
│  • Problem Statement, Limits, Constraints                                   │
│  • Multi-Language In-Browser Code Editor with Line Numbers                  │
│  • Language Selector: JavaScript, Python, C++, Java                         │
│                                                                             │
│                        │ [ RUN ]                     │ [ SUBMIT ]           │
│                        ▼                             ▼                      │
│  [ INTERACTIVE TESTCASE RUNNER ]           [ AUTOGRADING EVALUATOR ]        │
│  • Public Sample Test Cases                • Full Test Suite (Public+Hidden)│
│  • Custom Input Execution                  • Per-Testcase Execution Time (ms│
│  • Output Console Diff View                • Memory Consumption (MB)        │
│                                            • Pass / Fail Assertions         │
│                                                      │                      │
│                                                      ▼                      │
│                                            [ DATABASE PERSISTENCE ]         │
│                                            • `coding_submissions` (Score %) │
│                                            • `coding_results` (Diagnostics) │
│                                            • Updates `student_metrics`      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Multi-Language Execution & Sandbox Security

### 2.1 Supported Programming Languages
1. **JavaScript (Node.js)**: Executed in an isolated V8 context using Node.js `vm.runInContext`.
2. **Python**: Evaluated with structured test harnesses and execution telemetry.
3. **C++**: Compiles and executes with memory profiling and execution timers.
4. **Java**: Evaluated with class runner templates.

### 2.2 Sandboxing & Execution Constraints
- **Timeout Limit**: Hard kill at 2,000ms (configurable up to 5,000ms per test case).
- **Memory Limit**: Enforced memory threshold (default: 128 MB).
- **Environment Isolation**: No file system access, network sockets, or root command execution permitted in the user script context.

---

## 3. Testcase Management & Autograding Algorithm

### 3.1 Testcase Structure (`coding_testcases`)
- **`input`**: Text input passed to the solver function (e.g. `[2, 7, 11, 15], 9`).
- **`expected_output`**: Expected return string or JSON (e.g. `[0, 1]`).
- **`is_hidden`**:
  - `0` (Public Sample): Visible to student with explanation for interactive debugging.
  - `1` (Hidden Testcase): Secret edge cases used only for final grading.
- **`points`**: Weightage assigned to the testcase.

### 3.2 Automated Grading Formula
$$\text{Pass Rate \%} = \left( \frac{\text{Count of Passed Testcases}}{\text{Total (Sample + Hidden) Testcases}} \right) \times 100$$

$$\text{Weighted Grade Score} = \sum_{k=1}^{M} \begin{cases} \text{Points}(tc_k), & \text{if Testcase } tc_k \text{ Passes} \\ 0, & \text{otherwise} \end{cases}$$

---

## 4. UI/UX Specifications for Coding Portals

### 4.1 Student Coding Arena (`/coding/:problemId`)
- Code editor with syntax styling, line numbers, and indentation helpers.
- Starter template loader automatically populating default function boilerplate when switching languages.
- Test Results Dock displaying runtime stats (e.g., `Status: Accepted`, `Time: 18ms`, `Memory: 14.2 MB`).

### 4.2 Teacher Coding Manager (`/teacher/coding`)
- Problem authoring modal with live markdown preview.
- Testcase editor for adding public samples and bulk uploading hidden test suites.
- Submissions inspector showing student code, execution logs, and regrading actions.
