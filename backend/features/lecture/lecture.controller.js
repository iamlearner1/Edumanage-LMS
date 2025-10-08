const lectureService = require('./lecture.service');

exports.getLectures = async (req, res) => {
  try {
    const result = await lectureService.getLectures(req.query);
    res.json(result);
  } catch (error) {
    console.error('Get lectures error:', error);
    res.status(500).json({ message: 'Server error while fetching lectures' });
  }
};

exports.getLectureById = async (req, res) => {
  try {
    const lecture = await lectureService.getLectureById(req.params.id);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
    res.json(lecture);
  } catch (error) {
    console.error('Get lecture error:', error);
    res.status(500).json({ message: 'Server error while fetching lecture' });
  }
};

exports.createLecture = async (req, res) => {
  try {
    const result = await lectureService.createLecture(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create lecture error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateLecture = async (req, res) => {
  try {
    const lecture = await lectureService.updateLecture(req.params.id, req.body);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
    res.json(lecture);
  } catch (error) {
    console.error('Update lecture error:', error);
    res.status(500).json({ message: 'Server error while updating lecture' });
  }
};

exports.deleteLecture = async (req, res) => {
  try {
    const lecture = await lectureService.deleteLecture(req.params.id);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    console.error('Delete lecture error:', error);
    res.status(500).json({ message: 'Server error while deleting lecture' });
  }
};

exports.togglePublishStatus = async (req, res) => {
  try {
    const lecture = await lectureService.togglePublishStatus(req.params.id, req.body.isPublished);
    if (!lecture) return res.status(404).json({ message: 'Lecture not found' });
    res.json({ message: 'Publish status updated successfully', lecture });
  } catch (error) {
    console.error('Toggle publish status error:', error);
    res.status(500).json({ message: 'Server error while updating publish status' });
  }
};
