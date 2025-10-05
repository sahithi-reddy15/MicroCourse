const express = require('express');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/progress
// @desc    Get learner's progress data
// @access  Private (Learner only)
router.get('/', [auth, requireRole(['learner'])], async (req, res) => {
  try {
    // Get all enrollments with progress
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course', 'title thumbnail')
      .populate('course.creator', 'name');

    const progressData = [];

    for (const enrollment of enrollments) {
      // Get all lessons for this course
      const lessons = await Lesson.find({ course: enrollment.course._id })
        .sort({ orderIndex: 1 });

      // Get progress for each lesson
      const lessonProgress = await Progress.find({
        user: req.user._id,
        lesson: { $in: lessons.map(l => l._id) }
      });

      // Calculate course progress
      const completedLessons = lessonProgress.filter(p => p.isCompleted).length;
      const totalLessons = lessons.length;
      const courseProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

      progressData.push({
        enrollment,
        course: enrollment.course,
        totalLessons,
        completedLessons,
        progress: Math.round(courseProgress),
        isCompleted: courseProgress === 100,
        lessons: lessons.map(lesson => {
          const progress = lessonProgress.find(p => p.lesson.toString() === lesson._id.toString());
          return {
            ...lesson.toObject(),
            isCompleted: progress ? progress.isCompleted : false,
            completedAt: progress ? progress.completedAt : null
          };
        })
      });
    }

    res.json({
      progress: progressData
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/progress/:lessonId/complete
// @desc    Mark a lesson as complete
// @access  Private (Learner only)
router.patch('/:lessonId/complete', [auth, requireRole(['learner'])], async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { timeSpent, lastPosition } = req.body;

    // Check if lesson exists
    const lesson = await Lesson.findById(lessonId).populate('course');
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: lesson.course._id
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You must be enrolled in this course to mark lessons as complete' });
    }

    // Check if course is published
    if (lesson.course.status !== 'published') {
      return res.status(400).json({ message: 'Course is not published' });
    }

    // Create or update progress
    let progress = await Progress.findOne({
      user: req.user._id,
      lesson: lessonId
    });

    if (!progress) {
      progress = new Progress({
        user: req.user._id,
        lesson: lessonId,
        course: lesson.course._id,
        isCompleted: true,
        completedAt: new Date(),
        timeSpent: timeSpent || 0,
        lastPosition: lastPosition || 0
      });
    } else {
      progress.isCompleted = true;
      progress.completedAt = new Date();
      if (timeSpent) progress.timeSpent = timeSpent;
      if (lastPosition) progress.lastPosition = lastPosition;
    }

    await progress.save();

    // Check if all lessons in the course are completed
    const allLessons = await Lesson.find({ course: lesson.course._id });
    const completedLessons = await Progress.countDocuments({
      user: req.user._id,
      lesson: { $in: allLessons.map(l => l._id) },
      isCompleted: true
    });

    const courseProgress = (completedLessons / allLessons.length) * 100;

    // Update enrollment progress
    await Enrollment.findByIdAndUpdate(enrollment._id, {
      progress: Math.round(courseProgress),
      isCompleted: courseProgress === 100,
      completedAt: courseProgress === 100 ? new Date() : null
    });

    res.json({
      message: 'Lesson marked as complete',
      progress,
      courseProgress: Math.round(courseProgress),
      isCourseCompleted: courseProgress === 100
    });
  } catch (error) {
    console.error('Mark lesson complete error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/progress/:courseId
// @desc    Get progress for a specific course
// @access  Private (Learner only)
router.get('/:courseId', [auth, requireRole(['learner'])], async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    // Get course details
    const course = await Course.findById(courseId)
      .populate('creator', 'name');

    // Get all lessons
    const lessons = await Lesson.find({ course: courseId })
      .sort({ orderIndex: 1 });

    // Get progress for each lesson
    const lessonProgress = await Progress.find({
      user: req.user._id,
      lesson: { $in: lessons.map(l => l._id) }
    });

    const lessonsWithProgress = lessons.map(lesson => {
      const progress = lessonProgress.find(p => p.lesson.toString() === lesson._id.toString());
      return {
        ...lesson.toObject(),
        isCompleted: progress ? progress.isCompleted : false,
        completedAt: progress ? progress.completedAt : null,
        timeSpent: progress ? progress.timeSpent : 0,
        lastPosition: progress ? progress.lastPosition : 0
      };
    });

    const completedLessons = lessonProgress.filter(p => p.isCompleted).length;
    const totalLessons = lessons.length;
    const courseProgress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    res.json({
      course,
      enrollment,
      lessons: lessonsWithProgress,
      progress: {
        totalLessons,
        completedLessons,
        percentage: Math.round(courseProgress),
        isCompleted: courseProgress === 100
      }
    });
  } catch (error) {
    console.error('Get course progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
