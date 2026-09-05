"""
Dataset Generation Script for Placement Prediction
Generates realistic multi-factor student training dataset
"""

import os
import numpy as np
import pandas as pd

def generate_placement_dataset(n_samples=2000, seed=42):
    np.random.seed(seed)
    
    # 1. Academic Features
    cgpa = np.clip(np.random.normal(7.4, 1.1, n_samples), 4.5, 10.0)
    tenth_pct = np.clip(np.random.normal(78.0, 9.5, n_samples), 50.0, 99.0)
    twelfth_pct = np.clip(np.random.normal(75.0, 10.5, n_samples), 50.0, 99.0)
    backlogs = np.random.choice([0, 1, 2, 3, 4], size=n_samples, p=[0.72, 0.16, 0.07, 0.03, 0.02])
    
    # 2. Technical & Assessment Features
    # Aptitude score correlated with CGPA and 12th percentage
    aptitude_base = 0.4 * (cgpa * 10) + 0.3 * twelfth_pct + 0.3 * 70
    aptitude_score = np.clip(aptitude_base + np.random.normal(0, 8.0, n_samples), 30.0, 100.0)
    
    # Coding score correlated with CGPA and independent practice factor
    coding_base = 0.45 * (cgpa * 10) + 0.55 * np.random.uniform(40, 95, n_samples)
    coding_score = np.clip(coding_base + np.random.normal(0, 9.0, n_samples), 25.0, 100.0)
    
    # Skills, Projects, Certifications, Internships
    num_skills = np.random.choice(range(1, 13), size=n_samples, p=[0.05, 0.08, 0.12, 0.18, 0.20, 0.15, 0.10, 0.05, 0.03, 0.02, 0.01, 0.01])
    num_projects = np.random.choice(range(0, 7), size=n_samples, p=[0.10, 0.25, 0.30, 0.20, 0.10, 0.03, 0.02])
    num_certifications = np.random.choice(range(0, 6), size=n_samples, p=[0.20, 0.35, 0.25, 0.12, 0.05, 0.03])
    num_internships = np.random.choice(range(0, 4), size=n_samples, p=[0.45, 0.38, 0.14, 0.03])
    profile_completion = np.clip(np.random.normal(82.0, 12.0, n_samples), 40.0, 100.0)
    
    # Department distribution
    departments = np.random.choice(['CSE', 'ECE', 'ME', 'CE', 'EE'], size=n_samples, p=[0.40, 0.25, 0.15, 0.10, 0.10])
    
    # 3. Placement Propensity Composite Formula
    propensity = (
        0.20 * (cgpa * 10) +
        0.08 * tenth_pct +
        0.08 * twelfth_pct +
        0.22 * aptitude_score +
        0.25 * coding_score +
        0.05 * np.minimum(num_projects * 18, 100) +
        0.06 * np.minimum(num_internships * 30, 100) +
        0.03 * np.minimum(num_certifications * 15, 100) +
        0.03 * profile_completion -
        0.12 * (backlogs * 22) +
        np.random.normal(0, 4.5, n_samples)
    )
    
    # Normalize propensity to 0 - 100
    propensity = np.clip(propensity, 10.0, 99.0)
    
    # Classification Target: Placed (1) or Not Placed (0)
    # Threshold chosen to yield realistic placement rate (~70-75%)
    placement_status = (propensity >= 63.0).astype(int)
    
    # Placement Tier
    def get_tier(p):
        if p >= 85.0:
            return 'Super Dream'
        elif p >= 74.0:
            return 'Dream'
        elif p >= 63.0:
            return 'Standard'
        return 'Not Placed'
        
    placement_tier = [get_tier(p) for p in propensity]
    
    # Expected Package in LPA (Lakhs Per Annum)
    salary_base = 3.5 + (propensity - 63.0) * 0.32
    expected_package = np.where(
        placement_status == 1,
        np.round(np.clip(salary_base + np.random.normal(0, 0.8, n_samples), 3.5, 32.0), 2),
        0.0
    )
    
    df = pd.DataFrame({
        'cgpa': np.round(cgpa, 2),
        'tenth_percentage': np.round(tenth_pct, 2),
        'twelfth_percentage': np.round(twelfth_pct, 2),
        'backlogs_count': backlogs,
        'aptitude_score': np.round(aptitude_score, 2),
        'coding_score': np.round(coding_score, 2),
        'num_skills': num_skills,
        'num_projects': num_projects,
        'num_certifications': num_certifications,
        'num_internships': num_internships,
        'profile_completion_pct': np.round(profile_completion, 1),
        'department': departments,
        'propensity_score': np.round(propensity, 2),
        'placement_status': placement_status,
        'placement_tier': placement_tier,
        'expected_package_lpa': expected_package
    })
    
    return df

if __name__ == '__main__':
    data_dir = os.path.join(os.path.dirname(__file__))
    os.makedirs(data_dir, exist_ok=True)
    csv_path = os.path.join(data_dir, 'placement_dataset.csv')
    
    df = generate_placement_dataset(n_samples=2500)
    df.to_csv(csv_path, index=False)
    print(f"Generated {len(df)} samples dataset -> {csv_path}")
    print("\nDataset Summary:")
    print(f"Placement Rate: {(df['placement_status'].mean() * 100):.2f}%")
    print(df['placement_tier'].value_counts())
