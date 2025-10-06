import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PlusIcon,
  BookOpenIcon,
  UserIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  CheckCircleIcon // For enrolled status
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';
import toast from 'react-hot-toast';

const CourseList = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [pagination, setPagination] = useState({});
  // State to store IDs of courses the student is enrolled in
  const [enrolledCourses, setEnrolledCourses] = useState(new Set());

  const categories = [
    'Computer Science', 'Mathematics', 'Physics', 'Chemistry', 
    'Biology', 'English', 'History', 'Arts', 'Business', 'Other'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  // Fetch student's enrollments only once on component mount if the user is a student
  useEffect(() => {
    const fetchEnrollments = async () => {
      if (user?.role === 'student') {
        try {
          const response = await axios.get(`/api/enrollments/student/${user._id}`);
          const enrolledIds = new Set(response.data.map(enrollment => enrollment.course._id));
          setEnrolledCourses(enrolledIds);
        } catch (error) {
          console.error("Failed to fetch student enrollments:", error);
        }
      }
    };
    fetchEnrollments();
  }, [user]);

  const fetchCourses = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '12'
      });
      
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('category', selectedCategory);
      if (selectedLevel) params.append('level', selectedLevel);
      
      const response = await axios.get(`/api/courses?${params}`);
      
      setCourses(response.data.courses || response.data);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedLevel]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleEnroll = async (courseId) => {
    try {
      const response = await axios.post('/api/enrollments', { courseId });
      toast.success('Successfully enrolled in course!');
      // Add the new course to the enrolled set for immediate UI update
      setEnrolledCourses(prev => new Set(prev).add(courseId));
      fetchCourses(); // Refresh to update enrollment count
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to enroll';
      toast.error(message);
    }
  };

  const handleApproveCourse = async (courseId) => {
    try {
      await axios.put(`/api/courses/${courseId}/approve`);
      toast.success('Course approved successfully!');
      fetchCourses();
    } catch (error) {
      toast.error('Failed to approve course');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedLevel('');
  };

  if (loading && courses.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="mt-2 text-gray-600">Discover and enroll in courses that match your interests</p>
        </div>
        
        {user?.role === 'instructor' && (
          <Link to="/create-course" className="mt-4 sm:mt-0 btn btn-primary flex items-center">
            <PlusIcon className="h-5 w-5 mr-2" /> Create Course
          </Link>
        )}
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search courses..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input pl-10" />
          </div>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="input">
            <option value="">All Categories</option>
            {categories.map((category) => (<option key={category} value={category}>{category}</option>))}
          </select>
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="input">
            <option value="">All Levels</option>
            {levels.map((level) => (<option key={level} value={level}>{level}</option>))}
          </select>
          <button onClick={clearFilters} className="btn btn-secondary flex items-center justify-center">
            <FunnelIcon className="h-5 w-5 mr-2" /> Clear Filters
          </button>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = enrolledCourses.has(course._id);
            return (
              <div key={course._id} className="card hover:shadow-md transition-shadow duration-200 flex flex-col">
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mb-4 flex items-center justify-center">
                  <BookOpenIcon className="h-16 w-16 text-white" />
                </div>
                <div className="space-y-3 flex-grow">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{course.courseCode}</p>
                    {!course.isApproved && (<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">Pending Approval</span>)}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3">{course.description}</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center"><UserIcon className="h-4 w-4 mr-2" />{course.instructor?.firstName} {course.instructor?.lastName}</div>
                    <div className="flex items-center"><CalendarIcon className="h-4 w-4 mr-2" />{course.credits} credits • {course.level}</div>
                    <div className="flex items-center"><CurrencyDollarIcon className="h-4 w-4 mr-2" />${course.fees}</div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{course.currentEnrollment}/{course.maxStudents} enrolled</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${course.level === 'Beginner' ? 'bg-green-100 text-green-800' : course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{course.level}</span>
                  </div>
                </div>
                <div className="flex space-x-2 pt-4 mt-auto">
                  <Link to={`/courses/${course._id}`} className="flex-1 btn btn-secondary text-center flex items-center justify-center">View Details</Link>
                  {user?.role === 'student' && course.isApproved && (
                    isEnrolled ? (
                      <button disabled className="flex-1 btn btn-success disabled:opacity-100 disabled:cursor-default flex items-center justify-center">
                        <CheckCircleIcon className="h-5 w-5 mr-2"/> Enrolled
                      </button>
                    ) : (
                      <button onClick={() => handleEnroll(course._id)} disabled={course.currentEnrollment >= course.maxStudents} className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                        {course.currentEnrollment >= course.maxStudents ? 'Full' : 'Enroll'}
                      </button>
                    )
                  )}
                  {user?.role === 'student' && !course.isApproved && (<button disabled className="flex-1 btn btn-secondary opacity-50 cursor-not-allowed">Pending Approval</button>)}
                  {user?.role === 'admin' && !course.isApproved && (<button onClick={() => handleApproveCourse(course._id)} className="flex-1 btn btn-primary">Approve Course</button>)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2">
          {pagination.hasPrev && (<button onClick={() => fetchCourses(pagination.current - 1)} className="btn btn-secondary">Previous</button>)}
          <span className="flex items-center px-4 py-2 text-sm text-gray-600">Page {pagination.current} of {pagination.pages}</span>
          {pagination.hasNext && (<button onClick={() => fetchCourses(pagination.current + 1)} className="btn btn-secondary">Next</button>)}
        </div>
      )}
    </div>
  );
};

export default CourseList;