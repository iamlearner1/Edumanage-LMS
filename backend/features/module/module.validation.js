const { body, query } = require('express-validator');

exports.getModulesValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('course').optional().trim().isMongoId().withMessage('Course must be a valid Mongo ID'),
  query('isPublished').optional().isBoolean().withMessage('isPublished must be true or false')
];

exports.createModuleValidator = [
  body('course').notEmpty().withMessage('Course ID is required')
    .isMongoId().withMessage('Course must be a valid Mongo ID'),
  body('title').trim().notEmpty().withMessage('Module title is required'),
  body('description').optional().trim(),
  body('order').optional().isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be true or false')
];

exports.updateModuleValidator = [
  body('title').optional().trim().notEmpty().withMessage('Module title cannot be empty'),
  body('description').optional().trim(),
  body('order').optional().isInt({ min: 1 }).withMessage('Order must be a positive integer'),
  body('isPublished').optional().isBoolean().withMessage('isPublished must be true or false')
];

exports.togglePublishValidator = [
  body('isPublished').notEmpty().withMessage('Publish status is required')
    .isBoolean().withMessage('isPublished must be true or false')
];
