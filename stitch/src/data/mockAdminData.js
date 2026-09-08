/**
 * Stitch Realistic Admin Mock Data
 */

export const mockAdminProfile = {
  id: 1,
  name: 'Institutional Administrator',
  email: 'admin@edupredict.local',
  role: 'System Administrator',
  institution: 'Imperial Institute of Technology & Management'
};

export const mockDepartmentStats = [
  { id: 1, name: 'Computer Science & Engineering', code: 'CSE', students: 480, faculty: 32, avgCgpa: 8.14, placementForecast: 86 },
  { id: 2, name: 'Information Technology', code: 'IT', students: 360, faculty: 24, avgCgpa: 7.92, placementForecast: 82 },
  { id: 3, name: 'Electronics & Communication', code: 'ECE', students: 320, faculty: 26, avgCgpa: 7.64, placementForecast: 74 },
  { id: 4, name: 'Mechanical Engineering', code: 'MECH', students: 240, faculty: 20, avgCgpa: 7.22, placementForecast: 64 },
  { id: 5, name: 'Civil Engineering', code: 'CIVIL', students: 180, faculty: 16, avgCgpa: 7.08, placementForecast: 58 }
];

export const mockSystemKPIs = {
  totalStudents: 1580,
  totalFaculty: 118,
  totalDepartments: 5,
  overallPlacementReadiness: 76.8,
  predictedTier1Placed: 420,
  predictedTier2Placed: 710,
  atRiskInterventionsPending: 18,
  activeDrives: 12
};

export const mockPlacementTiers = [
  { tier: 'Tier-1 (> 12 LPA)', count: 420, pct: 26.5, color: '#10B981' },
  { tier: 'Tier-2 (6 - 12 LPA)', count: 710, pct: 45.0, color: '#2563EB' },
  { tier: 'Tier-3 (3.5 - 6 LPA)', count: 320, pct: 20.2, color: '#F59E0B' },
  { tier: 'At-Risk / Inactive', count: 130, pct: 8.3, color: '#EF4444' }
];
