import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout Components
import Layout from './components/Layout/Layout';
import PublicLayout from './components/Layout/PublicLayout';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Dashboard Components
import StudentDashboard from './components/Dashboard/StudentDashboard';
import InstructorDashboard from './components/Dashboard/InstructorDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';

// --- IMPORT ALL NECESSARY COURSE COMPONENTS ---
import CourseList from './components/Courses/CourseList';
import CourseDetail from './components/Courses/CourseDetail';
import CreateCourse from './components/Courses/CreateCourse';
import EditCourse from './components/Courses/EditCourse';
import ManageCourseContent from './components/Courses/ManageCourseContent';
import LectureViewer from './components/Courses/LectureViewer'; // The new lecture page
import CoursePerformance from './components/Courses/CoursePerformance';

// Other Feature Components
import MyEnrollments from './components/Enrollments/MyEnrollments';
import AssignmentList from './components/Assignments/AssignmentList';
import AssignmentDetail from './components/Assignments/AssignmentDetail';
import CreateAssignment from './components/Assignments/CreateAssignment';
import AssignmentSubmissions from './components/Assignments/AssignmentSubmissions';
import AttendanceView from './components/Attendance/AttendanceView';
import GradeView from './components/Grades/GradeView';
import Messages from './components/Messages/Messages';
import Profile from './components/Profile/Profile';
import UserManagement from './components/Admin/UserManagement';
import DocumentUpload from './components/Auth/DocumentUpload';
import InstructorVerification from './components/Admin/InstructorVerification';
import HomePage from './components/Home/HomePage';

// Common Components
import LoadingSpinner from './components/Common/LoadingSpinner';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Helper component for routes that require authentication
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirect to dashboard if role is not allowed
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  // Helper component for public routes (like login/register) to redirect if already logged in
  const PublicRoute = ({ children }) => {
    if (!loading && user) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  };

  // Helper to render the correct dashboard based on user role
  const getDashboard = () => {
    switch (user?.role) {
      case 'student':
        return <StudentDashboard />;
      case 'instructor':
        return <InstructorDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        // If logged in but no role (should not happen), redirect to login
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<PublicRoute><PublicLayout><Login /></PublicLayout></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><PublicLayout><Register /></PublicLayout></PublicRoute>} />

          {/* === PROTECTED ROUTES (Require Login) === */}

          {/* Main Dashboard Route */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout>{getDashboard()}</Layout></ProtectedRoute>} />
          
          {/* Course Routes */}
          <Route path="/courses" element={<ProtectedRoute><Layout><CourseList /></Layout></ProtectedRoute>} />
          <Route path="/courses/:id" element={<ProtectedRoute><Layout><CourseDetail /></Layout></ProtectedRoute>} />
          
          {/* --- THIS IS THE NEWLY ADDED ROUTE FOR THE LECTURE VIEWER --- */}
          <Route path="/courses/:courseId/lectures/:lectureId" element={
            <ProtectedRoute>
              <Layout>
                <LectureViewer />
              </Layout>
            </ProtectedRoute>
          } />

          {/* Instructor/Admin Specific Course Routes */}
          <Route path="/create-course" element={<ProtectedRoute allowedRoles={['instructor']}><Layout><CreateCourse /></Layout></ProtectedRoute>} />
          <Route path="/courses/:id/edit" element={<ProtectedRoute allowedRoles={['instructor']}><Layout><EditCourse /></Layout></ProtectedRoute>} />
          <Route path="/courses/:id/manage-content" element={<ProtectedRoute allowedRoles={['instructor']}><Layout><ManageCourseContent /></Layout></ProtectedRoute>} />
          <Route path="/courses/:id/performance" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><Layout><CoursePerformance /></Layout></ProtectedRoute>} />

          {/* Student Specific Routes */}
          <Route path="/my-courses" element={<ProtectedRoute allowedRoles={['student']}><Layout><MyEnrollments /></Layout></ProtectedRoute>} />
          
          {/* Assignment Routes */}
          <Route path="/assignments" element={<ProtectedRoute><Layout><AssignmentList /></Layout></ProtectedRoute>} />
          <Route path="/assignments/:id" element={<ProtectedRoute><Layout><AssignmentDetail /></Layout></ProtectedRoute>} />
          <Route path="/create-assignment" element={<ProtectedRoute allowedRoles={['instructor']}><Layout><CreateAssignment /></Layout></ProtectedRoute>} />
          <Route path="/assignments/:id/submissions" element={<ProtectedRoute allowedRoles={['instructor', 'admin']}><Layout><AssignmentSubmissions /></Layout></ProtectedRoute>} />

          {/* Other Feature Routes */}
          <Route path="/attendance" element={<ProtectedRoute><Layout><AttendanceView /></Layout></ProtectedRoute>} />
          <Route path="/grades" element={<ProtectedRoute><Layout><GradeView /></Layout></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Layout><Messages /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/upload-documents" element={<ProtectedRoute allowedRoles={['instructor']}><DocumentUpload /></ProtectedRoute>} />

          {/* Admin Specific Routes */}
          <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><Layout><UserManagement /></Layout></ProtectedRoute>} />
          <Route path="/admin/instructor-verification" element={<ProtectedRoute allowedRoles={['admin']}><Layout><InstructorVerification /></Layout></ProtectedRoute>} />

          {/* Fallback/Catch-all Routes */}
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="*" element={<div className="min-h-screen flex items-center justify-center"><div className="text-center"><h1 className="text-4xl font-bold text-gray-900">404</h1><p className="text-gray-600 mt-2">Page Not Found</p></div></div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;