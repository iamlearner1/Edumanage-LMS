const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [500, 'Message cannot exceed 500 characters']
  },
  type: {
    type: String,
    enum: [
      'assignment', 'assignment_due', 'grade', 'enrollment', 'payment',
      'system', 'reminder', 'announcement', 'doc_verified', 'doc_rejected',
      'course_approved', 'course_rejected', 'user_approved'
    ],
    required: [true, 'Type is required']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: false
  },
  targetUrl: {
    type: String,
    required: false,
    maxlength: [200, 'Target URL cannot exceed 200 characters']
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

notificationSchema.index({ recipient: 1 });
notificationSchema.index({ isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
