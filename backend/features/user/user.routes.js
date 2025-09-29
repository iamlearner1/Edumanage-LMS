const express = require('express');
const { auth, authorize } = require('../../middleware/authMiddleware');

const {
  getAllUsers,
  getPendingApprovalUsers,
  approveUser,
  deactivateUser,
  getUserProfileById,
  verifyInstructorDocument,
  getPendingVerificationInstructors,
  resetInstructorDocuments
} = require('./user.controller');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', auth, authorize('admin'), getAllUsers);

// @route   PUT /api/users/:id/approve
// @desc    Approve user account
// @access  Private (Admin)
router.put('/:id/approve', auth, authorize('admin'), approveUser);

// @route   PUT /api/users/:id/deactivate
// @desc    Deactivate user account
// @access  Private (Admin)
router.put('/:id/deactivate', auth, authorize('admin'), deactivateUser);

// @route   GET /api/users/pending-approval
// @desc    Get users pending approval
// @access  Private (Admin)
router.get('/pending-approval', auth, authorize('admin'), getPendingApprovalUsers);

// @route   GET /api/users/:id/profile
// @desc    Get detailed user profile for admin review
// @access  Private (Admin only)
router.get('/:id/profile', auth, authorize('admin'), getUserProfileById);

// @route   PUT /api/users/:id/verify-document
// @desc    Verify or reject instructor document
// @access  Private (Admin only)
router.put('/:id/verify-document/:documentId', auth, authorize('admin'), verifyInstructorDocument);

// @route   GET /api/users/pending-verification
// @desc    Get instructors pending document verification
// @access  Private (Admin only)
router.get('/pending-verification', auth, authorize('admin'), getPendingVerificationInstructors);

// @route   PUT /api/users/reset-documents
// @desc    Reset document verification status for reupload
// @access  Private (Instructor only)
router.put('/reset-documents', auth, authorize('instructor'), resetInstructorDocuments);

module.exports = router;
