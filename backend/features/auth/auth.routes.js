const express = require('express');
const { register, login, changePassword, getCurrentUser, updateProfile, uploadInstructorDocuments, logout } = require('./auth.controller');

const { auth, authorize } = require('../../middleware/authMiddleware');
const { registerValidator, loginValidator, updateProfileValidator, changePasswordValidator } = require('./auth.validations');
const validateRequest = require('../../middleware/validateRequest');
// const { uploadDocuments } = require('../../middleware/upload');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidator, validateRequest, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidator, validateRequest, login);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, getCurrentUser);

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, updateProfileValidator, validateRequest, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', auth, changePasswordValidator, validateRequest, changePassword);

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', auth, logout);

// @route   POST /api/auth/upload-documents
// @desc    Upload instructor documents
// @access  Private (Instructor only)
router.post('/upload-documents', auth, authorize('instructor'), uploadInstructorDocuments);

module.exports = router;
