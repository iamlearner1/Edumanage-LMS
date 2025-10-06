const mongoose = require('mongoose');

const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    order: { type: Number, required: true },
    contentType: { type: String, enum: ['video', 'document', 'link'], required: true },
    contentUrl: { type: String, required: true },
    duration: { type: Number, default: 0 }, // minutes
    isPublished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lecture', lectureSchema);
