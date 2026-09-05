-- Phase 8: Coding Assessment Engine Schema
-- Add these tables to EduPredict database

USE EduPredict;

-- Coding Problems Table
CREATE TABLE IF NOT EXISTS coding_problems (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty_level ENUM('easy', 'medium', 'hard') NOT NULL DEFAULT 'medium',
  problem_statement TEXT,
  constraints TEXT,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  published_at TIMESTAMP NULL,
  time_limit_seconds INT DEFAULT 5,
  memory_limit_mb INT DEFAULT 256,
  supported_languages JSON,
  CONSTRAINT fk_coding_problems_creator FOREIGN KEY (created_by) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

-- Test Cases Table
CREATE TABLE IF NOT EXISTS coding_testcases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  problem_id INT NOT NULL,
  input_data LONGTEXT NOT NULL,
  expected_output LONGTEXT NOT NULL,
  sample_explanation TEXT,
  is_hidden TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_testcases_problem FOREIGN KEY (problem_id) REFERENCES coding_problems(id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Code Templates Table
CREATE TABLE IF NOT EXISTS coding_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  problem_id INT NOT NULL,
  language VARCHAR(50) NOT NULL,
  template_code LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_problem_language (problem_id, language),
  CONSTRAINT fk_templates_problem FOREIGN KEY (problem_id) REFERENCES coding_problems(id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Code Submissions Table
CREATE TABLE IF NOT EXISTS coding_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  problem_id INT NOT NULL,
  student_user_id INT NOT NULL,
  code LONGTEXT NOT NULL,
  language VARCHAR(50) NOT NULL,
  status ENUM('submitted', 'running', 'graded', 'error') NOT NULL DEFAULT 'submitted',
  score DECIMAL(5,2) NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  graded_at TIMESTAMP NULL,
  CONSTRAINT fk_submissions_problem FOREIGN KEY (problem_id) REFERENCES coding_problems(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_submissions_student FOREIGN KEY (student_user_id) REFERENCES users(id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Execution Results Table
CREATE TABLE IF NOT EXISTS coding_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  submission_id INT NOT NULL,
  testcase_id INT NOT NULL,
  passed TINYINT(1) NOT NULL DEFAULT 0,
  output LONGTEXT NULL,
  error_message TEXT NULL,
  execution_time_ms INT NULL,
  memory_used_mb INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_results_submission FOREIGN KEY (submission_id) REFERENCES coding_submissions(id)
    ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_results_testcase FOREIGN KEY (testcase_id) REFERENCES coding_testcases(id)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Execution Environment Configuration
CREATE TABLE IF NOT EXISTS coding_environments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  language VARCHAR(50) NOT NULL UNIQUE,
  version VARCHAR(50),
  compiler_command VARCHAR(255),
  run_command VARCHAR(255),
  timeout_seconds INT DEFAULT 5,
  memory_limit_mb INT DEFAULT 256,
  supported_features JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for Performance
CREATE INDEX idx_coding_problems_difficulty ON coding_problems(difficulty_level);
CREATE INDEX idx_coding_problems_creator ON coding_problems(created_by);
CREATE INDEX idx_coding_problems_published ON coding_problems(published_at);
CREATE INDEX idx_submissions_problem ON coding_submissions(problem_id);
CREATE INDEX idx_submissions_student ON coding_submissions(student_user_id);
CREATE INDEX idx_submissions_status ON coding_submissions(status);
CREATE INDEX idx_results_submission ON coding_results(submission_id);

-- Seed Coding Environments
INSERT IGNORE INTO coding_environments (language, version, compiler_command, run_command, timeout_seconds) VALUES
('javascript', 'node', 'node', 'node {file}', 5),
('python', '3.11', 'python3', 'python3 {file}', 5),
('cpp', '17', 'g++ -std=c++17', './{output}', 5),
('java', '11', 'javac', 'java Main', 5);

-- Seed Sample Coding Problem 1: Two Sum
INSERT IGNORE INTO coding_problems 
(id, title, description, difficulty_level, problem_statement, constraints, created_by, published_at, time_limit_seconds, memory_limit_mb, supported_languages) 
VALUES (
  1,
  'Two Sum',
  'Find two numbers in an array that add up to a target sum',
  'easy',
  'Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
  '• 2 <= nums.length <= 10^4\n• -10^9 <= nums[i] <= 10^9\n• -10^9 <= target <= 10^9\n• Only one valid answer exists.',
  (SELECT id FROM users WHERE email = 'prof.sharma@edupredict.local' OR role_id = (SELECT id FROM roles WHERE name = 'teacher') LIMIT 1),
  NOW(),
  5,
  256,
  '["javascript", "python", "cpp", "java"]'
);

-- Seed Sample Coding Problem 2: Valid Palindrome
INSERT IGNORE INTO coding_problems 
(id, title, description, difficulty_level, problem_statement, constraints, created_by, published_at, time_limit_seconds, memory_limit_mb, supported_languages) 
VALUES (
  2,
  'Valid Palindrome',
  'Determine if a string is a palindrome after converting to lowercase and removing non-alphanumeric characters',
  'easy',
  'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.\n\nGiven a string s, return true if it is a palindrome, or false otherwise.',
  '• 1 <= s.length <= 2 * 10^5\n• s consists only of printable ASCII characters.',
  (SELECT id FROM users WHERE email = 'prof.sharma@edupredict.local' OR role_id = (SELECT id FROM roles WHERE name = 'teacher') LIMIT 1),
  NOW(),
  5,
  256,
  '["javascript", "python", "cpp", "java"]'
);

-- Test cases for Two Sum
INSERT IGNORE INTO coding_testcases (problem_id, input_data, expected_output, sample_explanation, is_hidden) VALUES
(1, '[2,7,11,15], 9', '[0,1]', 'Because nums[0] + nums[1] == 9, we return [0, 1].', 0),
(1, '[3,2,4], 6', '[1,2]', 'Because nums[1] + nums[2] == 6, we return [1, 2].', 0),
(1, '[3,3], 6', '[0,1]', 'Because nums[0] + nums[1] == 6, we return [0, 1].', 1);

-- Test cases for Valid Palindrome
INSERT IGNORE INTO coding_testcases (problem_id, input_data, expected_output, sample_explanation, is_hidden) VALUES
(2, '"A man, a plan, a canal: Panama"', 'true', '"amanaplanacanalpanama" is a palindrome.', 0),
(2, '"race a car"', 'false', '"raceacar" is not a palindrome.', 0),
(2, '" "', 'true', 's is an empty string "" after removing non-alphanumeric characters. Since an empty string reads the same forward and backward, it is a palindrome.', 1);

-- Starter Templates for Problem 1
INSERT IGNORE INTO coding_templates (problem_id, language, template_code) VALUES
(1, 'javascript', '/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}
'),
(1, 'python', 'class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        lookup = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in lookup:
                return [lookup[diff], i]
            lookup[num] = i
        return []
'),
(1, 'cpp', '#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); ++i) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};
'),
(1, 'java', 'import java.util.*;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }
}
');
