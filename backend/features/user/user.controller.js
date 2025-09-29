const usersService = require('./user.service');

exports.getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;

    const result = await usersService.getAllUsers(page, limit, role);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.approveUser = async (req, res, next) => {
  try {
    const user = await usersService.approveUser(req.params.id);
    res.json({
      message: 'User approved successfully',
      user
    });
  } catch (err) {
    next(err);
  }
};

exports.deactivateUser = async (req, res, next) => {
  try {
    const user = await usersService.deactivateUser(req.params.id);
    res.json({
      message: 'User deactivated successfully',
      user
    });
  } catch (err) {
    next(err);
  }
};

exports.getPendingApprovalUsers = async (req, res, next) => {
  try {
    const users = await usersService.getPendingApprovalUsers();
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.getUserProfileById = async (req, res, next) => {
  try {
    const user = await usersService.getUserProfileById(req.params.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.verifyInstructorDocument = async (req, res, next) => {
  try {
    const { verified, comments } = req.body;
    const { id: userId, documentId } = req.params;

    const result = await usersService.verifyInstructorDocument(
      userId,
      documentId,
      verified,
      comments,
      req.user._id
    );

    res.json({
      message: `Document ${verified ? 'verified' : 'rejected'} successfully`,
      document: result.document,
      userApproved: result.userApproved
    });
  } catch (err) {
    next(err);
  }
};

exports.getPendingVerificationInstructors = async (req, res, next) => {
  try {
    const instructors = await usersService.getPendingVerificationInstructors();
    res.json(instructors);
  } catch (err) {
    next(err);
  }
};


exports.resetInstructorDocuments = async (req, res, next) => {
  try {
    const user = await usersService.resetInstructorDocuments(req.user._id);
    res.json({
      message: 'Document status reset successfully. You can now upload new documents.',
      user: user.getPublicProfile()
    });
  } catch (err) {
    next(err);
  }
};