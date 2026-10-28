    # EduPredict — Stitch MCP Frontend

**EduPredict — Smart Student Academic & Placement Prediction System**

This frontend is generated from the official Google Stitch MCP Server designs (`projects/16063683693004738798`) and built using **React 18**, **Vite 5**, and **Tailwind CSS v4** (CSS-first architecture).

---

## 🎨 Design System & Color Palette

All color tokens are configured directly in `src/index.css` via the `@theme` block:

- **Primary**: Deep Academic Navy (`#00152a`)
- **Primary Container**: Slate Blue Container (`#102a43`)
- **Secondary**: Royal Electric Blue (`#0051d5`)
- **Tertiary Accent**: Mint Green (`#6ffbbe`)
- **Background**: Soft Off-White (`#f8f9ff`)
- **Surface Containers**: Low (`#f2f4fc`), Normal (`#eef0f8`), High (`#e8eaf2`)
- **Typography**: `Plus Jakarta Sans` (Headlines), `Inter` (Body & Data Tables)
- **Icons**: `Google Material Symbols Outlined`

---

## 🚀 Running the Stitch Frontend

```bash
cd d:\EduPredict\stitch
npm install
npm run dev
```

Default development server runs on: **`http://localhost:3001`**

To build for production:

```bash
npm run build
```

---

## 📂 Project Structure

```text
stitch/
├── public/
├── src/
│   ├── assets/
│   │   └── logo/                 # Official EduPredict vector SVG logos
│   │       ├── logo.svg
│   │       ├── logo-dark.svg
│   │       └── logo-mark.svg
│   ├── components/               # Reusable atomic UI components
│   │   ├── Logo.jsx
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatCard.jsx
│   │   ├── ChartCard.jsx
│   │   ├── DataTable.jsx
│   │   ├── StatusBadge.jsx
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   └── PageHeader.jsx
│   ├── layouts/
│   │   └── MainLayout.jsx        # Role-aware responsive layout shell
│   ├── pages/
│   │   ├── LandingPage.jsx       # Public portal & AI preview
│   │   ├── LoginPage.jsx         # 1-click role switcher login
│   │   ├── RegisterPage.jsx      # Multi-department student/faculty registration
│   │   ├── student/              # 12 Student Portal Pages
│   │   │   ├── StudentDashboard.jsx
│   │   │   ├── StudentProfile.jsx
│   │   │   ├── AcademicRecords.jsx
│   │   │   ├── StudentSkills.jsx
│   │   │   ├── StudentProjects.jsx
│   │   │   ├── StudentCertifications.jsx
│   │   │   ├── StudentInternships.jsx
│   │   │   ├── StudentResume.jsx
│   │   │   ├── StudentAssessments.jsx   (With interactive coding IDE)
│   │   │   ├── StudentResults.jsx
│   │   │   ├── PlacementAnalysis.jsx    (With What-If simulator)
│   │   │   └── StudentNotifications.jsx
│   │   ├── teacher/              # 7 Faculty & Mentor Pages
│   │   │   ├── TeacherDashboard.jsx
│   │   │   ├── AssignedStudents.jsx
│   │   │   ├── DocumentVerification.jsx (Audit modal for project proofs)
│   │   │   ├── TeacherAssessments.jsx
│   │   │   ├── TeacherResults.jsx
│   │   │   ├── TeacherAnalytics.jsx     (Cohort competency radar chart)
│   │   │   └── TeacherNotifications.jsx
│   │   └── admin/                # 6 Institution Leadership Pages
│   │       ├── AdminDashboard.jsx
│   │       ├── UserManagement.jsx       (RBAC controls)
│   │       ├── DepartmentManagement.jsx
│   │       ├── InstitutionalAnalytics.jsx (YoY CTC/placement line charts)
│   │       ├── AdminReports.jsx         (NAAC / TPO exportable dossiers)
│   │       └── AdminNotifications.jsx   (Campus broadcast modal)
│   ├── data/                     # Strictly isolated mock data stores
│   ├── services/                 # API client & backend service abstractions
│   ├── App.jsx                   # React Router v6 mapping
│   ├── main.jsx                  # Application entry point
│   └── index.css                 # Tailwind v4 token configuration
├── package.json
└── vite.config.js
```

---

## 🔗 Backend & ML Services

- **Express.js Backend**: `http://localhost:5000` (`/api/auth`, `/api/student`, `/api/prediction`)
- **FastAPI ML Service**: `http://localhost:8000` (`/predict`, `/predict/advanced`, `/health`)
- **MySQL Database**: `edupredict` (Configured in `backend/config/database.js`)
