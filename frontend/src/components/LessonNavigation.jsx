import { Link } from 'react-router-dom'

const LessonNavigation = ({ courseId, lessons, currentLessonId, progress = {} }) => {
  const currentIndex = lessons.findIndex(l => l._id === currentLessonId)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < lessons.length - 1

  return (
    <div className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {hasPrevious && (
              <Link
                to={`/courses/${courseId}/learn?lesson=${lessons[currentIndex - 1]._id}`}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous Lesson</span>
              </Link>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {currentIndex + 1} of {lessons.length}
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {hasNext && (
              <Link
                to={`/courses/${courseId}/learn?lesson=${lessons[currentIndex + 1]._id}`}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <span>Next Lesson</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonNavigation
