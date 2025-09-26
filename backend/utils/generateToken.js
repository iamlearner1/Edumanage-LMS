const jwt = require('jsonwebtoken');

/**
 * Generate JWT token for a user
 * @param {string} userId - MongoDB user _id
 * @param {string} [expiresIn] - Optional token expiration (default: 7d)
 * @returns {string} JWT token
 */
const generateToken = (userId, expiresIn = '7d') => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not defined in environment variables');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn
  });
};

module.exports = generateToken;
