import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const AdminDashboard = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('creators')

  useEffect(() => {
    const path = location.pathname.split('/').pop()
    if (path === 'courses') {
      setActiveTab('courses')
    } else {
      setActiveTab('creators')
    }
  }, [location])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage creators and review courses</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <Link
              to="/admin"
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'creators'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Creator Applications
            </Link>
            <Link
              to="/admin/courses"
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Course Reviews
            </Link>
          </nav>
        </div>

        {/* Content */}
        <Routes>
          <Route path="/" element={<CreatorApplications />} />
          <Route path="/courses" element={<CourseReviews />} />
        </Routes>
      </div>
    </div>
  )
}

// Creator Applications Component
const CreatorApplications = () => {
  const [creators, setCreators] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCreators()
  }, [])

  const fetchCreators = async () => {
    try {
      const response = await axios.get('/api/admin/creators')
      setCreators(response.data.creators)
    } catch (error) {
      toast.error('Failed to fetch creator applications')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = async (creatorId, action) => {
    try {
      await axios.patch(`/api/admin/creator/${creatorId}/approve`, { action })
      toast.success(`Creator application ${action}d successfully!`)
      fetchCreators()
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} creator`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Creator Applications</h2>
      
      {creators.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending applications</h3>
          <p className="text-gray-600">All creator applications have been reviewed.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {creators.map(creator => (
            <div key={creator._id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {creator.name}
                  </h3>
                  <p className="text-gray-600 mb-4">{creator.email}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Motivation</h4>
                      <p className="text-sm text-gray-600">{creator.creatorApplication.motivation}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Experience</h4>
                      <p className="text-sm text-gray-600">{creator.creatorApplication.experience}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Specialization</h4>
                      <p className="text-sm text-gray-600">{creator.creatorApplication.specialization}</p>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Applied on {new Date(creator.creatorApplication.appliedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-6">
                  <button
                    onClick={() => handleApproval(creator._id, 'approve')}
                    className="btn-primary text-sm"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleApproval(creator._id, 'reject')}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Course Reviews Component
const CourseReviews = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')

  useEffect(() => {
    fetchCourses()
  }, [filter])

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`/api/admin/courses?status=${filter}`)
      setCourses(response.data.courses)
    } catch (error) {
      toast.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const handleCourseAction = async (courseId, action) => {
    try {
      await axios.patch(`/api/admin/courses/${courseId}/publish`, { action })
      toast.success(`Course ${action}ed successfully!`)
      fetchCourses()
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${action} course`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Reviews</h2>
        
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="pending">Pending Review</option>
          <option value="published">Published</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">No courses match the current filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {courses.map(course => (
            <div key={course._id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4 mb-4">
                    <span>by {course.creator?.name}</span>
                    <span>•</span>
                    <span>{course.category}</span>
                    <span>•</span>
                    <span className="capitalize">{course.difficulty}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Submitted on {new Date(course.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-6">
                  {course.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleCourseAction(course._id, 'publish')}
                        className="btn-primary text-sm"
                      >
                        Publish
                      </button>
                      <button
                        onClick={() => handleCourseAction(course._id, 'reject')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {course.status === 'published' && (
                    <span className="text-green-600 text-sm font-medium">
                      Published
                    </span>
                  )}
                  
                  {course.status === 'rejected' && (
                    <span className="text-red-600 text-sm font-medium">
                      Rejected
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
