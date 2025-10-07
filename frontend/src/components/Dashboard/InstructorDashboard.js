import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { 
  BookOpenIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ClipboardDocumentCheckIcon,
  PlusIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../Common/LoadingSpinner';
import { formatDate } from '../../utils/dateUtils';
import toast from 'react-hot-toast';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [coursePerformance, setCoursePerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchAllData = async () => {
      setLoading(true);
      try {
        const dashboardPromise = axios.get('/api/analytics/dashboard');
        // FIX: Use the correct backend route to get the instructor's courses
        const coursesPromise = axios.get('/api/courses/instructor/my-courses');
        const [dashboardResponse, coursesResponse] = await Promise.all([dashboardPromise, coursesPromise]);
        setDashboardData(dashboardResponse.data);
        const courses = coursesResponse.data;
        if (courses.length > 0) {
            const performancePromises = courses.map(async (course) => {
                try {
                    const perfResponse = await axios.get(`/api/courses/${course._id}/performance`);
                    return { ...perfResponse.data, courseTitle: course.title, courseId: course._id, totalStudents: course.currentEnrollment };
                } catch (error) {
                    console.error(`Error fetching performance for course ${course.title}:`, error);
                    return { courseId: course._id, courseTitle: course.title, completionRate: 0, submissionRate: 0, averageGrade: 0, averageSatisfaction: 0, totalStudents: course.currentEnrollment };
                }
            });
            const performanceData = await Promise.all(performancePromises);
            setCoursePerformance(performanceData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [user]);

  if (loading) { return <LoadingSpinner />; }

  const stats = [
    { name: 'My Courses', value: dashboardData?.totalCourses || 0, icon: BookOpenIcon, href: '/courses' },
    { name: 'Total Students', value: dashboardData?.totalStudents || 0, icon: UserGroupIcon },
    { name: 'Assignments', value: dashboardData?.totalAssignments || 0, icon: DocumentTextIcon, href: '/assignments' },
    { name: 'Pending Grading', value: dashboardData?.totalPendingGrading || 0, icon: ClipboardDocumentCheckIcon }
  ];

  return (
    <div className="space-y-6">
      {!user?.isApproved && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex"><ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" /><div className="ml-3"><p className="text-sm text-yellow-700"><strong>Account Pending Approval:</strong> Please upload your verification documents to complete your account setup.<Link to="/upload-documents" className="font-medium underline ml-2">Upload Documents</Link></p></div></div>
        </div>
      )}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-lg p-6 text-white"><h1 className="text-2xl font-bold">Welcome back, Professor {user?.lastName}!</h1><p className="mt-2 text-green-100">Manage your courses, track student progress, and create engaging content.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/create-course" className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"><PlusIcon className="h-8 w-8 text-blue-600" /><span className="ml-3 font-medium text-gray-900">Create New Course</span></Link>
        <Link to="/create-assignment" className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"><PlusIcon className="h-8 w-8 text-green-600" /><span className="ml-3 font-medium text-gray-900">Create Assignment</span></Link>
        <Link to="/attendance" className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"><ClipboardDocumentCheckIcon className="h-8 w-8 text-purple-600" /><span className="ml-3 font-medium text-gray-900">Mark Attendance</span></Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (<div key={stat.name} className="card"><div className="flex items-center"><div className="bg-gray-100 rounded-lg p-3"><stat.icon className="h-6 w-6 text-gray-600" /></div><div className="ml-4"><p className="text-sm font-medium text-gray-600">{stat.name}</p><p className="text-2xl font-semibold text-gray-900">{stat.value}</p></div></div></div>))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Enrollments</h2>
          {dashboardData?.recentEnrollments?.length > 0 ? (dashboardData.recentEnrollments.map((enrollment) => (<div key={enrollment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2"><div><p className="font-medium text-gray-900">{enrollment.student?.firstName} {enrollment.student?.lastName}</p><p className="text-sm text-gray-600">{enrollment.course?.title}</p></div><p className="text-sm text-gray-500">{formatDate(enrollment.enrollmentDate)}</p></div>))) : (<p className="text-sm text-center text-gray-500 py-4">No recent enrollments.</p>)}
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-gray-900">Course Performance</h2></div>
          {coursePerformance.length === 0 ? (<div className="text-center text-gray-500 py-4"><p>No course performance data available</p><p className="text-sm">Create courses and assignments to see performance metrics</p></div>) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">Overall Performance</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Avg Completion Rate</span><span className="font-semibold">{Math.round(coursePerformance.reduce((s, c) => s + c.completionRate, 0) / coursePerformance.length)}%</span></div></div>
                  <div><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Avg Submission Rate</span><span className="font-semibold">{Math.round(coursePerformance.reduce((s, c) => s + c.submissionRate, 0) / coursePerformance.length)}%</span></div></div>
                  <div><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Avg Grade</span><span className="font-semibold">{Math.round(coursePerformance.reduce((s, c) => s + c.averageGrade, 0) / coursePerformance.length)}%</span></div></div>
                  <div><div className="flex items-center justify-between"><span className="text-sm text-gray-600">Student Satisfaction</span><span className="font-semibold">{(coursePerformance.reduce((s, c) => s + c.averageSatisfaction, 0) / coursePerformance.length).toFixed(1)}/5</span></div></div>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Course Breakdown</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {coursePerformance.slice(0, 5).map((course) => (<div key={course.courseId} className="bg-white border border-gray-200 rounded-lg p-3"><div className="flex items-center justify-between mb-2"><h4 className="font-medium text-gray-900 text-sm truncate">{course.courseTitle}</h4><div className="flex items-center space-x-2"><span className="text-xs text-gray-500">{course.totalStudents} students</span><Link to={`/courses/${course.courseId}/performance`} className="text-xs text-blue-600 hover:text-blue-500">Details</Link></div></div><div className="grid grid-cols-2 gap-2 text-xs"><div className="flex justify-between"><span className="text-gray-600">Completion:</span><span className="font-medium">{course.completionRate}%</span></div><div className="flex justify-between"><span className="text-gray-600">Avg Grade:</span><span className="font-medium">{course.averageGrade}%</span></div></div></div>))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;