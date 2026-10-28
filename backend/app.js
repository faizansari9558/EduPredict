const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
const assessmentRoutes = require('./routes/assessment');
const codingRoutes = require('./routes/coding');
const analyticsRoutes = require('./routes/analytics');
const predictionRoutes = require('./routes/prediction');
const resumeRoutes = require('./routes/resume');
const careerAiRoutes = require('./routes/careerAi');
const notificationRoutes = require('./routes/notifications');
const reportRoutes = require('./routes/reports');
const jobDriveRoutes = require('./routes/jobDrives');



const app = express();

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Origin is not allowed'));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
}));

app.get('/api', (req, res) => {
  res.json({
    app: 'EduPredict API',
    version: '1.0.0',
    status: 'ready'
  });
});

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/teacher', teacherRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/student/resume', resumeRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/career-ai', careerAiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/job-drives', jobDriveRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found.'
  });
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

module.exports = app;
