const Lecture = require('./Lecture');

exports.getLectures = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  let filter = {};
  if (query.moduleId) filter.moduleId = query.moduleId;
  if (query.isPublished !== undefined) filter.isPublished = query.isPublished;

  const lectures = await Lecture.find(filter)
    .sort({ order: 1 })
    .skip(skip)
    .limit(limit);

  const total = await Lecture.countDocuments(filter);

  return {
    page,
    limit,
    total,
    lectures
  };
};

exports.getLectureById = async (id) => {
  return Lecture.findById(id).populate('moduleId');
};

exports.createLecture = async (data) => {
  const lecture = new Lecture(data);
  return lecture.save();
};

exports.updateLecture = async (id, data) => {
  return Lecture.findByIdAndUpdate(id, { $set: data }, { new: true });
};

exports.deleteLecture = async (id) => {
  return Lecture.findByIdAndDelete(id);
};

exports.togglePublishStatus = async (id, isPublished) => {
  return Lecture.findByIdAndUpdate(id, { isPublished }, { new: true });
};
