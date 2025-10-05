import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const CreatorDashboard = () => {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await axios.get('/api/courses')
      setCourses(response.data.courses)
    } catch (error) {
      toast.error('Failed to fetch courses')
    } finally {
      setLoading(false)
    }
  }

  const submitForReview = async (courseId) => {
    try {
      await axios.patch(`/api/courses/${courseId}/submit`)
      toast.success('Course submitted for review!')
      fetchCourses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit course')
    }
  }

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return
    }

    try {
      await axios.delete(`/api/courses/${courseId}`)
      toast.success('Course deleted successfully!')
      fetchCourses()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete course')
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Creator Dashboard</h1>
              <p className="text-gray-600">Manage your courses and content</p>
            </div>
            <Link to="/creator/courses/new" className="btn-primary">
              Create New Course
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="text-2xl font-bold text-primary-600 mb-1">
              {courses.length}
            </div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          
          <div className="card p-6">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {courses.filter(c => c.status === 'published').length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          
          <div className="card p-6">
            <div className="text-2xl font-bold text-yellow-600 mb-1">
              {courses.filter(c => c.status === 'pending').length}
            </div>
            <div className="text-sm text-gray-600">Under Review</div>
          </div>
          
          <div className="card p-6">
            <div className="text-2xl font-bold text-gray-600 mb-1">
              {courses.filter(c => c.status === 'draft').length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
        </div>

        {/* Courses List */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">Start creating your first course to share your knowledge.</p>
            <Link to="/creator/courses/new" className="btn-primary">
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {courses.map(course => (
              <div key={course._id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {course.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        course.status === 'published' ? 'bg-green-100 text-green-800' :
                        course.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        course.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">
                      {course.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span>{course.category}</span>
                      <span>•</span>
                      <span className="capitalize">{course.difficulty}</span>
                      <span>•</span>
                      <span>{course.enrollmentCount} students</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {course.status === 'draft' && (
                      <>
                        <Link
                          to={`/creator/courses/${course._id}/edit`}
                          className="btn-secondary text-sm"
                        >
                          Edit
                        </Link>
                        <Link
                          to={`/creator/courses/${course._id}/manage`}
                          className="btn-secondary text-sm"
                        >
                          Manage Lessons
                        </Link>
                        <button
                          onClick={() => submitForReview(course._id)}
                          className="btn-primary text-sm"
                        >
                          Submit for Review
                        </button>
                        <button
                          onClick={() => deleteCourse(course._id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                    
                    {course.status === 'pending' && (
                      <span className="text-yellow-600 text-sm">
                        Under Review
                      </span>
                    )}
                    
                    {course.status === 'published' && (
                      <span className="text-green-600 text-sm">
                        Published
                      </span>
                    )}
                    
                    {course.status === 'rejected' && (
                      <span className="text-red-600 text-sm">
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
    </div>
  )
}

export default CreatorDashboard
