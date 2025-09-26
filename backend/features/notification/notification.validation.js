const { body, param } = require('express-validator');

exports.createNotificationValidation = [
  body('recipient').isMongoId().withMessage('Valid recipient ID is required'),
  body('title')
    .isString().withMessage('Title must be a string')
    .isLength({ min: 1, max: 100 }).withMessage('Title must be 1-100 chars'),
  body('message')
    .isString().withMessage('Message must be a string')
    .isLength({ min: 1, max: 500 }).withMessage('Message must be 1-500 chars'),
  body('type')
    .isIn([
      'assignment', 'assignment_due', 'grade', 'enrollment', 'payment',
      'system', 'reminder', 'announcement', 'doc_verified', 'doc_rejected',
      'course_approved', 'course_rejected', 'user_approved'
    ])
    .withMessage('Invalid notification type')
];

exports.notificationIdValidation = [
  param('id').isMongoId().withMessage('Valid notification ID is required')
];
