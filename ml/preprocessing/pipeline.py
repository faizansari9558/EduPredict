"""
Feature Engineering and Preprocessing Pipeline (Pure NumPy / Zero Sklearn Dependency)
"""

import os
import json
import numpy as np
import pandas as pd

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
    def __init__(self, mean=None, scale=None):
        self.mean_ = np.array(mean, dtype=float) if mean is not None else None
        self.scale_ = np.array(scale, dtype=float) if scale is not None else None
        self.is_fitted = (self.mean_ is not None and self.scale_ is not None)

    def fit(self, X: pd.DataFrame):
        X_eng = compute_engineered_features(X).values
        self.mean_ = np.mean(X_eng, axis=0)
        self.scale_ = np.std(X_eng, axis=0)
        self.scale_[self.scale_ == 0] = 1.0
        self.is_fitted = True
        return self

    def transform(self, X: pd.DataFrame) -> np.ndarray:
        if not self.is_fitted:
            raise ValueError("Pipeline has not been fitted yet.")
        X_eng = compute_engineered_features(X).values
        return (X_eng - self.mean_) / self.scale_

    def fit_transform(self, X: pd.DataFrame) -> np.ndarray:
        return self.fit(X).transform(X)

    def to_dict(self):
        return {
            'mean': self.mean_.tolist() if self.mean_ is not None else None,
            'scale': self.scale_.tolist() if self.scale_ is not None else None
        }

    @classmethod
    def from_dict(cls, data: dict) -> "PlacementFeaturePipeline":
        return cls(mean=data.get('mean'), scale=data.get('scale'))
