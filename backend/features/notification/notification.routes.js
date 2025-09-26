const express = require('express');
const { auth } = require('../../middleware/auth');
const { validationResult } = require('express-validator');
const NotificationController = require('./notification.controller');
const {
  createNotificationValidation,
  notificationIdValidation
} = require('./notification.validation');

const router = express.Router();

// Middleware to handle validation errors
const validate = (validations) => [
  ...validations,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth, NotificationController.getNotifications);

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put(
  '/:id/read',
  auth,
  validate(notificationIdValidation),
  NotificationController.markAsRead
);

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', auth, NotificationController.markAllAsRead);

module.exports = router;
