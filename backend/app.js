const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const uploads = require('./middleware/upload'); // Middleware for handling file uploads

// Import routes
const authRoutes = require('./features/auth/auth.routes');
const userRoutes = require('./features/user/user.routes');
const courseRoutes = require('./features/course/course.routes');
const moduleRoutes = require('./features/module/module.routes');   // ✅ Module routes
const lectureRoutes = require('./features/lecture/lecture.routes'); 
const enrollmentRoutes = require('./features/enrollment/enrollment.routes');
const assignmentRoutes = require('./features/assignment/assignment.routes');
const submissionRoutes = require('./features/submission/submission.routes');
const attendanceRoutes = require('./features/attendance/attendance.routes');
const gradeRoutes = require('./features/grade/grade.routes');
const messageRoutes = require('./features/message/message.routes');
const notificationRoutes = require('./features/notification/notification.routes');
const analyticsRoutes = require('./features/analytics/analytics.routes');
const uploadRoutes = require('./features/resource/resource.routes');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/modules', moduleRoutes);    
app.use('/api/lectures', lectureRoutes);   
app.use('/api/grades', gradeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {},
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
