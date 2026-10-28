import React, { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import apiClient from '../../services/api';

/**
 * Stitch Official Assessments Hub Screen
 * Includes Timed Aptitude tests, Domain Quizzes, and Monaco-style Coding Arenas
 */
export default function StudentAssessments() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [activeCodingProblem, setActiveCodingProblem] = useState(null);
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [userCode, setUserCode] = useState('');
  const [executionResult, setExecutionResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [assessments, setAssessments] = useState([]);
  const [codingChallenges, setCodingChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    Promise.all([apiClient('/student/assessments'), apiClient('/coding/challenges')])
      .then(([assessmentResponse, codingResponse]) => {
        setAssessments(assessmentResponse.data || []);
        setCodingChallenges(codingResponse.data || []);
      })
      .catch((error) => setLoadError(error.message || 'Unable to load assessments.'))
      .finally(() => setLoading(false));
  }, []);

  const starterCodeTemplates = {
    python: `def solve(nums, target):\n    # Write your solution here\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            return [lookup[diff], i]\n        lookup[num] = i\n    return []\n\n# Test input\nprint(solve([2, 7, 11, 15], 9))`,
    javascript: `function solve(nums, target) {\n    // Write your solution here\n    const lookup = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (lookup.has(diff)) return [lookup.get(diff), i];\n        lookup.set(nums[i], i);\n    }\n    return [];\n}\n\nconsole.log(solve([2, 7, 11, 15], 9));`,
    cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\n\nvector<int> solve(vector<int>& nums, int target) {\n    unordered_map<int, int> lookup;\n    for (int i = 0; i < nums.size(); i++) {\n        int diff = target - nums[i];\n        if (lookup.count(diff)) return {lookup[diff], i};\n        lookup[nums[i]] = i;\n    }\n    return {};\n}\n\nint main() {\n    vector<int> nums = {2, 7, 11, 15};\n    auto res = solve(nums, 9);\n    cout << "[" << res[0] << ", " << res[1] << "]" << endl;\n    return 0;\n}`,
    java: `import java.util.*;\n\npublic class Solution {\n    public static int[] solve(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) return new int[]{map.get(diff), i};\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n\n    public static void main(String[] args) {\n        int[] res = solve(new int[]{2, 7, 11, 15}, 9);\n        System.out.println(Arrays.toString(res));\n    }\n}`
  };

  const openCodingArena = (problem) => {
    setActiveCodingProblem(problem);
    setUserCode(starterCodeTemplates[codeLanguage]);
    setExecutionResult(null);
  };

  const handleLanguageChange = (lang) => {
    setCodeLanguage(lang);
    setUserCode(starterCodeTemplates[lang]);
    setExecutionResult(null);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setExecutionResult(null);
    try {
      const response = await apiClient(`/coding/${activeCodingProblem.id}/run`, {
        body: { code: userCode, language: codeLanguage }
      });
      const result = response.data;
      setExecutionResult({
        status: result.allPassed ? 'Passed' : 'Failed',
        passedCount: result.passedTests,
        totalCount: result.totalTests,
        runtime: result.results?.[0]?.executionTimeMs ? `${result.results[0].executionTimeMs} ms` : 'Unavailable',
        memory: result.results?.[0]?.memoryUsedMb ? `${result.results[0].memoryUsedMb} MB` : 'Unavailable',
        output: result.results?.map(item => item.errorMessage || item.actualOutput || '').join('\n') || 'No execution output.'
      });
    } catch (error) {
      setExecutionResult({ status: 'Unavailable', passedCount: 0, totalCount: 0, runtime: 'Unavailable', memory: 'Unavailable', output: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  const filteredAssessments = assessments.filter((item) => {
    if (activeFilter === 'coding') return item.assessment_type === 'coding';
    if (activeFilter === 'aptitude') return item.assessment_type === 'aptitude';
    if (activeFilter === 'domain') return item.assessment_type === 'general';
    return true;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <PageHeader
        eyebrow="Evaluation & Testing Arena"
        title="Assessments Hub"
        subtitle="Standardized aptitude benchmarks, core subject quizzes, and sandboxed coding challenges."
        icon="assignment"
      />
      {loading && <p className="text-sm text-on-surface-variant">Loading assessments...</p>}
      {loadError && <p className="p-3 rounded-xl bg-red-50 text-red-700 text-sm">{loadError}</p>}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 pb-2">
        {['all', 'coding', 'aptitude', 'domain'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveFilter(tab)}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${
              activeFilter === tab
                ? 'bg-secondary text-on-secondary shadow-sm'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Assessments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {!loading && !filteredAssessments.length && <p className="text-sm text-on-surface-variant">No published assessments are available.</p>}
        {filteredAssessments.map((test) => (
          <div
            key={test.id}
            className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow space-y-4"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold uppercase tracking-wider text-secondary bg-secondary-fixed/50 px-2 py-0.5 rounded">
                  {test.assessment_type}
                </span>
                <StatusBadge
                  status="pending"
                  label="Available"
                />
              </div>

              <h3 className="font-heading text-base font-bold text-on-surface leading-snug">
                {test.title}
              </h3>

              <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant py-2 border-y border-outline-variant/20">
                <div>Published: <strong className="text-on-surface">{new Date(test.published_at).toLocaleDateString()}</strong></div>
                <div>Questions: <strong className="text-on-surface">{test.question_count || '—'}</strong></div>
                <div>Duration: <strong className="text-on-surface">{test.duration || '—'} minutes</strong></div>
                <div>Type: <strong className="text-on-surface">{test.assessment_type}</strong></div>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full"
              icon="play_arrow"
              onClick={() => setSelectedAssessment(test)}
            >
              Start Assessment
            </Button>
          </div>
        ))}
      </div>

      {/* Coding Problems Section */}
      <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/30 shadow-sm space-y-4 mt-2">
        <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
          <div>
            <h3 className="font-heading text-lg font-bold text-on-surface">
              Sandboxed Coding Practice Arena
            </h3>
            <p className="text-xs text-on-surface-variant">Real-time autograded algorithmic problem bank</p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            2 / 4 Solved
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {!codingChallenges.length && <p className="text-sm text-on-surface-variant">No published coding challenges are available.</p>}
          {codingChallenges.map((prob) => (
            <div
              key={prob.id}
              className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-3 hover:bg-surface-container transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-on-surface">{prob.title}</h4>
                  <StatusBadge
                    status={prob.difficulty === 'Hard' ? 'at-risk' : 'info'}
                    label={prob.difficulty}
                  />
                </div>
                <p className="text-xs text-on-surface-variant">
                  {prob.category} • Acceptance: {prob.acceptance_rate} • {prob.points} Pts
                </p>
              </div>

              <Button
                variant={prob.solve_status === 'solved' ? 'outline' : 'primary'}
                size="sm"
                icon={prob.solve_status === 'solved' ? 'check' : 'code'}
                onClick={() => openCodingArena(prob)}
              >
                {prob.solve_status === 'solved' ? 'Review Code' : 'Open IDE'}
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Coding Arena Modal */}
      {activeCodingProblem && (
        <Modal
          isOpen={Boolean(activeCodingProblem)}
          onClose={() => setActiveCodingProblem(null)}
          title={`Coding Arena: ${activeCodingProblem.title}`}
          size="lg"
        >
          <div className="space-y-4">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between bg-surface-container p-3 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-on-surface-variant">Language:</span>
                <select
                  value={codeLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="px-3 py-1.5 rounded-lg border border-outline-variant/50 text-xs font-mono font-bold bg-surface text-primary focus:outline-none"
                >
                  <option value="python">Python 3.11</option>
                  <option value="javascript">JavaScript (Node.js 20)</option>
                  <option value="cpp">C++ (GCC 12)</option>
                  <option value="java">Java 21 (OpenJDK)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-on-surface-variant font-mono">
                  Tests: <strong>{activeCodingProblem.testcase_count || '—'}</strong>
                </span>
                <StatusBadge status="info" label={activeCodingProblem.difficulty_level} />
              </div>
            </div>

            {/* Problem Statement Snippet */}
            <div className="p-3 bg-surface-container-low rounded-xl text-xs text-on-surface-variant border border-outline-variant/20">
              <strong className="text-on-surface block mb-1">Problem Description:</strong>
              {activeCodingProblem.description}
            </div>

            {/* Simulated Monaco/CodeMirror Dark Textarea Editor */}
            <div>
              <div className="flex items-center justify-between bg-slate-900 text-slate-400 px-4 py-2 rounded-t-xl text-xs font-mono border-b border-slate-800">
                <span>solution.{codeLanguage === 'python' ? 'py' : codeLanguage === 'javascript' ? 'js' : codeLanguage === 'cpp' ? 'cpp' : 'java'}</span>
                <span className="text-[11px] text-slate-500">UTF-8 • Spaces: 4</span>
              </div>
              <textarea
                rows={12}
                value={userCode}
                onChange={(e) => setUserCode(e.target.value)}
                className="w-full p-4 bg-slate-950 text-slate-100 font-mono text-xs rounded-b-xl border-x border-b border-slate-800 focus:outline-none focus:ring-2 focus:ring-secondary resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Output Console Box */}
            {executionResult && (
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-green-400 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    {executionResult.status} ({executionResult.passedCount}/{executionResult.totalCount} test cases)
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Runtime: {executionResult.runtime} • Memory: {executionResult.memory}
                  </span>
                </div>
                <pre className="text-slate-300 text-[11px] bg-slate-950 p-2.5 rounded-lg border border-slate-800 overflow-x-auto">
                  {executionResult.output}
                </pre>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-outline-variant/20">
              <Button variant="outline" size="sm" onClick={() => setActiveCodingProblem(null)}>
                Close IDE
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon="play_arrow"
                  disabled={isRunning}
                  onClick={handleRunCode}
                >
                  {isRunning ? 'Executing...' : 'Run Testcases'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon="cloud_upload"
                  onClick={async () => {
                    try {
                      await apiClient(`/coding/${activeCodingProblem.id}/submit`, { body: { code: userCode, language: codeLanguage } });
                      setExecutionResult({ status: 'Submitted', passedCount: 0, totalCount: 0, runtime: 'Recorded by server', memory: 'Recorded by server', output: 'Submission recorded. Results are available after grading.' });
                    } catch (error) {
                      setExecutionResult({ status: 'Unavailable', passedCount: 0, totalCount: 0, runtime: 'Unavailable', memory: 'Unavailable', output: error.message });
                    }
                  }}
                >
                  Submit Final Code
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Assessment Preview Modal */}
      {selectedAssessment && (
        <Modal
          isOpen={Boolean(selectedAssessment)}
          onClose={() => setSelectedAssessment(null)}
          title={selectedAssessment.title}
          footer={
            <div className="flex items-center justify-end gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => setSelectedAssessment(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={async () => {
                  try {
                    const response = await apiClient(`/student/assessments/${selectedAssessment.id}/start`, { body: {} });
                    setSelectedAssessment(null);
                    window.alert(`Assessment started. It must be submitted before ${new Date(response.data.expires_at).toLocaleString()}.`);
                  } catch (error) {
                    setLoadError(error.message || 'Unable to start assessment.');
                  }
                }}
              >
                Proceed to Test Interface
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-sm text-on-surface">
            <p>
              You are about to launch <strong>{selectedAssessment.title}</strong>.
            </p>
            <div className="p-4 rounded-xl bg-surface-container-low space-y-2 text-xs">
              <div><strong>Time Limit:</strong> {selectedAssessment.duration || '—'} Minutes</div>
              <div><strong>Format:</strong> {selectedAssessment.assessment_type}</div>
              <div><strong>Questions:</strong> {selectedAssessment.question_count || '—'}</div>
              <div><strong>Rules:</strong> The server enforces the attempt time limit.</div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
