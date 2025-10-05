import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../config/axios'
import toast from 'react-hot-toast'

const AddLesson = () => {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    orderIndex: 1,
    transcript: ''
  })
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generatingTranscript, setGeneratingTranscript] = useState(false)

  useEffect(() => {
    fetchCourseDetails()
  }, [courseId])

  const fetchCourseDetails = async () => {
    try {
      const response = await axios.get(`/api/courses/${courseId}`)
      setCourse(response.data.course)
      setLessons(response.data.lessons)
      
      // Set next order index
      const nextOrder = lessons.length + 1
      setFormData(prev => ({ ...prev, orderIndex: nextOrder }))
    } catch (error) {
      toast.error('Failed to fetch course details')
      navigate('/creator/dashboard')
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleVideoChange = (e) => {
    if (e.target.files[0]) {
      setVideo(e.target.files[0])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setGeneratingTranscript(!formData.transcript.trim()) // Show transcript generation if no custom transcript

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('course', courseId)
      formDataToSend.append('orderIndex', formData.orderIndex)
      formDataToSend.append('transcript', formData.transcript)
      
      if (video) {
        formDataToSend.append('video', video)
      }

      await axios.post('/api/lessons', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Lesson added successfully!')
      fetchCourseDetails() // Refresh lessons list
      setFormData({
        title: '',
        description: '',
        orderIndex: lessons.length + 2,
        transcript: ''
      })
      setVideo(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add lesson')
    } finally {
      setLoading(false)
      setGeneratingTranscript(false)
    }
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Lesson to Course</h1>
              <p className="text-gray-600">{course.title}</p>
            </div>
            <button
              onClick={() => navigate('/creator/dashboard')}
              className="btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Lesson Form */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Lesson</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Lesson Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter lesson title"
                  />
                </div>

                {/* Lesson Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Describe what students will learn in this lesson..."
                  />
                </div>

                {/* Order Index */}
                <div>
                  <label htmlFor="orderIndex" className="block text-sm font-medium text-gray-700 mb-2">
                    Lesson Order *
                  </label>
                  <input
                    type="number"
                    id="orderIndex"
                    name="orderIndex"
                    required
                    min="1"
                    value={formData.orderIndex}
                    onChange={handleChange}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This determines the order of lessons in the course
                  </p>
                </div>

                {/* Video Upload */}
                <div>
                  <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-2">
                    Video File *
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                    <div className="space-y-1 text-center">
                      {video ? (
                        <div>
                          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                          <p className="text-sm text-gray-600 mt-2">{video.name}</p>
                          <p className="text-xs text-gray-500">
                            {(video.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="video" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                              <span>Upload video</span>
                              <input
                                id="video"
                                name="video"
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                                className="sr-only"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">MP4, MOV, AVI up to 100MB</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Transcript */}
                <div>
                  <label htmlFor="transcript" className="block text-sm font-medium text-gray-700 mb-2">
                    Transcript (Optional)
                  </label>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-blue-800">
                        <strong>Auto-Generation:</strong> If you leave this blank, we'll automatically generate a transcript from your video.
                      </p>
                    </div>
                  </div>
                  
                  {generatingTranscript && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                        <p className="text-sm text-green-800">
                          <strong>Generating transcript...</strong> This may take a few moments depending on video length.
                        </p>
                      </div>
                    </div>
                  )}
                  <textarea
                    id="transcript"
                    name="transcript"
                    rows={4}
                    value={formData.transcript}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter custom transcript or leave blank for auto-generation..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank to auto-generate transcript from video, or provide your own transcript.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData({
                        title: '',
                        description: '',
                        orderIndex: lessons.length + 1,
                        transcript: ''
                      })
                      setVideo(null)
                    }}
                    className="btn-secondary"
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary"
                  >
                    {loading ? (
                      generatingTranscript ? 'Generating Transcript...' : 'Adding Lesson...'
                    ) : (
                      'Add Lesson'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Existing Lessons */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Course Lessons ({lessons.length})
              </h3>
              
              {lessons.length === 0 ? (
                <p className="text-gray-500 text-sm">No lessons added yet</p>
              ) : (
                <div className="space-y-3">
                  {lessons
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map((lesson, index) => (
                    <div key={lesson._id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {lesson.orderIndex}
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
              )}
              
              {lessons.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <button
                    onClick={() => navigate('/creator/dashboard')}
                    className="w-full btn-primary"
                  >
                    Finish Adding Lessons
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddLesson
