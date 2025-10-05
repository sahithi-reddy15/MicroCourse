import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LessonNavigation from '../components/LessonNavigation'
import QuickLessonSelector from '../components/QuickLessonSelector'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const CoursePlayer = () => {
  const { id: courseId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [currentLesson, setCurrentLesson] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (courseId && courseId !== 'undefined') {
      fetchCourseData()
    } else {
      setLoading(false)
    }
  }, [courseId])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      
      // Validate course ID
      if (!courseId || courseId === 'undefined') {
        throw new Error('Invalid course ID')
      }
      
      // Fetch course details
      const courseResponse = await axios.get(`/api/courses/${courseId}`)
      setCourse(courseResponse.data.course)
      setLessons(courseResponse.data.lessons.sort((a, b) => a.orderIndex - b.orderIndex))
      
      // Set current lesson based on URL parameter or first lesson
      const lessonId = searchParams.get('lesson')
      if (lessonId) {
        const selectedLesson = courseResponse.data.lessons.find(l => l._id === lessonId)
        if (selectedLesson) {
          setCurrentLesson(selectedLesson)
        } else {
          setCurrentLesson(courseResponse.data.lessons[0])
        }
      } else if (courseResponse.data.lessons.length > 0) {
        setCurrentLesson(courseResponse.data.lessons[0])
      }

      // Check enrollment status
      if (user) {
        try {
          const enrollmentResponse = await axios.get(`/api/enroll/${courseId}/status`)
          setEnrollment(enrollmentResponse.data)
        } catch (error) {
          // User not enrolled, that's okay
        }
      }
    } catch (error) {
      if (error.message === 'Invalid course ID') {
        toast.error('Invalid course ID')
        navigate('/courses')
      } else {
        toast.error('Failed to fetch course data')
        navigate('/courses')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLessonSelect = (lesson) => {
    setCurrentLesson(lesson)
    // Update URL to include lesson parameter
    navigate(`/courses/${courseId}/learn?lesson=${lesson._id}`, { replace: true })
  }

  const markLessonComplete = async (lessonId) => {
    if (!user) {
      toast.error('Please login to track progress')
      return
    }

    try {
      const response = await axios.patch(`/api/progress/${lessonId}/complete`, {
        timeSpent: 0,
        lastPosition: 0
      })
      
      // Update local progress state
      setProgress(prev => ({
        ...prev,
        [lessonId]: {
          isCompleted: true,
          completedAt: new Date()
        }
      }))
      
      toast.success('Lesson marked as complete!')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark lesson as complete')
    }
  }

  const handleEnroll = async () => {
    if (!user) {
      toast.error('Please login to enroll in courses')
      return
    }

    try {
      await axios.post(`/api/enroll/${courseId}`)
      toast.success('Successfully enrolled in course!')
      fetchCourseData()
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

  if (!courseId || courseId === 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Course</h1>
          <p className="text-gray-600 mb-6">The course ID is invalid or missing.</p>
          <Link to="/courses" className="btn-primary">
            Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  if (!course || !currentLesson) {
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to={`/courses/${courseId}`} className="text-primary-600 hover:text-primary-700">
                ← Back to Course
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-600">Lesson {lessons.findIndex(l => l._id === currentLesson._id) + 1} of {lessons.length}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <QuickLessonSelector 
                courseId={courseId}
                lessons={lessons}
                currentLessonId={currentLesson._id}
                progress={progress}
              />
              
              {!enrollment?.isEnrolled && user && (
                <button
                  onClick={handleEnroll}
                  className="btn-primary"
                >
                  Enroll in Course
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-3">
            <div className="card p-6">
              <div className="aspect-video bg-black rounded-lg mb-6 flex items-center justify-center">
                {currentLesson.videoUrl ? (
                  <video
                    controls
                    className="w-full h-full rounded-lg"
                    onTimeUpdate={(e) => {
                      // Track video progress if needed
                    }}
                  >
                    <source src={`http://localhost:5000/${currentLesson.videoUrl}`} type="video/mp4" />
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
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    Duration: {Math.floor(currentLesson.videoDuration / 60)} minutes
                  </div>
                  
                  {/* Navigation buttons */}
                  <div className="flex items-center space-x-2">
                    {lessons.findIndex(l => l._id === currentLesson._id) > 0 && (
                      <button
                        onClick={() => {
                          const currentIndex = lessons.findIndex(l => l._id === currentLesson._id)
                          handleLessonSelect(lessons[currentIndex - 1])
                        }}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        ← Previous
                      </button>
                    )}
                    
                    {lessons.findIndex(l => l._id === currentLesson._id) < lessons.length - 1 && (
                      <button
                        onClick={() => {
                          const currentIndex = lessons.findIndex(l => l._id === currentLesson._id)
                          handleLessonSelect(lessons[currentIndex + 1])
                        }}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Next →
                      </button>
                    )}
                  </div>
                </div>
                
                {user && user.role === 'learner' && enrollment?.isEnrolled && (
                  <button
                    onClick={() => markLessonComplete(currentLesson._id)}
                    className={`px-4 py-2 rounded-lg font-medium ${
                      progress[currentLesson._id]?.isCompleted
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-primary-600 hover:bg-primary-700 text-white'
                    }`}
                  >
                    {progress[currentLesson._id]?.isCompleted ? 'Completed ✓' : 'Mark as Complete'}
                  </button>
                )}
              </div>
            </div>

            {/* Lesson Content */}
            <div className="card p-6 mt-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{currentLesson.title}</h2>
              <p className="text-gray-600 mb-6">{currentLesson.description}</p>
              
              {/* Transcript */}
              {currentLesson.transcript && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Transcript</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-green-600 font-medium">
                        Auto-generated transcript
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-line">
                      {currentLesson.transcript}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lessons Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Course Lessons ({lessons.length})
              </h3>
              
              <div className="space-y-2">
                {lessons.map((lesson, index) => (
                  <div
                    key={lesson._id}
                    onClick={() => handleLessonSelect(lesson)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentLesson._id === lesson._id
                        ? 'bg-primary-100 border-2 border-primary-500'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                        currentLesson._id === lesson._id
                          ? 'bg-primary-600 text-white'
                          : progress[lesson._id]?.isCompleted
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-200 text-gray-600'
                      }`}>
                        {progress[lesson._id]?.isCompleted ? '✓' : index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {lesson.title}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {Math.floor(lesson.videoDuration / 60)} min
                        </p>
                      </div>
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
      
      {/* Lesson Navigation */}
      <LessonNavigation 
        courseId={courseId}
        lessons={lessons}
        currentLessonId={currentLesson?._id}
        progress={progress}
      />
    </div>
  )
}

export default CoursePlayer
