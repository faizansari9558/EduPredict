# EduPredict Rules and Standards

## 1. What to Use

Approved technologies and practices:
- React.js for frontend
- Node.js + Express.js for backend
- MySQL + phpMyAdmin for database and local management
- JWT for authentication
- bcrypt for password hashing
- Role-based access control (Student, Teacher, Admin)
- REST API conventions
- Modular backend structure with separate controller/service patterns
- Python for ML training and evaluation
- FastAPI later for internal ML service integration
- Standardized naming and semantic code organization

## 2. What to Avoid

Avoid the following:
- Do not use MongoDB for the core relational system without serious justification
- Do not execute student code directly inside Node.js server processes
- Do not hard-code university-specific CGPA or percentage conversion rules globally
- Do not store plain text passwords
- Do not rely only on frontend hiding for security decisions
- Do not fabricate historical placement data as real
- Do not use arbitrary AI-generated confidence without model-backed logic
- Do not merge ML and application business logic into a single layer
- Do not create duplicate service implementations

## 3. Libraries and Dependencies

### Frontend
- react
- react-dom
- react-router-dom
- axios
- modern CSS toolkit or custom CSS system
- chart library for dashboard analytics when needed

### Backend
- express
- mysql2 or sequelize
- bcryptjs or bcrypt
- jsonwebtoken
- multer
- cors
- dotenv
- express-rate-limit
- validator or similar validation libraries

### ML
- pandas
- numpy
- scikit-learn
- xgboost
- matplotlib

## 4. Error Handling

- Validate all requests in the backend
- Return consistent API error responses
- Keep user-facing messages simple and non-sensitive
- Do not expose stack traces to end users
- Log server-side errors with useful metadata
- Use fallbacks when external services are unavailable
- Handle file upload failures and authorization failures explicitly

## 5. Boundaries of AI

AI and ML must remain clearly separated:
- ML predicts placement outcomes based on verified student data
- Generative AI may explain and recommend improvements, but must not invent unsupported conclusions
- AI-generated explanations must be tied to actual data, not random assumptions
- Resume scoring must be based on transparent criteria and verified document status
- No fabricated feature contributions or arbitrary weights without evidence

## 6. General Rules

### Code Style and Formatting
- Use readable, consistent indentation
- Prefer meaningful variable and function names
- Reuse components and backend services where possible
- Keep code modular and maintainable

### Naming Conventions
- Use camelCase for JavaScript variables and functions
- Use PascalCase for React components
- Use snake_case for database columns and Python variables where appropriate
- Use consistent route and controller naming

### Commit Guidelines
- Use clear, conventional commit messages
- Examples: feat: setup frontend, feat: add authentication, fix: correct RBAC checks

### Security and Data Privacy
- Never expose JWT secrets or DB credentials
- Store only necessary personally identifiable data
- Restrict document access based on ownership and role
- Use parameterized SQL queries

### Performance and Scalability
- Keep queries efficient and indexed
- Paginate large result sets when necessary
- Use asynchronous patterns for data-heavy operations
- Avoid unnecessary re-renders in the frontend

### Documentation and Comments
- Document architecture, APIs, and core workflows
- Use comments only when needed for clarity
- Keep README and docs updated after major phase completion

### Testing Rules
- Validate forms and API validation paths
- Test RBAC behavior on protected endpoints
- Test document upload and verification flows
- Validate assessment and result workflows
- Run backend and frontend checks after phase completion

## 7. Decision Notes

This project should remain structured and avoid premature complexity. The initial phases focus on the MVP before advanced AI, resume AI, coding sandbox enhancements, and deployment tasks are introduced.
