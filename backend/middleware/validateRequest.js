const { validationResult } = require('express-validator');

/**
 * Middleware to validate express-validator results
 * @param {Request} req 
 * @param {Response} res 
 * @param {NextFunction} next 
 */
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation errors',
      errors: errors.array(),
    });
  }
  next();
};

module.exports = validateRequest;
