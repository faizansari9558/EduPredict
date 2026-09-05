"""
FastAPI ML Prediction Microservice for EduPredict
Provides high-performance inference, explainability, and batch forecasting endpoints.
"""

import os
import sys
from typing import List, Optional, Dict, Any
from datetime import datetime
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure root is accessible
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from ml.models.explainability import explain_prediction
from ml.preprocessing.pipeline import FEATURE_COLUMNS

app = FastAPI(
    title="EduPredict ML Prediction API",
    description="Machine Learning Microservice for Placement Prediction, Risk Forecasting, and Explainability",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'saved_models', 'placement_model.joblib')
model_bundle = None


def get_model():
    global model_bundle
    if model_bundle is None:
        if os.path.exists(MODEL_PATH):
            model_bundle = joblib.load(MODEL_PATH)
        else:
            # Auto-train if model doesn't exist yet
            from ml.models.train import train_and_evaluate_models
            model_bundle = train_and_evaluate_models()
    return model_bundle


# ============================================================================
# PYDANTIC SCHEMAS
# ============================================================================

class StudentFeatures(BaseModel):
    student_id: Optional[int] = None
    cgpa: float = Field(default=7.0, ge=0.0, le=10.0)
    tenth_percentage: float = Field(default=75.0, ge=0.0, le=100.0)
    twelfth_percentage: float = Field(default=75.0, ge=0.0, le=100.0)
    backlogs_count: int = Field(default=0, ge=0)
    aptitude_score: float = Field(default=70.0, ge=0.0, le=100.0)
    coding_score: float = Field(default=70.0, ge=0.0, le=100.0)
    num_skills: int = Field(default=4, ge=0)
    num_projects: int = Field(default=2, ge=0)
    num_certifications: int = Field(default=1, ge=0)
    num_internships: int = Field(default=0, ge=0)
    profile_completion_pct: float = Field(default=80.0, ge=0.0, le=100.0)


class BatchPredictionRequest(BaseModel):
    batch_id: Optional[int] = None
    students: List[StudentFeatures]


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/health")
def health_check():
    mb = get_model()
    return {
        "status": "healthy",
        "service": "EduPredict ML API",
        "model_loaded": mb is not None,
        "model_name": mb.get("model_name") if mb else None,
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/model-info")
def get_model_metadata():
    mb = get_model()
    if not mb:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
    return {
        "model_name": mb.get("model_name"),
        "trained_at": mb.get("trained_at"),
        "metrics": mb.get("metrics"),
        "all_model_benchmarks": mb.get("all_model_benchmarks"),
        "feature_importances": mb.get("feature_importances"),
        "feature_columns": mb.get("feature_columns"),
        "all_features": mb.get("all_feature_columns")
    }


@app.post("/predict/placement")
def predict_placement(features: StudentFeatures):
    mb = get_model()
    if not mb:
        raise HTTPException(status_code=503, detail="Model is not available.")

    model = mb["model"]
    pipeline = mb["pipeline"]

    data_dict = features.model_dump()
    df = pd.DataFrame([data_dict])

    X_trans = pipeline.transform(df)
    pred_class = int(model.predict(X_trans)[0])
    probabilities = model.predict_proba(X_trans)[0]
    prob_placed = float(probabilities[1])

    # Placement Tier & Salary Estimation
    if prob_placed >= 0.85:
        tier = "Super Dream"
        estimated_lpa = round(12.0 + (prob_placed - 0.85) * 40.0, 1)
        readiness_status = "High Readiness"
    elif prob_placed >= 0.70:
        tier = "Dream"
        estimated_lpa = round(7.0 + (prob_placed - 0.70) * 33.3, 1)
        readiness_status = "Good Readiness"
    elif prob_placed >= 0.50:
        tier = "Standard"
        estimated_lpa = round(4.0 + (prob_placed - 0.50) * 15.0, 1)
        readiness_status = "Moderate Readiness"
    else:
        tier = "At Risk / Remedial"
        estimated_lpa = 0.0
        readiness_status = "Needs Improvement"

    # Confidence score
    confidence = float(max(probabilities))

    return {
        "success": True,
        "student_id": features.student_id,
        "is_placement_ready": bool(pred_class == 1),
        "placement_probability": round(prob_placed, 4),
        "placement_probability_pct": round(prob_placed * 100, 1),
        "placement_tier": tier,
        "readiness_status": readiness_status,
        "estimated_package_lpa": estimated_lpa,
        "confidence_score": round(confidence, 4),
        "model_used": mb["model_name"]
    }


@app.post("/predict/explain")
def predict_and_explain(features: StudentFeatures):
    mb = get_model()
    if not mb:
        raise HTTPException(status_code=503, detail="Model is not available.")

    # Get placement prediction first
    prediction_result = predict_placement(features)
    data_dict = features.model_dump()

    # Generate explainability details
    prob = prediction_result["placement_probability"]
    explanation = explain_prediction(data_dict, prob)

    return {
        "success": True,
        "prediction": prediction_result,
        "explanation": explanation
    }


@app.post("/predict/batch")
def predict_batch(request: BatchPredictionRequest):
    mb = get_model()
    if not mb:
        raise HTTPException(status_code=503, detail="Model is not available.")

    model = mb["model"]
    pipeline = mb["pipeline"]

    if not request.students:
        return {"success": True, "results": [], "summary": {}}

    data_list = [s.model_dump() for s in request.students]
    df = pd.DataFrame(data_list)

    X_trans = pipeline.transform(df)
    pred_classes = model.predict(X_trans)
    probabilities = model.predict_proba(X_trans)[:, 1]

    results = []
    placed_count = 0
    high_ready_count = 0
    at_risk_count = 0

    for i, s in enumerate(request.students):
        prob = float(probabilities[i])
        is_ready = bool(pred_classes[i] == 1)

        if is_ready:
            placed_count += 1
        if prob >= 0.75:
            high_ready_count += 1
        elif prob < 0.50:
            at_risk_count += 1

        results.append({
            "student_id": s.student_id,
            "is_placement_ready": is_ready,
            "placement_probability": round(prob, 4),
            "placement_probability_pct": round(prob * 100, 1),
            "risk_level": "Low" if prob >= 0.75 else ("Medium" if prob >= 0.50 else "High")
        })

    total = len(request.students)
    summary = {
        "total_students": total,
        "placement_ready_count": placed_count,
        "placement_ready_pct": round((placed_count / total) * 100, 1) if total > 0 else 0,
        "high_readiness_count": high_ready_count,
        "at_risk_count": at_risk_count,
        "average_placement_probability": round(float(probabilities.mean()) * 100, 1) if total > 0 else 0
    }

    return {
        "success": True,
        "batch_id": request.batch_id,
        "summary": summary,
        "results": results
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run("ml.app:app", host="0.0.0.0", port=8000, reload=True)
