/**
 * Stitch Realistic Teacher Mock Data
 */

export const mockTeacherProfile = {
  id: 2,
  name: 'Dr. Anand Sharma',
  email: 'sharma@edupredict.local',
  designation: 'Associate Professor & Placement Faculty Mentor',
  department: 'Computer Science & Engineering',
  assignedStudentsCount: 42,
  pendingVerificationsCount: 7,
  activeAssessmentsCount: 4,
  mentorSlotsAvailable: 8
};

export const mockAssignedStudents = [
  { id: 101, name: 'Aisha Khan', roll: 'EP-2022-CS-004', cgpa: 8.8, attendance: 95, placementProb: 89, status: 'Verified', atRisk: false },
  { id: 102, name: 'Faiz Ansari', roll: 'EP-2022-CS-089', cgpa: 8.2, attendance: 92, placementProb: 78, status: 'Verified', atRisk: false },
  { id: 103, name: 'Rahul Verma', roll: 'EP-2022-CS-045', cgpa: 6.8, attendance: 71, placementProb: 44, status: 'Pending Review', atRisk: true, riskReason: 'Low Attendance & CGPA Drop' },
  { id: 104, name: 'Priya Patel', roll: 'EP-2022-CS-112', cgpa: 9.1, attendance: 98, placementProb: 94, status: 'Verified', atRisk: false },
  { id: 105, name: 'Vikram Singh', roll: 'EP-2022-CS-078', cgpa: 6.2, attendance: 68, placementProb: 38, status: 'In Review', atRisk: true, riskReason: 'Active Backlog in Data Structures' },
  { id: 106, name: 'Sneha Roy', roll: 'EP-2022-CS-099', cgpa: 7.9, attendance: 88, placementProb: 74, status: 'Verified', atRisk: false }
];

export const mockVerifications = [
  { id: 1, studentName: 'Rahul Verma', docType: 'Internship Completion Certificate', company: 'SoftTech Corp', submittedOn: '2026-09-04', status: 'Pending' },
  { id: 2, studentName: 'Vikram Singh', docType: 'Sem 5 Grade Transcript', issuer: 'University Exam Cell', submittedOn: '2026-09-03', status: 'Pending' },
  { id: 3, studentName: 'Aisha Khan', docType: 'AWS Solutions Architect Badge', issuer: 'Amazon Web Services', submittedOn: '2026-09-01', status: 'Approved' }
];

export const mockTeacherCohortMetrics = {
  averageCgpa: 7.85,
  classAttendanceRate: 88.4,
  highReadinessPct: 68,
  atRiskCount: 5,
  totalSubmissions: 38
};

export const mockTeacherStudents = mockAssignedStudents;
