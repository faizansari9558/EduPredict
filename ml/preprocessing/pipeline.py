"""
Feature Engineering and Preprocessing Pipeline
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler

FEATURE_COLUMNS = [
    'cgpa',
    'tenth_percentage',
    'twelfth_percentage',
    'backlogs_count',
    'aptitude_score',
    'coding_score',
    'num_skills',
    'num_projects',
    'num_certifications',
    'num_internships',
    'profile_completion_pct'
]

ENGINEERED_FEATURE_COLUMNS = [
    'academic_index',
    'technical_index',
    'experience_score',
    'backlog_penalty',
    'holistic_readiness'
]

ALL_FEATURE_COLUMNS = FEATURE_COLUMNS + ENGINEERED_FEATURE_COLUMNS


def compute_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """Computes composite domain indexes from raw student features"""
    df = df.copy()
    
    # Fill defaults if missing
    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = 0.0
            
    df['academic_index'] = (
        (df['cgpa'] * 10 * 0.5) +
        (df['tenth_percentage'] * 0.25) +
        (df['twelfth_percentage'] * 0.25)
    )
    
    df['technical_index'] = (
        (df['aptitude_score'] * 0.45) +
        (df['coding_score'] * 0.55)
    )
    
    df['experience_score'] = (
        np.minimum(df['num_projects'] * 15, 60) +
        np.minimum(df['num_internships'] * 25, 50) +
        np.minimum(df['num_certifications'] * 10, 30)
    )
    
    df['backlog_penalty'] = df['backlogs_count'] * 15.0
    
    df['holistic_readiness'] = (
        (df['academic_index'] * 0.30) +
        (df['technical_index'] * 0.50) +
        (df['experience_score'] * 0.20) -
        df['backlog_penalty']
    )
    
    return df[ALL_FEATURE_COLUMNS]


class PlacementFeaturePipeline:
    def __init__(self):
        self.scaler = StandardScaler()
        self.is_fitted = False

    def fit(self, X: pd.DataFrame):
        X_eng = compute_engineered_features(X)
        self.scaler.fit(X_eng)
        self.is_fitted = True
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Pipeline has not been fitted yet.")
        X_eng = compute_engineered_features(X)
        return self.scaler.transform(X_eng)

    def fit_transform(self, X: pd.DataFrame) -> np.ndarray:
        return self.fit(X).transform(X)

    def save(self, filepath: str):
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump(self, filepath)

    @classmethod
    def load(cls, filepath: str) -> "PlacementFeaturePipeline":
        return joblib.load(filepath)
