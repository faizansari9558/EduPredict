# 23 — ML Dataset & Feature Engineering

## 1. Placement Dataset Specification (`placement_dataset.csv`)

The model is trained on a comprehensive higher education placement dataset (`ml/data/placement_dataset.csv`) containing 1,000+ student records with verified academic, assessment, project, and placement outcome labels.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          16-FEATURE DOMAIN TAXONOMY                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [ ACADEMIC FOUNDATION ]     [ ASSESSMENT METRICS ]   [ PRACTICAL EXPERIENCE│
│  • `cgpa`                    • `aptitude_score`       • `internships_count` │
│  • `tenth_percentage`        • `coding_score`         • `projects_count`    │
│  • `twelfth_percentage`      • `assessments_attempted`• `certifications_ct` │
│  • `backlogs_count`          • `coding_problems_solved• `workshops_attended`│
│                                                                             │
│  [ SKILL & PROFILE ]         [ SOFT SKILLS ]          [ TARGET VARIABLE ]   │
│  • `technical_skills_count`  • `communication_score`  • `placed` (0 or 1)   │
│  • `profile_completion_pct`  • `hackathons_count`                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Feature Engineering & Schema Definitions

| # | Feature Name | Data Type | Domain Range | Engineering Rationale |
| :---: | :--- | :---: | :---: | :--- |
| 1 | `cgpa` | Float | `0.00 – 10.00` | Core undergraduate academic performance benchmark |
| 2 | `tenth_percentage` | Float | `0.0 – 100.0` | Secondary school foundational consistency |
| 3 | `twelfth_percentage` | Float | `0.0 – 100.0` | Higher secondary STEM academic baseline |
| 4 | `backlogs_count` | Integer | `0 – 10+` | Critical negative penalty risk indicator |
| 5 | `aptitude_score` | Float | `0.0 – 100.0` | Quantitative, logical, and verbal problem-solving score |
| 6 | `coding_score` | Float | `0.0 – 100.0` | Practical algorithm and implementation proficiency |
| 7 | `assessments_attempted` | Integer | `0 – 50+` | Student test engagement and practice volume |
| 8 | `coding_problems_solved`| Integer | `0 – 100+` | Hands-on programming practice volume |
| 9 | `internships_count` | Integer | `0 – 5` | Industry exposure and real-world experience |
| 10 | `projects_count` | Integer | `0 – 10` | Applied domain knowledge and portfolio strength |
| 11 | `certifications_count` | Integer | `0 – 10` | Continuous skill acquisition and self-learning |
| 12 | `technical_skills_count`| Integer | `0 – 20+` | Breadth of programming languages, tools, frameworks |
| 13 | `profile_completion_pct`| Float | `0.0 – 100.0` | Institutional documentation and verification readiness |
| 14 | `communication_score` | Float | `0.0 – 100.0` | Soft skills, presentation, and interview articulation |
| 15 | `hackathons_count` | Integer | `0 – 10` | Competitive problem solving and teamwork |
| 16 | `workshops_attended` | Integer | `0 – 15` | Extra-curricular technical seminars attended |

### Target Classification Label:
- **`placed`**: Binary label (`1` = Student secured campus placement offer, `0` = Student not placed).

---

## 3. Data Preprocessing & Transformations

The Scikit-learn preprocessing pipeline (`ml/preprocessing/pipeline.py`) applies:
1. **Missing Value Imputation**: Median strategy for numerical features to prevent skew from outliers.
2. **Standardization (`StandardScaler`)**: Normalizes numerical continuous variables to zero mean ($\mu = 0$) and unit variance ($\sigma = 1$).
3. **Stratified Train/Test Split**: 80% Training ($N=800$) and 20% Holdout Testing ($N=200$) with stratified target class distribution.
