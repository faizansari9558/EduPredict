/**
 * Stitch Realistic Student Mock Data
 * Isolated for clear transition to live backend API
 */

export const mockStudentProfile = {
  id: 5,
  name: 'Faiz Ansari',
  enrollment_number: 'EP-2022-CS-089',
  email: 'faiz.ansari@edupredict.edu',
  phone: '+91 98765 43210',
  department: 'Computer Science & Engineering',
  batch: '2022-2026',
  current_semester: 6,
  academic_year: '2024 - 2025',
  cgpa: 8.2,
  attendance_pct: 92,
  active_backlogs: 0,
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
  readiness_score: 85,
  placement_probability: 78,
  predicted_tier: 'Tier-1 (Product / Core Tech)',
  expected_package: '12 - 18 LPA'
};

export const mockSemesterRecords = [
  { semester: 'Sem 1', sgpa: 7.6, cgpa: 7.6, credits: 24, status: 'Passed' },
  { semester: 'Sem 2', sgpa: 7.9, cgpa: 7.75, credits: 24, status: 'Passed' },
  { semester: 'Sem 3', sgpa: 8.1, cgpa: 7.87, credits: 26, status: 'Passed' },
  { semester: 'Sem 4', sgpa: 8.3, cgpa: 7.98, credits: 26, status: 'Passed' },
  { semester: 'Sem 5', sgpa: 8.6, cgpa: 8.10, credits: 24, status: 'Passed' },
  { semester: 'Sem 6', sgpa: 8.7, cgpa: 8.20, credits: 22, status: 'In Progress (Predicted)' }
];

export const mockSkills = [
  { id: 1, name: 'Data Structures & Algorithms', category: 'Technical', level: 'Advanced', score: 88, verified: true },
  { id: 2, name: 'React.js & Modern Frontend', category: 'Web Tech', level: 'Advanced', score: 92, verified: true },
  { id: 3, name: 'Node.js & Express REST APIs', category: 'Backend', level: 'Intermediate', score: 84, verified: true },
  { id: 4, name: 'Python & Machine Learning', category: 'AI/ML', level: 'Intermediate', score: 79, verified: false },
  { id: 5, name: 'Database Management & SQL', category: 'Database', level: 'Advanced', score: 86, verified: true },
  { id: 6, name: 'Quantitative Aptitude & Logic', category: 'Aptitude', level: 'Proficient', score: 82, verified: true },
  { id: 7, name: 'System Design Basics', category: 'Architecture', level: 'Beginner', score: 65, verified: false }
];

export const mockProjects = [
  {
    id: 1,
    title: 'EduPredict Placement Intelligence System',
    category: 'Full Stack AI / ML',
    technologies: ['React 18', 'Node.js', 'FastAPI', 'Scikit-Learn', 'MySQL'],
    description: 'Predictive analytics portal forecasting placement outcomes using 16 engineered features with 89.8% accuracy.',
    github: 'https://github.com/faizansari9558/EduPredict',
    live: 'http://localhost:3000',
    status: 'Verified',
    completion_date: 'Sep 2026'
  },
  {
    id: 2,
    title: 'Cloud Document Verification Engine',
    category: 'Backend & Cloud',
    technologies: ['Express.js', 'AWS S3', 'Multer', 'JWT'],
    description: 'Automated student credential and transcript verification workflow with cryptographically signed certificates.',
    github: 'https://github.com/faizansari9558/cloud-verifier',
    status: 'Verified',
    completion_date: 'May 2026'
  }
];

export const mockCertifications = [
  {
    id: 1,
    title: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services (AWS)',
    issue_date: 'Jul 2025',
    credential_id: 'AWS-SAA-849201',
    status: 'Verified',
    badge_color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    id: 2,
    title: 'Meta Frontend Developer Professional Certificate',
    issuer: 'Coursera / Meta',
    issue_date: 'Jan 2025',
    credential_id: 'META-FE-928172',
    status: 'Verified',
    badge_color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  }
];

export const mockInternships = [
  {
    id: 1,
    company: 'FinTech Cloud Solutions',
    role: 'Full Stack Engineering Intern',
    duration: '3 Months (Jun 2025 - Aug 2025)',
    location: 'Bangalore, India (Hybrid)',
    responsibilities: 'Engineered high-throughput REST APIs and dashboard components reducing load latency by 34%.',
    status: 'Verified & Credited',
    mentor_feedback: 'Outstanding technical ability and high commitment to delivery.'
  }
];

export const mockPlacementDrivers = {
  positiveDrivers: [
    { title: 'Consistent CGPA Velocity', impact: '+14% Probability', description: 'Strong upward trajectory from 7.6 to 8.2 over 5 consecutive semesters.' },
    { title: 'High Technical Coding Proficiency', impact: '+18% Probability', description: 'Solved 140+ medium/hard LeetCode level algorithmic challenges.' },
    { title: 'Verified Tier-1 Internship', impact: '+12% Probability', description: 'Industry exposure with proven full-stack deliverables.' }
  ],
  riskBlockers: [
    { title: 'System Design Assessment Score', impact: '-6% Penalty', description: 'Scored 65% in distributed architecture fundamentals.' },
    { title: 'Aptitude Speed Optimization', impact: '-4% Penalty', description: 'Time per quantitative reasoning question is 12s above cohort median.' }
  ],
  prescriptiveActions: [
    'Complete 3 mock technical interviews targeting System Design fundamentals.',
    'Take 2 timed Quantitative Aptitude drills focusing on Speed Math.',
    'Publish final year capstone repository with comprehensive documentation.'
  ]
};

// Aliases for consistent naming across components
export const mockStudentOverview = mockStudentProfile;
export const mockStudentProjects = mockProjects;
export const mockStudentCertifications = mockCertifications;
export const mockStudentInternships = mockInternships;
