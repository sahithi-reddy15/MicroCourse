import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const Progress = () => {
  const { user } = useAuth()
  const [progressData, setProgressData] = useState([])
  const [certificates, setCertificates] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProgress()
    fetchCertificates()
  }, [])

  const fetchProgress = async () => {
    try {
      const response = await axios.get('/api/progress')
      setProgressData(response.data.progress)
    } catch (error) {
      toast.error('Failed to fetch progress data')
    } finally {
      setLoading(false)
    }
  }

  const fetchCertificates = async () => {
    try {
      const response = await axios.get('/api/certificates')
      const certMap = {}
      response.data.certificates.forEach(cert => {
        certMap[cert.course._id] = cert
      })
      setCertificates(certMap)
    } catch (error) {
      console.error('Failed to fetch certificates:', error)
    }
  }

  const generateCertificate = async (courseId) => {
    try {
      await axios.post(`/api/certificates/${courseId}`)
      toast.success('Certificate generated successfully!')
      fetchCertificates() // Refresh certificates
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to generate certificate')
    }
  }

  const downloadCertificate = async (courseId) => {
    try {
      console.log('Attempting to download certificate for course:', courseId)
      const response = await axios.get(`/api/certificates/${courseId}/download`, {
        responseType: 'blob'
      })
      
      console.log('Certificate download response:', response)
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `certificate-${courseId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Certificate downloaded successfully!')
    } catch (error) {
      console.error('Certificate download error:', error)
      toast.error(`Failed to download certificate: ${error.response?.data?.message || error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Progress</h1>
          <p className="text-gray-600">Track your learning journey and achievements</p>
        </div>

        {progressData.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No enrolled courses</h3>
            <p className="text-gray-600 mb-6">Start your learning journey by enrolling in a course.</p>
            <Link to="/courses" className="btn-primary">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {progressData.map((item) => (
              <div key={item.enrollment._id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {item.course.title}
                    </h3>
                    <p className="text-gray-600 mb-2">
                      by {item.course.creator?.name}
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <span>{item.completedLessons} of {item.totalLessons} lessons completed</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600 mb-1">
                      {item.progress}%
                    </div>
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{item.progress}% Complete</span>
                  </div>
                </div>

                {/* Lessons List */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    Lessons ({item.lessons.length})
                  </h4>
                  <div className="space-y-2">
                    {item.lessons.map((lesson, index) => (
                      <div key={lesson._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h5 className="text-sm font-medium text-gray-900">
                            {lesson.title}
                          </h5>
                          <p className="text-xs text-gray-500">
                            {Math.floor(lesson.videoDuration / 60)} min
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <Link
                            to={`/courses/${item.course._id}/learn?lesson=${lesson._id}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            {lesson.isCompleted ? 'Rewatch' : 'Watch'}
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    {item.isCompleted ? (
                      <span className="text-green-600 font-medium">
                        🎉 Course Completed!
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        Continue learning to earn your certificate
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {item.isCompleted && (
                      <>
                        {certificates[item.course._id] ? (
                          <button
                            onClick={() => downloadCertificate(item.course._id)}
                            className="btn-primary text-sm"
                          >
                            📄 Download Certificate
                          </button>
                        ) : (
                          <button
                            onClick={() => generateCertificate(item.course._id)}
                            className="btn-secondary text-sm"
                          >
                            🏆 Generate Certificate
                          </button>
                        )}
                      </>
                    )}
                    
                    <Link
                      to={`/courses/${item.course._id}`}
                      className="btn-primary text-sm"
                    >
                      View Course
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Progress
