"""
Model Training and Comparison Pipeline
Compares Logistic Regression, Decision Tree, Random Forest, and Gradient Boosting
Saves the best-performing model and metrics report.
"""

import os
import sys
import json
import joblib
from datetime import datetime
import numpy as np
import pandas as pd

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

# Ensure ml root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from ml.data.generate_dataset import generate_placement_dataset
from ml.preprocessing.pipeline import PlacementFeaturePipeline, FEATURE_COLUMNS, ALL_FEATURE_COLUMNS


def train_and_evaluate_models():
    print("=" * 70)
    print(">> EDUPREDICT ML PIPELINE: MODEL TRAINING & BENCHMARK COMPARISON")
    print("=" * 70)

    # 1. Prepare Dataset
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'data'))
    csv_path = os.path.join(data_dir, 'placement_dataset.csv')

    if not os.path.exists(csv_path):
        print("Generating synthetic placement dataset...")
        df = generate_placement_dataset(n_samples=2500)
        os.makedirs(data_dir, exist_ok=True)
        df.to_csv(csv_path, index=False)
    else:
        df = pd.read_csv(csv_path)

    print(f"✓ Dataset loaded: {len(df)} samples | {len(FEATURE_COLUMNS)} raw features")

    # 2. Extract Features and Target
    X = df[FEATURE_COLUMNS]
    y = df['placement_status'].values

    # Train / Test Split
    X_train_raw, X_test_raw, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Preprocessing Pipeline
    pipeline = PlacementFeaturePipeline()
    X_train = pipeline.fit_transform(X_train_raw)
    X_test = pipeline.transform(X_test_raw)

    print(f"✓ Feature Engineering completed: {X_train.shape[1]} engineered features\n")

    # 3. Model Candidates
    models = {
        "Logistic Regression (Baseline)": LogisticRegression(max_iter=1000, random_state=42),
        "Decision Tree Classifier": DecisionTreeClassifier(max_depth=6, random_state=42),
        "Random Forest Classifier": RandomForestClassifier(n_estimators=120, max_depth=8, min_samples_split=4, random_state=42),
        "Gradient Boosting Classifier": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=4, random_state=42)
    }

    results = {}
    best_model_name = None
    best_roc_auc = -1.0
    best_model = None

    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    print(f"{'Model':<32} | {'Accuracy':<9} | {'Precision':<9} | {'Recall':<8} | {'F1-Score':<8} | {'ROC-AUC':<8} | {'5-Fold CV'}")
    print("-" * 95)

    for name, clf in models.items():
        # Train
        clf.fit(X_train, y_train)

        # Predictions
        y_pred = clf.predict(X_test)
        y_prob = clf.predict_proba(X_test)[:, 1] if hasattr(clf, "predict_proba") else y_pred

        # Metrics
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        auc = roc_auc_score(y_test, y_prob)

        # Cross Validation
        cv_scores = cross_val_score(clf, X_train, y_train, cv=cv, scoring='roc_auc')
        cv_mean = cv_scores.mean()

        results[name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(float(auc), 4),
            "cv_roc_auc_mean": round(float(cv_mean), 4),
            "cv_roc_auc_std": round(float(cv_scores.std()), 4)
        }

        print(f"{name:<32} | {acc*100:6.2f}%   | {prec*100:6.2f}%   | {rec*100:6.2f}%  | {f1*100:6.2f}%  | {auc*100:6.2f}%  | {cv_mean*100:5.2f}%")

        if auc > best_roc_auc:
            best_roc_auc = auc
            best_model_name = name
            best_model = clf

    print("-" * 95)
    print(f">> Best Performing Model: {best_model_name} (ROC-AUC: {best_roc_auc*100:.2f}%)\n")

    # 4. Feature Importance (if tree-based)
    feature_importances = {}
    if hasattr(best_model, 'feature_importances_'):
        importances = best_model.feature_importances_
        sorted_indices = np.argsort(importances)[::-1]
        print("Feature Importances:")
        for i in sorted_indices[:8]:
            col_name = ALL_FEATURE_COLUMNS[i]
            imp_val = float(importances[i])
            feature_importances[col_name] = round(imp_val, 4)
            print(f"   * {col_name:<24}: {imp_val * 100:.2f}%")

    # 5. Save Artifacts
    saved_models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'saved_models'))
    os.makedirs(saved_models_dir, exist_ok=True)

    model_bundle = {
        "model": best_model,
        "pipeline": pipeline,
        "model_name": best_model_name,
        "feature_columns": FEATURE_COLUMNS,
        "all_feature_columns": ALL_FEATURE_COLUMNS,
        "feature_importances": feature_importances,
        "metrics": results[best_model_name],
        "all_model_benchmarks": results,
        "trained_at": datetime.utcnow().isoformat()
    }

    model_path = os.path.join(saved_models_dir, 'placement_model.joblib')
    joblib.dump(model_bundle, model_path)
    print(f"\n[OK] Saved model bundle -> {model_path}")

    # Metrics JSON for API
    metrics_path = os.path.join(saved_models_dir, 'model_metrics.json')
    with open(metrics_path, 'w') as f:
        json.dump({
            "best_model": best_model_name,
            "metrics": results[best_model_name],
            "feature_importances": feature_importances,
            "all_models": results,
            "trained_at": datetime.utcnow().isoformat(),
            "samples_count": len(df),
            "features_count": len(ALL_FEATURE_COLUMNS)
        }, f, indent=2)

    print(f"✓ Saved metrics report -> {metrics_path}")
    print("=" * 70)

    return model_bundle


if __name__ == '__main__':
    train_and_evaluate_models()
