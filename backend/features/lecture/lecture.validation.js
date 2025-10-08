const { body, query } = require('express-validator');

exports.getLecturesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('moduleId').optional().isMongoId().withMessage('Module ID must be valid'),
  query('isPublished').optional().isBoolean().withMessage('isPublished must be true or false')
];

exports.createLectureValidator = [
  body('title').trim().notEmpty().withMessage('Lecture title is required'),
  body('description').optional().trim(),
  body('moduleId').notEmpty().withMessage('Module ID is required').isMongoId().withMessage('Module ID must be valid'),
  body('order').isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('resources').isArray({ min: 1 }).withMessage('Resources must be a non-empty array'),
  body('resources.*.type').isIn(['video', 'document', 'link']).withMessage('Invalid resource type'),
  body('resources.*.url').notEmpty().withMessage('Resource URL is required'),
  body('resources.*.duration').optional().isInt({ min: 0 }).withMessage('Duration must be a non-negative integer'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be true or false')
];

exports.updateLectureValidator = [
  body('title').optional().trim().notEmpty().withMessage('Lecture title cannot be empty'),
  body('description').optional().trim(),
  body('order').optional().isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('resources').optional().isArray().withMessage('Resources must be an array'),
  body('resources.*.type').optional().isIn(['video', 'document', 'link']).withMessage('Invalid resource type'),
  body('resources.*.url').optional().notEmpty().withMessage('Resource URL cannot be empty'),
  body('resources.*.duration').optional().isInt({ min: 0 }).withMessage('Duration must be a non-negative integer'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be true or false')
];

exports.togglePublishValidator = [
  body('isPublished').notEmpty().withMessage('Publish status is required')
    .isBoolean().withMessage('isPublished must be true or false')
];
