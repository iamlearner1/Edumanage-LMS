const User = require('../user/User');
const Notification = require('../notification/Notification');
const generateToken = require('../../utils/generateToken');

exports.registerUser = async ({
  firstName,
  lastName,
  email,
  password,
  role,
  phone,
  dateOfBirth,
  instructorProfile,
}) => {
  // check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('User already exists with this email');
    error.statusCode = 400;
    throw error;
  }

  // prepare user data
  const userData = {
    firstName,
    lastName,
    email,
    password,
    role,
    phone,
    dateOfBirth,
  };

  if (role === 'instructor') {
    userData.instructorProfile = instructorProfile
      ? {
          qualification: instructorProfile.qualification,
          experience: instructorProfile.experience || 0,
          specialization: instructorProfile.specialization || [],
          bio: instructorProfile.bio,
          linkedIn: instructorProfile.linkedIn,
          portfolio: instructorProfile.portfolio,
          documents: [],
          documentsUploaded: false,
          verificationStatus: 'pending',
        }
      : {
          documents: [],
          documentsUploaded: false,
          verificationStatus: 'pending',
        };
  }

  // create user
  const user = new User(userData);
  await user.save();

  // notify admins if instructor
  if (role === 'instructor') {
    await Notification.notifyAdmins(
      'New Instructor Registration',
      `${firstName} ${lastName} (${email}) has registered as an instructor and requires document verification.`,
      'system',
      {
        targetId: user._id,
        targetUrl: `/admin/instructor-verification`,
        actionRequired: true,
      }
    );
  }

  // generate token
  const token = generateToken(user._id);

  const message =
    role === 'instructor'
      ? 'Registration successful! Please upload your documents for verification.'
      : 'Registration successful!';

  return {
    user,
    token,
    message,
    requiresApproval: role === 'instructor',
    needsDocuments: role === 'instructor',
  };
};

exports.loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 400;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error('Account is deactivated');
    error.statusCode = 400;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 400;
    throw error;
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);

  return {
    message: 'Login successful',
    token,
    user: user.getPublicProfile(),
  };
};

exports.getCurrentUser = async (user) => {
  // user is already attached to req by auth middleware
  return user.getPublicProfile();
};

exports.updateUserProfile = async (userId, updates) => {
  const allowedUpdates = ['firstName', 'lastName', 'phone', 'dateOfBirth', 'address'];
  const filteredUpdates = {};

  Object.keys(updates).forEach(key => {
    if (allowedUpdates.includes(key)) {
      filteredUpdates[key] = updates[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    userId,
    filteredUpdates,
    { new: true, runValidators: true }
  );

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return user;
};

exports.changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    const error = new Error('Current password is incorrect');
    error.statusCode = 400;
    throw error;
  }

  user.password = newPassword;
  await user.save();
};

exports.uploadDocuments = async (userId, files, documentTypesJSON) => {
  if (!files || files.length === 0) {
    const error = new Error('No documents uploaded');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user.instructorProfile) {
    user.instructorProfile = { documents: [] };
  }

  const documentTypes = JSON.parse(documentTypesJSON || '[]');
  const documents = files.map((file, index) => ({
    type: documentTypes[index] || 'other',
    originalName: file.originalname,
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size
  }));

  user.instructorProfile.documents.push(...documents);
  user.instructorProfile.documentsUploaded = true;
  user.instructorProfile.verificationStatus = 'under_review';
  await user.save();

  await Notification.notifyAdmins(
    'Instructor Documents Uploaded',
    `${user.firstName} ${user.lastName} has uploaded ${files.length} document(s) for verification.`,
    'system',
    {
      targetId: user._id,
      targetUrl: `/admin/instructor-verification`,
      actionRequired: true
    }
  );

  return {
    message: 'Documents uploaded successfully',
    documents: documents.length,
    status: 'under_review',
    verificationStatus: user.instructorProfile.verificationStatus,
    documentsUploaded: user.instructorProfile.documentsUploaded
  };
};