const User = require('./User');
const Notification = require('../notification/Notification');
const { getDocumentTypeLabel } = require('../../utils/documentUtils');

exports.getAllUsers = async (page = 1, limit = 10, role) => {
  const skip = (page - 1) * limit;

  let filter = {};
  if (role && ['student', 'instructor', 'admin'].includes(role)) {
    filter.role = role;
  }

  const users = await User.find(filter)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filter);

  return {
    users,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  };
};

exports.approveUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isApproved: true },
    { new: true }
  ).select('-password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  // Create approval notification for the user
  await Notification.createNotification({
    recipient: user._id,
    title: 'Account Approved',
    message: `Your ${user.role} account has been approved by an administrator. You can now access all features.`,
    type: 'user_approved',
    targetUrl: '/dashboard',
    actionRequired: false
  });

  return user;
};

exports.deactivateUser = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  ).select('-password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

exports.getPendingApprovalUsers = async () => {
  const pendingUsers = await User.find({
    isApproved: false,
    role: { $ne: 'student' },
    isActive: true
  })
  .select('-password')
  .sort({ createdAt: -1 });

  return pendingUsers;
};

exports.getUserProfileById = async (userId) => {
  const user = await User.findById(userId).select('-password');

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

exports.verifyInstructorDocument = async (userId, documentId, verified, comments, adminId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const document = user.instructorProfile.documents.id(documentId);
  if (!document) {
    const error = new Error('Document not found');
    error.statusCode = 404;
    throw error;
  }

  document.verified = verified;
  document.verifiedBy = adminId;
  document.verifiedAt = new Date();
  document.comments = comments;

  await user.save();

  let userApproved = false;

  if (verified) {
    // Check if all documents are verified
    const allDocumentsVerified = user.instructorProfile.documents.every(doc => doc.verified);
    if (allDocumentsVerified && user.instructorProfile.documents.length > 0) {
      user.isApproved = true;
      user.instructorProfile.verificationStatus = 'approved';
      await user.save();

      // Notify instructor
      await Notification.createNotification({
        recipient: user._id,
        title: 'Documents Approved',
        message: 'Your instructor documents have been verified and your account is now approved. Welcome to the platform!',
        type: 'doc_verified',
        targetUrl: '/dashboard',
        actionRequired: false
      });

      userApproved = true;
    }
  } else {
    // Document rejected
    user.instructorProfile.verificationStatus = 'rejected';
    if (comments && !user.instructorProfile.verificationComments) {
      user.instructorProfile.verificationComments = comments;
    }
    await user.save();

    // Notify instructor of rejection
    await Notification.createNotification({
      recipient: user._id,
      title: 'Document Rejected',
      message: `Your document "${getDocumentTypeLabel(document.type)}" was rejected. ${comments || 'Please upload a new document.'} Visit the document upload page to resubmit.`,
      type: 'doc_rejected',
      targetId: user._id,
      targetUrl: '/upload-documents',
      actionRequired: true
    });
  }

  return { document, userApproved };
};

exports.getPendingVerificationInstructors = async () => {
  const pendingInstructors = await User.find({
    role: 'instructor',
    isActive: true,
    $or: [
      { isApproved: false },
      { 'instructorProfile.documents': { $elemMatch: { verified: false } } }
    ]
  })
  .select('-password')
  .sort({ createdAt: -1 });

  return pendingInstructors;
};

exports.resetInstructorDocuments = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  if (user.instructorProfile) {
    user.instructorProfile.documents = [];
    user.instructorProfile.documentsUploaded = false;
    user.instructorProfile.verificationStatus = 'pending';
    user.instructorProfile.verificationComments = '';
    user.isApproved = false;

    await user.save();
  }

  return user;
};