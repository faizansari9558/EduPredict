"""
AI Explainability and Recommendation Engine
Calculates positive drivers, negative blockers, and individualized recommendations
"""

from typing import Dict, List, Any


BENCHMARKS = {
    'cgpa': {'target': 7.5, 'weight': 0.20, 'name': 'CGPA (Academics)'},
    'aptitude_score': {'target': 70.0, 'weight': 0.25, 'name': 'Aptitude Assessment'},
    'coding_score': {'target': 70.0, 'weight': 0.28, 'name': 'Coding & Technical Problem Solving'},
    'backlogs_count': {'target': 0, 'weight': 0.15, 'name': 'Academic Backlogs'},
    'num_projects': {'target': 2, 'weight': 0.08, 'name': 'Practical Projects'},
    'num_internships': {'target': 1, 'weight': 0.10, 'name': 'Industry Internships'},
    'profile_completion_pct': {'target': 85.0, 'weight': 0.05, 'name': 'Profile Completeness'}
}


def explain_prediction(student_features: Dict[str, Any], probability: float) -> Dict[str, Any]:
    """
    Generates explainability breakdown for a student prediction.
    """
    positive_drivers = []
    risk_blockers = []
    recommendations = []

    cgpa = float(student_features.get('cgpa', 0.0))
    aptitude = float(student_features.get('aptitude_score', 0.0))
    coding = float(student_features.get('coding_score', 0.0))
    backlogs = int(student_features.get('backlogs_count', 0))
    projects = int(student_features.get('num_projects', 0))
    internships = int(student_features.get('num_internships', 0))
    skills = int(student_features.get('num_skills', 0))
    profile_completion = float(student_features.get('profile_completion_pct', 0.0))

    # 1. Evaluate Coding
    if coding >= 75.0:
        positive_drivers.append({
            'feature': 'Coding & Technical Mastery',
            'value': f"{coding:.1f}%",
            'impact': '+Strong',
            'detail': 'High coding performance is a top criteria for tier-1 tech recruiters.'
        })
    elif coding < 60.0:
        gap = 60.0 - coding
        risk_blockers.append({
            'feature': 'Coding Assessment Score',
            'value': f"{coding:.1f}%",
            'impact': '-High',
            'detail': f'Score is {gap:.1f}% below the minimum 60% tech screening benchmark.'
        })
        recommendations.append({
            'priority': 'HIGH',
            'category': 'Coding Arena',
            'action': 'Practice at least 3 medium-difficulty algorithmic problems weekly in Coding Arena to boost technical screening clearance.'
        })

    # 2. Evaluate Aptitude
    if aptitude >= 75.0:
        positive_drivers.append({
            'feature': 'Quantitative & Logical Aptitude',
            'value': f"{aptitude:.1f}%",
            'impact': '+Moderate',
            'detail': 'Strong aptitude clearance ensures passing initial round online assessments.'
        })
    elif aptitude < 60.0:
        risk_blockers.append({
            'feature': 'Aptitude Score',
            'value': f"{aptitude:.1f}%",
            'impact': '-Medium',
            'detail': 'Aptitude score falls short of standard campus recruitment cutoffs.'
        })
        recommendations.append({
            'priority': 'HIGH',
            'category': 'Aptitude Prep',
            'action': 'Complete targeted quantitative and verbal reasoning practice modules to exceed the 65% benchmark.'
        })

    # 3. Evaluate CGPA & Backlogs
    if cgpa >= 8.0:
        positive_drivers.append({
            'feature': 'Academic CGPA',
            'value': f"{cgpa:.2f}",
            'impact': '+Strong',
            'detail': 'High cumulative grade meets all eligibility criteria across companies.'
        })
    elif cgpa < 6.5:
        risk_blockers.append({
            'feature': 'Academic CGPA',
            'value': f"{cgpa:.2f}",
            'impact': '-High',
            'detail': 'CGPA is below the 6.5 cutoff required by top recruitment drives.'
        })
        recommendations.append({
            'priority': 'HIGH',
            'category': 'Academics',
            'action': 'Prioritize upcoming semester course examinations to pull cumulative CGPA above 6.5.'
        })

    if backlogs > 0:
        risk_blockers.append({
            'feature': 'Active Backlogs',
            'value': f"{backlogs} backlog(s)",
            'impact': '-Critical',
            'detail': 'Most tier-1 & tier-2 companies require zero active backlogs at time of interview.'
        })
        recommendations.append({
            'priority': 'CRITICAL',
            'category': 'Course Clearance',
            'action': 'Clear remaining backlog courses in the next immediate examination cycle.'
        })

    # 4. Evaluate Projects & Internships
    if projects >= 3 or internships >= 1:
        positive_drivers.append({
            'feature': 'Practical Experience',
            'value': f"{projects} projects, {internships} internship(s)",
            'impact': '+Moderate',
            'detail': 'Hands-on practical experience significantly improves resume shortlist rates.'
        })
    else:
        if internships == 0:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'Industry Exposure',
                'action': 'Apply for virtual internships and summer industry programs to strengthen profile credentials.'
            })
        if projects < 2:
            recommendations.append({
                'priority': 'MEDIUM',
                'category': 'Projects',
                'action': 'Build and deploy at least 2 full-stack or domain-specific capstone projects with public code repositories.'
            })

    # 5. Profile Completeness
    if profile_completion < 80.0:
        recommendations.append({
            'priority': 'LOW',
            'category': 'Profile Verification',
            'action': 'Upload remaining academic certificates and marksheets to complete institutional verification.'
        })

    # Risk level classification
    if probability >= 0.75:
        risk_level = 'Low'
    elif probability >= 0.50:
        risk_level = 'Medium'
    else:
        risk_level = 'High'

    return {
        'probability_percent': round(probability * 100, 1),
        'risk_level': risk_level,
        'positive_drivers': positive_drivers,
        'risk_blockers': risk_blockers,
        'actionable_recommendations': recommendations
    }
