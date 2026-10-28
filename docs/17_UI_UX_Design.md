# 17 — UI/UX Design & Information Architecture

## 1. User Interface Philosophy & Principles

EduPredict's UI/UX design is built on three core tenets:
1. **Cognitive Clarity**: High-density academic data is organized into clean, scannable cards with explicit visual hierarchies.
2. **Context-Driven Navigation**: Role-aware interfaces display only relevant workflows, eliminating administrative clutter for students and mentors.
3. **Actionable Feedback**: Status badges, verification alerts, and interactive test feedback provide immediate, non-ambiguous system responses.

---

## 2. Information Architecture & Navigation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          TOP NAVIGATION BAR (SHARED)                        │
│   [Logo]  [Role Badges]  [Module Links]  [Notification Bell]  [User/Logout] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  STUDENT PORTAL                TEACHER PORTAL             ADMIN PORTAL      │
│  ├── Dashboard (Stats)         ├── Dashboard (Overview)   ├── Dashboard     │
│  ├── Academic Profile          ├── Assigned Students      ├── User Mgmt     │
│  ├── Document Uploads          ├── Document Verify Queue  ├── Departments   │
│  ├── Aptitude Assessments      ├── Assessment Studio      ├── Batches       │
│  ├── Coding Arena              ├── Coding Challenge Mgr   ├── Placement     │
│  ├── Placement Forecast        ├── Class Analytics        │   Drives        │
│  ├── Resume AI & Copilot       └── At-Risk Student Alerts └── Audit Logs    │
│  └── Campus Job Drives                                                      │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Key Screen Layouts & User Experiences

### 3.1 Student Coding Arena (`/coding/:problemId`)
- **Split-Pane Layout**:
  - Left Pane (40% width): Problem statement, examples, constraints, and submission history.
  - Right Pane (60% width): Multi-language code editor with line numbers, syntax styling, language selector, and Run/Submit buttons.
- **Docked Output Drawer**:
  - Displays real-time test case execution results (Expected Output vs Actual Output, diff highlighting, execution time in ms, memory consumed in MB).

### 3.2 Timed Assessment Taker (`/assessment/:id/take/:attemptId`)
- **Top Sticky Timer Bar**: Live countdown timer with color shift (Green $\rightarrow$ Amber $\rightarrow$ Red during the final 5 minutes).
- **Question Palette**: Interactive grid showing question states (`Answered`, `Unanswered`, `Marked for Review`).
- **Confirmation Modal**: Prevents accidental early submissions and triggers automated submission on timer expiry.

### 3.3 Teacher Verification Queue (`/teacher`)
- **Tabbed Review Interface**: Filter by pending, approved, and rejected submissions.
- **Side-by-Side Reviewer**: In-browser PDF/image preview alongside student metadata with one-click "Approve" or "Reject with Comment" actions.

---

## 4. Responsive Viewports & Accessibility

- **Desktop (1024px – 1920px)**: Multi-column grid layouts with persistent sidebars and split-pane code editors.
- **Tablet (768px – 1023px)**: Stacked responsive cards and collapsible navigation drawers.
- **Mobile (320px – 767px)**: Single-column scrollable feed with touch-optimized form inputs and sticky action bars.
- **Accessibility Standards**: WCAG 2.1 AA compliant color contrasts, semantic HTML elements, and keyboard-navigable dialogs.
