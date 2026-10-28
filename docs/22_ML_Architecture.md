# 22 — Machine Learning System Architecture

## 1. ML Pipeline Architecture

The EduPredict Machine Learning tier is architected as an asynchronous, independent microservice decoupled from the Node.js API server.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MACHINE LEARNING SERVICE TOPOLOGY                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ EXPRESS API SERVER (PORT 5000) ]                                         │
│  • Gathers verified academic metrics & assessment scores from MySQL         │
│  • Constructs 16-feature input vector                                       │
│                                                                             │
│                        │ HTTP POST (JSON Payload)                           │
│                        ▼                                                    │
│  [ FASTAPI ML MICROSERVICE (PORT 8000) ]                                    │
│  ├── `ml/app.py` (FastAPI ASGI Web Server)                                  │
│  │                                                                          │
│  ├── [ FEATURE PREPROCESSING PIPELINE (`pipeline.py`) ]                     │
│  │   • Feature Validation & Type Casting                                    │
│  │   • Categorical Encoding (One-Hot / Ordinal)                             │
│  │   • StandardScaler Feature Normalization                                 │
│  │                                                                          │
│  ├── [ TRAINED INFERENCE MODEL (`placement_model.joblib`) ]                 │
│  │   • Logistic Regression / Gradient Boosting Classifier                   │
│  │   • `predict_proba()` ──► Placement Probability (0.0% to 100.0%)         │
│  │                                                                          │
│  └── [ EXPLAINABILITY ENGINE (`explainability.py`) ]                        │
│      • Feature Contribution Impact Scoring                                  │
│      • Top 3 Positive Drivers & Top 3 Risk Blockers Identification          │
│      • Prescriptive Improvement Recommendations Generation                  │
│                                                                             │
│                        │ HTTP Response (JSON Forecast & Explainability)     │
│                        ▼                                                    │
│  [ STUDENT / TEACHER DASHBOARDS ]                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Microservice API Endpoints (`ml/app.py`)

### 2.1 Liveness & Diagnostic Endpoints
- `GET /health`: Returns microservice health status, uptime, and model load confirmation:
  ```json
  { "status": "online", "service": "EduPredict ML Microservice", "model_loaded": true }
  ```
- `GET /model-info`: Returns model hyperparameters, feature list, and evaluation metrics:
  ```json
  {
    "model_name": "LogisticRegression",
    "roc_auc": 0.8984,
    "f1_score": 0.8676,
    "feature_count": 16,
    "features": ["cgpa", "tenth_percentage", "twelfth_percentage", "backlogs", "aptitude_score", "coding_score", ...]
  }
  ```

### 2.2 Inference Endpoints
- `POST /predict/placement`: Takes single student 16-feature vector and outputs placement probability and confidence category.
- `POST /predict/explain`: Returns placement probability together with top positive drivers and risk blockers.
- `POST /predict/batch`: High-throughput batch inference endpoint accepting a list of student records for cohort placement forecasting.

---

## 3. Resilience & Fallback Protocol

If the FastAPI ML microservice is temporarily unreachable:
1. `backend/services/mlService.js` intercepts network errors (timeout or connection refused).
2. The service logs a warning and automatically activates a deterministic rule-based fallback heuristic:
   ```javascript
   const fallbackProb = Math.min(100, Math.max(0,
     (cgpa * 6.5) + (aptitudeScore * 0.25) + (codingScore * 0.25) - (backlogs * 12)
   ));
   ```
3. Dashboard receives valid data marked `is_fallback: true` ensuring uninterrupted user experience.
