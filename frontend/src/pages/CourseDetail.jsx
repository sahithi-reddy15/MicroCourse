import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const CourseDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [enrollmentStatus, setEnrollmentStatus] = useState(null)

  useEffect(() => {
    fetchCourseDetails()
    if (user) {
      checkEnrollmentStatus()
    }
  }, [id, user])

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`/api/courses/${id}`)
      setCourse(response.data.course)
      setLessons(response.data.lessons)
    } catch (error) {
      toast.error('Failed to fetch course details')
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollmentStatus = async () => {
    try {
      const response = await axios.get(`/api/enroll/${id}/status`)
      setEnrollmentStatus(response.data)
    } catch (error) {
      console.error('Failed to check enrollment status')
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll in courses')
      return
    }

    try {
      await axios.post(`/api/enroll/${id}`)
      toast.success('Successfully enrolled in course!')
      checkEnrollmentStatus()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to enroll')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h1>
          <Link to="/courses" className="btn-primary">
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card p-8">
              {course.thumbnail && (
                <img
                  src={`http://localhost:5000/${course.thumbnail}`}
                  alt={course.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
              )}
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-primary-600 font-medium">
                  {course.category}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  course.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                  course.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.difficulty}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              
              <p className="text-gray-600 mb-6 text-lg">
                {course.description}
              </p>
              
              <div className="flex items-center text-sm text-gray-500 mb-6">
                <span>Created by {course.creator?.name}</span>
                <span className="mx-2">•</span>
                <span>{course.enrollmentCount} students enrolled</span>
              </div>
              
              {user && user.role === 'learner' && (
                <div className="mb-8">
                  {enrollmentStatus?.isEnrolled ? (
                    <Link
                      to={`/courses/${course._id}/learn`}
                      className="btn-primary"
                    >
                      Start Learning
                    </Link>
                  ) : (
                    <button
                      onClick={handleEnroll}
                      className="btn-primary"
                    >
                      Enroll in Course
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Course Lessons ({lessons.length})
              </h3>
              
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div key={lesson._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="ml-3 flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {lesson.title}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {Math.floor(lesson.videoDuration / 60)} min
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {lessons.length === 0 && (
                <p className="text-gray-500 text-sm">
                  No lessons available yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseDetail
