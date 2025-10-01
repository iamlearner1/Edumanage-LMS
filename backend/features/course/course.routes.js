const express = require('express');
const router = express.Router();

const { auth, authorize, checkApproval } = require('../../middleware/authMiddleware');
const courseController = require('./course.controller');
const courseValidator = require('./course.validation');

// ------------------- Public -------------------
router.get('/', courseValidator.getCoursesValidator, courseController.getCourses);
router.get('/:id', courseController.getCourseById);

// ------------------- Instructor Only -------------------
router.post(
  '/',
  auth,
  authorize('instructor'),
  checkApproval,
  courseValidator.createCourseValidator,
  courseController.createCourse
);

// Instructor's own courses (based on logged-in user)
router.get(
  '/instructor/my-courses',
  auth,
  authorize('instructor'),
  courseController.getInstructorCourses
);

// ------------------- Admin Only -------------------
router.put('/:id/approve', auth, authorize('admin'), courseController.approveCourse);
router.get('/pending/list', auth, authorize('admin'), courseController.getPendingCourses);

// ------------------- Performance -------------------
router.get(
  '/:id/performance',
  auth,
  authorize(['instructor', 'admin']),
  courseController.getCoursePerformance
);

module.exports = router;
