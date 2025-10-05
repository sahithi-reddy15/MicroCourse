import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const CreatorApply = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    motivation: '',
    experience: '',
    specialization: ''
  })
  const [loading, setLoading] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState(null)

  useEffect(() => {
    fetchApplicationStatus()
  }, [])

  const fetchApplicationStatus = async () => {
    try {
      const response = await axios.get('/api/creator/status')
      setApplicationStatus(response.data)
    } catch (error) {
      console.error('Failed to fetch application status')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('/api/creator/apply', formData)
      toast.success('Application submitted successfully!')
      fetchApplicationStatus()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application')
    } finally {
      setLoading(false)
    }
  }

  if (applicationStatus?.isCreatorApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Already Approved!</h1>
          <p className="text-gray-600 mb-6">You are already an approved creator.</p>
          <button
            onClick={() => navigate('/creator/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (applicationStatus?.application?.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Pending</h1>
          <p className="text-gray-600 mb-6">
            Your creator application is under review. We'll notify you once it's processed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (applicationStatus?.application?.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Rejected</h1>
          <p className="text-gray-600 mb-6">
            Unfortunately, your creator application was not approved. You can try again with a stronger application.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Apply Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Become a Creator
          </h1>
          <p className="text-gray-600">
            Share your knowledge and create amazing courses for learners worldwide.
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="motivation" className="block text-sm font-medium text-gray-700 mb-2">
                Why do you want to become a creator? *
              </label>
              <textarea
                id="motivation"
                name="motivation"
                rows={4}
                required
                value={formData.motivation}
                onChange={handleChange}
                className="input-field"
                placeholder="Tell us about your motivation to teach and share knowledge..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 50 characters
              </p>
            </div>

            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                What is your teaching or professional experience? *
              </label>
              <textarea
                id="experience"
                name="experience"
                rows={4}
                required
                value={formData.experience}
                onChange={handleChange}
                className="input-field"
                placeholder="Describe your relevant experience in teaching, training, or your field of expertise..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 20 characters
              </p>
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700 mb-2">
                What subjects or skills do you want to teach? *
              </label>
              <input
                id="specialization"
                name="specialization"
                type="text"
                required
                value={formData.specialization}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Web Development, Data Science, Photography, etc."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Application Process</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your application will be reviewed by our admin team</li>
                <li>• We'll notify you via email once it's processed</li>
                <li>• Approved creators can start creating courses immediately</li>
                <li>• All courses go through admin review before publication</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreatorApply
