const authService = require('./auth.service');
const { validationResult } = require('express-validator');
const validateRequest = require('../../middleware/validateRequest');

exports.register = async (req, res, next) => {
  try {
    const { user, token, message, requiresApproval, needsDocuments } =
      await authService.registerUser(req.body);

    res.status(201).json({
      message,
      token,
      user: user.getPublicProfile(),
      requiresApproval,
      needsDocuments,
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getCurrentUser = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user);
    res.json({ user });
  } catch (err) {
    next(err); // handled by global error handler
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = req.body;
    const updatedUser = await authService.updateUserProfile(req.user._id, updates);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser.getPublicProfile()
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await authService.changeUserPassword(req.user._id, currentPassword, newPassword);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    // Logout is client-side token removal
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};


exports.uploadInstructorDocuments = (req, res, next) => {
  uploadDocuments(req, res, async (err) => {
    if (err) return res.status(400).json({ message: err.message });

    try {
      const { documentTypes } = req.body;
      const files = req.files;

      const result = await authService.uploadDocuments(req.user._id, files, documentTypes);
      res.json(result);
    } catch (err) {
      next(err);
    }
  });
};