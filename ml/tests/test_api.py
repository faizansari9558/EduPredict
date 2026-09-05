"""
Unit & Integration Tests for FastAPI ML Microservice
"""

import pytest
from fastapi.testclient import TestClient
from ml.app import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True

def test_model_info_endpoint():
    response = client.get("/model-info")
    assert response.status_code == 200
    data = response.json()
    assert "model_name" in data
    assert "metrics" in data
    assert data["metrics"]["roc_auc"] >= 0.85

def test_predict_placement_high_readiness():
    sample_student = {
        "student_id": 5,
        "cgpa": 8.8,
        "tenth_percentage": 90.0,
        "twelfth_percentage": 88.0,
        "backlogs_count": 0,
        "aptitude_score": 85.0,
        "coding_score": 88.0,
        "num_skills": 6,
        "num_projects": 3,
        "num_certifications": 2,
        "num_internships": 1,
        "profile_completion_pct": 95.0
    }
    response = client.post("/predict/placement", json=sample_student)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["is_placement_ready"] is True
    assert data["placement_probability"] >= 0.70
    assert data["placement_tier"] in ["Dream", "Super Dream"]

def test_predict_placement_at_risk():
    sample_at_risk = {
        "student_id": 7,
        "cgpa": 5.2,
        "tenth_percentage": 58.0,
        "twelfth_percentage": 55.0,
        "backlogs_count": 2,
        "aptitude_score": 45.0,
        "coding_score": 40.0,
        "num_skills": 2,
        "num_projects": 0,
        "num_certifications": 0,
        "num_internships": 0,
        "profile_completion_pct": 50.0
    }
    response = client.post("/predict/placement", json=sample_at_risk)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["placement_probability"] < 0.50
    assert data["readiness_status"] == "Needs Improvement"

def test_predict_explain():
    sample_student = {
        "student_id": 5,
        "cgpa": 8.2,
        "tenth_percentage": 82.0,
        "twelfth_percentage": 80.0,
        "backlogs_count": 0,
        "aptitude_score": 78.0,
        "coding_score": 52.0,  # lower coding
        "num_skills": 4,
        "num_projects": 1,
        "num_certifications": 1,
        "num_internships": 0,
        "profile_completion_pct": 85.0
    }
    response = client.post("/predict/explain", json=sample_student)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "explanation" in data
    explanation = data["explanation"]
    assert len(explanation["actionable_recommendations"]) > 0
    # Coding gap should be flagged in blockers or recommendations
    has_coding_rec = any("Coding" in r["category"] or "coding" in r["action"].lower() for r in explanation["actionable_recommendations"])
    assert has_coding_rec is True

def test_predict_batch():
    batch_req = {
        "batch_id": 1,
        "students": [
            {
                "student_id": 5,
                "cgpa": 8.5,
                "tenth_percentage": 85.0,
                "twelfth_percentage": 82.0,
                "backlogs_count": 0,
                "aptitude_score": 80.0,
                "coding_score": 85.0,
                "num_skills": 5,
                "num_projects": 2,
                "num_certifications": 1,
                "num_internships": 1,
                "profile_completion_pct": 90.0
            },
            {
                "student_id": 6,
                "cgpa": 6.0,
                "tenth_percentage": 60.0,
                "twelfth_percentage": 58.0,
                "backlogs_count": 1,
                "aptitude_score": 50.0,
                "coding_score": 45.0,
                "num_skills": 2,
                "num_projects": 0,
                "num_certifications": 0,
                "num_internships": 0,
                "profile_completion_pct": 60.0
            }
        ]
    }
    response = client.post("/predict/batch", json=batch_req)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["results"]) == 2
    assert "summary" in data
    assert data["summary"]["total_students"] == 2
