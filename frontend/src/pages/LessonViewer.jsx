import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const LessonViewer = () => {
  const { lessonId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [lesson, setLesson] = useState(null)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isCompleted, setIsCompleted] = useState(false)
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    fetchLessonDetails()
  }, [lessonId])

  const fetchLessonDetails = async () => {
    try {
      const response = await axios.get(`/api/lessons/${lessonId}`)
      setLesson(response.data.lesson)
      setCourse(response.data.lesson.course)
    } catch (error) {
      toast.error('Failed to fetch lesson details')
      navigate('/courses')
    } finally {
      setLoading(false)
    }
  }

  const markAsComplete = async () => {
    if (!user) {
      toast.error('Please login to track progress')
      return
    }

    try {
      await axios.patch(`/api/progress/${lessonId}/complete`, {
        timeSpent,
        lastPosition: 0
      })
      setIsCompleted(true)
      toast.success('Lesson marked as complete!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark lesson as complete')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Lesson not found</h1>
          <Link to="/courses" className="btn-primary">
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to={`/courses/${course._id}`} className="text-primary-600 hover:text-primary-700 mb-2 inline-block">
            ← Back to Course
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          <p className="text-gray-600">{course.title}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="aspect-video bg-black rounded-lg mb-6 flex items-center justify-center">
                {lesson.videoUrl ? (
                  <video
                    controls
                    className="w-full h-full rounded-lg"
                    onTimeUpdate={(e) => setTimeSpent(e.target.currentTime)}
                  >
                    <source src={`http://localhost:5000/${lesson.videoUrl}`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <div className="text-white text-center">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    <p>Video not available</p>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Duration: {Math.floor(lesson.videoDuration / 60)} minutes
                </div>
                
                {user && user.role === 'learner' && (
                  <button
                    onClick={markAsComplete}
                    disabled={isCompleted}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      isCompleted
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {isCompleted ? 'Completed ✓' : 'Mark as Complete'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Lesson Description
              </h3>
              <p className="text-gray-600 mb-6">
                {lesson.description}
              </p>
              
              <h4 className="text-md font-semibold text-gray-900 mb-3">
                Transcript
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                {lesson.transcript ? (
                  <div>
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-green-600 font-medium">
                        Auto-generated transcript
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {lesson.transcript}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Transcript not available
                  </p>
                )}
              </div>
              
              {lesson.resources && lesson.resources.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Resources
                  </h4>
                  <div className="space-y-2">
                    {lesson.resources.map((resource, index) => (
                      <a
                        key={index}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-primary-600 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                          </svg>
                          <span className="text-sm font-medium text-gray-900">
                            {resource.title}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonViewer
