import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import LessonViewer from './pages/LessonViewer'
import Progress from './pages/Progress'
import CreatorApply from './pages/CreatorApply'
import CreatorDashboard from './pages/CreatorDashboard'
import CreateCourse from './pages/CreateCourse'
import EditCourse from './pages/EditCourse'
import AddLesson from './pages/AddLesson'
import CourseLessons from './pages/CourseLessons'
import CoursePlayer from './pages/CoursePlayer'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/courses/:id/learn" element={<CoursePlayer />} />
            <Route path="/learn/:lessonId" element={<LessonViewer />} />
            
            {/* Protected routes */}
            <Route path="/progress" element={
              <ProtectedRoute>
                <Progress />
              </ProtectedRoute>
            } />
            
            <Route path="/creator/apply" element={
              <ProtectedRoute allowedRoles={['learner']}>
                <CreatorApply />
              </ProtectedRoute>
            } />
            
            <Route path="/creator/dashboard" element={
              <ProtectedRoute allowedRoles={['creator']}>
                <CreatorDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/creator/courses/new" element={
              <ProtectedRoute allowedRoles={['creator']}>
                <CreateCourse />
              </ProtectedRoute>
            } />
            
            <Route path="/creator/courses/:courseId/lessons" element={
              <ProtectedRoute allowedRoles={['creator']}>
                <AddLesson />
              </ProtectedRoute>
            } />
            
            <Route path="/creator/courses/:courseId/edit" element={
              <ProtectedRoute allowedRoles={['creator']}>
                <EditCourse />
              </ProtectedRoute>
            } />
            
            <Route path="/creator/courses/:courseId/manage" element={
              <ProtectedRoute allowedRoles={['creator']}>
                <CourseLessons />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/*" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

export default App
