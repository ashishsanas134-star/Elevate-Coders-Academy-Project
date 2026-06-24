import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { signup, login, getProfile, authMiddleware, logout, forgotPassword, updateProfile } from './controllers/authController.js';
import { getAllCourses, getCourseById, enrollInCourse, updateProgress, getMyCourses, getProgressByCourseId, getCourseVideos } from './controllers/courseController.js';
import { submitInquiry } from './controllers/contactController.js';
import { adminMiddleware, getStats, getStudentsList, getInquiriesList, createCourse, updateCourse, deleteCourse } from './controllers/adminController.js';
import { getBatches, createBatch, enrollInBatch, askDoubt, getStudentDoubts, getAllDoubts, resolveDoubt, submitQuizResult, getQuizResults, checkout, getTransactions } from './controllers/lmsController.js';
import { submitDiscussionMessage, getDiscussionsByCourse } from './controllers/discussionController.js';
import { generateCertificate, getCertificateById, getMyCertificates } from './controllers/certificateController.js';
import { initDB } from './data/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for our React app development server
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root check
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Elevate Coders Academy API.' });
});

// Authentication routes
app.post('/api/auth/signup', signup);
app.post('/api/auth/login', login);
app.get('/api/auth/profile', authMiddleware, getProfile);
app.put('/api/auth/profile', authMiddleware, updateProfile);
app.post('/api/auth/register', signup);
app.post('/api/auth/logout', authMiddleware, logout);
app.post('/api/auth/forgot-password', forgotPassword);

// Aliases for Authentication
app.post('/register', signup);
app.post('/login', login);
app.post('/logout', authMiddleware, logout);
app.post('/forgot-password', forgotPassword);

// Course public routes
app.get('/api/courses', getAllCourses);
app.get('/api/courses/:id', getCourseById);
app.get('/api/courses/:id/videos', getCourseVideos);

// Aliases for Course
app.get('/courses', getAllCourses);
app.get('/course/:id', getCourseById);
app.get('/course/:id/videos', getCourseVideos);

// Student protected routes
app.post('/api/courses/enroll', authMiddleware, enrollInCourse);
app.post('/api/courses/progress', authMiddleware, updateProgress);
app.post('/api/contact', submitInquiry);

// Aliases for Enrollment & Progress
app.post('/enroll', authMiddleware, enrollInCourse);
app.get('/my-courses', authMiddleware, getMyCourses);
app.get('/api/courses/my-courses', authMiddleware, getMyCourses);
app.post('/update-progress', authMiddleware, updateProgress);
app.get('/progress/:courseId', authMiddleware, getProgressByCourseId);
app.get('/api/courses/progress/:courseId', authMiddleware, getProgressByCourseId);

// Discussion endpoints
app.post('/api/discussion', authMiddleware, submitDiscussionMessage);
app.get('/api/discussion/:courseId', getDiscussionsByCourse);
app.post('/discussion', authMiddleware, submitDiscussionMessage);
app.get('/discussion/:courseId', getDiscussionsByCourse);

// Certificate endpoints
app.post('/api/generate-certificate', authMiddleware, generateCertificate);
app.get('/api/certificate/:id', getCertificateById);
app.get('/api/certificates', authMiddleware, getMyCertificates);
app.post('/generate-certificate', authMiddleware, generateCertificate);
app.get('/certificate/:id', getCertificateById);
app.get('/certificates', authMiddleware, getMyCertificates);

// LMS Student routes
app.get('/api/batches', authMiddleware, getBatches);
app.post('/api/doubts', authMiddleware, askDoubt);
app.get('/api/doubts', authMiddleware, getStudentDoubts);
app.post('/api/results', authMiddleware, submitQuizResult);
app.get('/api/results', authMiddleware, getQuizResults);
app.post('/api/payments/checkout', authMiddleware, checkout);

// Admin protected routes
app.get('/api/admin/stats', authMiddleware, adminMiddleware, getStats);
app.get('/api/admin/students', authMiddleware, adminMiddleware, getStudentsList);
app.get('/api/admin/inquiries', authMiddleware, adminMiddleware, getInquiriesList);
app.post('/api/courses', authMiddleware, adminMiddleware, createCourse);
app.put('/api/courses/:id', authMiddleware, adminMiddleware, updateCourse);
app.delete('/api/courses/:id', authMiddleware, adminMiddleware, deleteCourse);

// LMS Admin routes
app.post('/api/admin/batches', authMiddleware, adminMiddleware, createBatch);
app.post('/api/admin/batches/enroll', authMiddleware, adminMiddleware, enrollInBatch);
app.get('/api/admin/doubts', authMiddleware, adminMiddleware, getAllDoubts);
app.put('/api/admin/doubts/:id', authMiddleware, adminMiddleware, resolveDoubt);
app.get('/api/admin/transactions', authMiddleware, adminMiddleware, getTransactions);

// Error Handler Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server!' });
});

// Connect to DB then start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
