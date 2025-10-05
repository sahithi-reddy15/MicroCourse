import { useState } from 'react'
import { Link } from 'react-router-dom'

const QuickLessonSelector = ({ courseId, lessons, currentLessonId, progress = {} }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        <span>Jump to Lesson</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {lessons.map((lesson, index) => (
            <Link
              key={lesson._id}
              to={`/courses/${courseId}/learn?lesson=${lesson._id}`}
              onClick={() => setIsOpen(false)}
              className={`flex items-center p-3 hover:bg-gray-50 ${
                lesson._id === currentLessonId ? 'bg-primary-50 border-l-4 border-primary-500' : ''
              }`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mr-3 ${
                lesson._id === currentLessonId
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
              {lesson._id === currentLessonId && (
                <div className="flex-shrink-0">
                  <span className="text-xs text-primary-600 font-medium">Current</span>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default QuickLessonSelector
