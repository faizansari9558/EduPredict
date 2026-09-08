/**
 * Stitch Realistic Assessments & Coding Challenges Data
 */

export const mockAssessmentsList = [
  {
    id: 1,
    title: 'Advanced Data Structures & Algorithms Assessment',
    category: 'Technical Coding',
    type: 'Coding Arena',
    total_questions: 4,
    duration_minutes: 90,
    passing_score: 70,
    difficulty: 'Hard',
    deadline: '2026-09-15',
    status: 'Upcoming',
    attempts: 0
  },
  {
    id: 2,
    title: 'Quantitative Aptitude & Logical Reasoning Benchmark',
    category: 'Aptitude',
    type: 'Timed MCQ',
    total_questions: 30,
    duration_minutes: 45,
    passing_score: 60,
    difficulty: 'Medium',
    deadline: '2026-09-10',
    status: 'Completed',
    score: 84,
    attempts: 1
  },
  {
    id: 3,
    title: 'Full-Stack Web Technologies & REST APIs',
    category: 'Domain Mastery',
    type: 'MCQ + Coding',
    total_questions: 20,
    duration_minutes: 60,
    passing_score: 65,
    difficulty: 'Medium',
    deadline: '2026-09-20',
    status: 'Upcoming',
    attempts: 0
  }
];

export const mockCodingChallenges = [
  {
    id: 1,
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Strings & HashMaps',
    acceptance_rate: '68%',
    points: 100,
    solved: true
  },
  {
    id: 2,
    title: 'Binary Tree Maximum Path Sum',
    difficulty: 'Hard',
    category: 'Trees & Dynamic Programming',
    acceptance_rate: '42%',
    points: 200,
    solved: true
  },
  {
    id: 3,
    title: 'LRU Cache Implementation',
    difficulty: 'Hard',
    category: 'Design & Linked List',
    acceptance_rate: '54%',
    points: 200,
    solved: false
  },
  {
    id: 4,
    title: 'Merge K Sorted Linked Lists',
    difficulty: 'Hard',
    category: 'Heaps & Divide and Conquer',
    acceptance_rate: '48%',
    points: 200,
    solved: false
  }
];
