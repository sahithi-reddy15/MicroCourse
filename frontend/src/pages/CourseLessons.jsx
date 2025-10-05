import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const CourseLessons = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourseDetails()
  }, [courseId])

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}`)
      setCourse(response.data.course)
      setLessons(response.data.lessons)
    } catch (error) {
      toast.error('Failed to fetch course details')
      navigate('/creator/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) {
      return
    }

    try {
      await axios.delete(`/api/lessons/${lessonId}`)
      toast.success('Lesson deleted successfully!')
      fetchCourseDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete lesson')
    }
  }

  const regenerateTranscript = async (lessonId) => {
    try {
      await axios.post(`/api/lessons/${lessonId}/regenerate-transcript`)
      toast.success('Transcript regenerated successfully!')
      fetchCourseDetails()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to regenerate transcript')
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
          <Link to="/creator/dashboard" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Course Lessons</h1>
              <p className="text-gray-600">{course.title}</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={`/creator/courses/${courseId}/lessons`}
                className="btn-primary"
              >
                Add New Lesson
              </Link>
              <button
                onClick={() => navigate('/creator/dashboard')}
                className="btn-secondary"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Course Info */}
        <div className="card p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  course.status === 'published' ? 'bg-green-100 text-green-800' :
                  course.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  course.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {course.status}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{course.description}</p>
              
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <span>{course.category}</span>
                <span>•</span>
                <span className="capitalize">{course.difficulty}</span>
                <span>•</span>
                <span>{lessons.length} lessons</span>
                <span>•</span>
                <span>{course.enrollmentCount} students enrolled</span>
              </div>
            </div>
            
            {course.thumbnail && (
              <img
                src={`http://localhost:5000/${course.thumbnail}`}
                alt={course.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
          </div>
        </div>

        {/* Lessons List */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Lessons ({lessons.length})
          </h3>
          
          {lessons.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No lessons yet</h3>
              <p className="text-gray-600 mb-6">Start building your course by adding lessons.</p>
              <Link
                to={`/creator/courses/${courseId}/lessons`}
                className="btn-primary"
              >
                Add Your First Lesson
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {lessons
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((lesson, index) => (
                <div key={lesson._id} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mr-4">
                    {lesson.orderIndex}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-md font-medium text-gray-900 mb-1">
                      {lesson.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {lesson.description}
                    </p>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>{Math.floor(lesson.videoDuration / 60)} minutes</span>
                      <span>•</span>
                      <span>Order: {lesson.orderIndex}</span>
                      {lesson.isPublished && (
                        <>
                          <span>•</span>
                          <span className="text-green-600">Published</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {course.status === 'draft' && (
                      <>
                        <button
                          onClick={() => regenerateTranscript(lesson._id)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Regenerate Transcript
                        </button>
                        <button
                          onClick={() => deleteLesson(lesson._id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {lessons.length > 0 && course.status === 'draft' && (
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Ready to submit your course for review?
                </div>
                <button
                  onClick={() => {
                    // This would be the submit for review function
                    navigate('/creator/dashboard')
                  }}
                  className="btn-primary"
                >
                  Submit for Review
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CourseLessons
