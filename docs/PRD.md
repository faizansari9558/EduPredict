# EduPredict Product Requirements Document (PRD)

## 1. Product Overview

EduPredict is a Smart Student Academic & Placement Prediction System built for universities and colleges to manage student academic information, validate documents, carry out assessments, analyze student performance, and estimate placement readiness using ML-based prediction.

## 2. Product Vision

The system reduces manual work for faculty and administrators while giving students a structured path to improve their academic, technical, and placement readiness.

## 3. Target Users

### Students
- Submit academic and placement profile data
- Add technical skills, projects, internships, and certifications
- Upload and manage documents
- Take aptitude and coding assessments
- View verified results and ML-driven placement insights

### Teachers
- Manage assigned students
- Verify uploaded documents and records
- Create and publish assessments
- Review student performance and progress
- Evaluate assigned students using faculty criteria

### Admins
- Manage institutional structure
- Create and update departments, courses, years, semesters, and batches
- Manage users and teacher assignments
- Monitor system health, analytics, and student records

## 4. Key Problems Solved

- Manual student records and verification are time-consuming
- Documents and academic records are not centrally managed
- Placement readiness is difficult to assess without structured analytics
- Assessments are not consistently tracked and published
- Student weaknesses are not highlighted early enough

## 5. Core Features

### Student Features
- Single login with role-aware access
- Read-only official academic profile
- Profile completion tracking
- Resume, academic, and document upload
- Technical skill selection
- Projects, internships, and certifications management
- Coding Test 1 and 2
- Aptitude Test
- Verified result access after publication
- Placement probability and analysis after verification
- Strengths, weaknesses, and recommendations

### Teacher Features
- Assigned student management
- Bulk student import support
- Document verification and rejection with reasons
- Assessment creation and result publishing
- Faculty evaluation scoring
- Student monitoring and skill-gap analytics

### Admin Features
- Department and course configuration
- User, teacher, and student management
- Bulk importing of authorized records
- Academic structure management
- System-wide analytics
- Teacher assignment controls

### System Features
- RBAC and secure authentication
- Document validation and user ownership checks
- Email OTP verification for registration
- Activity logging for authentication events
- ML prediction pipeline
- Explainability and recommendations
- Notification system
- Report export capability

## 6. Functional Scope (MVP)

The initial MVP includes:
- Landing page
- Single login page
- Registration and verification flow
- Role-based dashboard access
- Student profile management
- Document upload and teacher verification
- 2 coding tests and 1 aptitude test
- Teacher-published marks
- Verified student dataset creation
- ML prediction for placement outcome
- Student and teacher analytics

## 7. Non-Goals for Initial Phase

- Advanced AI career assistant
- Resume AI extraction beyond the later roadmap
- Plagiarism detection engine
- Full generative AI explanation agent
- Complex multicloud deployment setup

## 8. Success Criteria

The product is successful when:
- Students can securely submit and manage their academic and placement information
- Teachers can verify records and publish assessment results
- Admins can manage institutional configuration and user access
- Placement prediction is available only for verified student profiles
- Users can see meaningful analytics and recommendations

## 9. Risks and Constraints

- Data quality must be high before predictions are generated
- Student code execution must be sandboxed and isolated
- Authentication and authorization must be enforced at the backend
- MySQL is the preferred relational database for the project lifecycle

## 10. Assumptions

- The university has authorized student and teacher records
- Student and faculty data will be managed through institutional workflows
- The first version focuses on the local development environment before deployment
