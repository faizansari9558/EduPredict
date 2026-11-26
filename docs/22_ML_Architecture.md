# 22 — Machine Learning System Architecture

## 1. ML Pipeline Architecture

The EduPredict Machine Learning tier is an independent FastAPI service
decoupled from the Node.js API server. Inference is synchronous over HTTP.
The service uses a pure-NumPy predictor and serializes its trained model and
preprocessing parameters as JSON, avoiding a runtime dependency on
scikit-learn or binary model artifacts.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MACHINE LEARNING SERVICE TOPOLOGY                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ EXPRESS API SERVER (PORT 5000) ]                                         │
│  • Gathers student academic, assessment, and profile metrics               │
│  • Sends a StudentFeatures JSON payload                                    │
│                                                                             │
│                        │ HTTP POST (JSON Payload)                           │
│                        ▼                                                    │
│  [ FASTAPI ML MICROSERVICE (PORT 8000) ]                                    │
│  ├── `ml/app.py` (FastAPI ASGI Web Server)                                  │
│  │                                                                          │
│  ├── [ FEATURE PREPROCESSING PIPELINE (`pipeline.py`) ]                     │
│  │   • Pydantic range and type validation                                  │
│  │   • Five domain-specific engineered features                            │
│  │   • Mean/standard-deviation normalization learned during training       │
│  │                                                                          │
│  ├── [ TRAINED INFERENCE MODEL (`placement_model.json`) ]                   │
│  │   • Logistic Regression trained with NumPy gradient descent              │
│  │   • `predict_proba()` ──► Placement Probability (0.0 to 1.0)             │
│  │                                                                          │
│  └── [ EXPLAINABILITY ENGINE (`explainability.py`) ]                        │
│      • Positive drivers and risk blockers                                   │
│      • Risk-level classification                                            │
│      • Prescriptive improvement recommendations                             │
│                                                                             │
│                        │ HTTP Response (JSON Forecast & Explainability)     │
│                        ▼                                                    │
│  [ STUDENT / TEACHER DASHBOARDS ]                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 2. Microservice API Endpoints (`ml/app.py`)

### 2.1 Liveness & Diagnostic Endpoints

- `GET /health`: Loads the model if necessary and returns service status and
  model confirmation:
  ```json
  {
    "status": "healthy",
    "service": "EduPredict ML API",
    "model_loaded": true,
    "model_name": "Logistic Regression (Baseline)",
    "timestamp": "2026-01-01T00:00:00+00:00"
  }
  ```
- `GET /model-info`: Returns the selected model, training timestamp, metrics,
  feature importances, and feature lists. Metric values are generated from
  the trained dataset and therefore change when the model is retrained.

### 2.2 Inference Endpoints

- `POST /predict/placement`: Accepts one `StudentFeatures` record and returns
  placement probability, readiness, tier, confidence, and estimated package.
- `POST /predict/explain`: Returns the placement response plus positive
  drivers, risk blockers, risk level, and actionable recommendations.
- `POST /predict/batch`: Accepts `{ "batch_id": number, "students": [...] }`
  and returns per-student results plus cohort summary counts and average
  probability.

`StudentFeatures` contains the following fields:
`student_id`, `cgpa`, `tenth_percentage`, `twelfth_percentage`,
`backlogs_count`, `aptitude_score`, `coding_score`, `num_skills`,
`num_projects`, `num_certifications`, `num_internships`, and
`profile_completion_pct`. Most fields have defaults in the Pydantic schema;
bounded percentage and score fields are validated from 0 to 100.

## 3. Feature Transformation

The model receives 11 raw features. The preprocessing pipeline derives five
additional features:

- `academic_index`: weighted CGPA, tenth-percentage, and twelfth-percentage
  score.
- `technical_index`: weighted aptitude and coding score.
- `experience_score`: capped contribution from projects, internships, and
  certifications.
- `backlog_penalty`: `backlogs_count * 15`.
- `holistic_readiness`: weighted academic, technical, and experience score
  minus the backlog penalty.

The 16 resulting columns are normalized using the training mean and standard
deviation saved in the JSON model bundle.

## 4. Model Loading & Resilience

The service lazily loads `ml/saved_models/placement_model.json` on the first
health or inference request. If the artifact is missing, it trains the
predictor from `ml/data/placement_dataset.csv` and stores a new JSON bundle.
If the model cannot be loaded or trained, the endpoint returns an explicit
service error; it does not silently substitute a rule-based prediction.

The Node.js client in `backend/services/mlService.js` applies an eight-second
request timeout and propagates rejected responses or network errors to its
caller. Operational deployments should therefore monitor the ML service and
handle unavailable-service errors at the API boundary.
