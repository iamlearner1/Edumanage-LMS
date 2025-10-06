const express = require('express');
const router = express.Router();

const { auth, authorize } = require('../../middleware/authMiddleware');
const lectureController = require('./lecture.controller');
const lectureValidator = require('./lecture.validation');

// Get all lectures
router.get(
  '/',
  auth,
  lectureValidator.getLecturesValidator,
  lectureController.getLectures
);

// Get lecture by ID
router.get(
  '/:id',
  auth,
  lectureController.getLectureById
);

// Create lecture (only instructors or admins)
router.post(
  '/',
  auth,
  authorize('instructor', 'admin'),
  lectureValidator.createLectureValidator,
  lectureController.createLecture
);

// Update lecture (POST style update as per your standards)
router.post(
  '/:id',
  auth,
  authorize('instructor', 'admin'),
  lectureValidator.updateLectureValidator,
  lectureController.updateLecture
);

// Delete lecture (POST style delete as per your standards)
router.post(
  '/:id/delete',
  auth,
  authorize('instructor', 'admin'),
  lectureController.deleteLecture
);

// Toggle publish status
router.post(
  '/:id/publish',
  auth,
  authorize('instructor', 'admin'),
  lectureValidator.togglePublishValidator,
  lectureController.togglePublishStatus
);

module.exports = router;
