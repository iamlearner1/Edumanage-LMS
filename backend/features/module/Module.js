const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    order: { type: Number, required: true },
    isPublished: { type: Boolean, default: false }, // ✅ restored
  },
  { timestamps: true }
);

module.exports = mongoose.model('Module', moduleSchema);
