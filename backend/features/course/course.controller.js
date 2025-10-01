const courseService = require('./course.service');

exports.getCourses = async (req, res) => {
  try {
    const result = await courseService.getCourses(req.query);
    res.json(result);
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error while fetching courses' });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const course = await courseService.getCourseById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error while fetching course' });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const result = await courseService.createCourse(req.user, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(400).json({ message: error.message });
  }
};

exports.getInstructorCourses = async (req, res) => {
  try {
    const courses = await courseService.getInstructorCourses(req.user._id);
    res.json(courses);
  } catch (error) {
    console.error('Get instructor courses error:', error);
    res.status(500).json({ message: 'Server error while fetching instructor courses' });
  }
};

exports.approveCourse = async (req, res) => {
  try {
    const course = await courseService.approveCourse(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course approved successfully', course });
  } catch (error) {
    console.error('Approve course error:', error);
    res.status(500).json({ message: 'Server error while approving course' });
  }
};

exports.getPendingCourses = async (req, res) => {
  try {
    const courses = await courseService.getPendingCourses();
    res.json(courses);
  } catch (error) {
    console.error('Get pending courses error:', error);
    res.status(500).json({ message: 'Server error while fetching pending courses' });
  }
};

exports.getCoursePerformance = async (req, res) => {
  try {
    const performance = await courseService.getCoursePerformance(req.user, req.params.id);
    res.json(performance);
  } catch (error) {
    console.error('Get course performance error:', error);
    res.status(500).json({ message: error.message || 'Server error while fetching course performance' });
  }
};
