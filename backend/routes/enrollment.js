const express = require('express');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/enroll/:courseId
// @desc    Enroll in a course
// @access  Private (Learner only)
router.post('/:courseId', [auth, requireRole(['learner'])], async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists and is published
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status !== 'published') {
      return res.status(400).json({ message: 'Course is not available for enrollment' });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      user: req.user._id,
      course: courseId
    });

    await enrollment.save();

    // Update course enrollment count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrollmentCount: 1 }
    });

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment
    });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/enroll/my-courses
// @desc    Get user's enrolled courses
// @access  Private (Learner only)
router.get('/my-courses', [auth, requireRole(['learner'])], async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id })
      .populate('course', 'title description thumbnail category difficulty creator')
      .populate('course.creator', 'name')
      .sort({ enrolledAt: -1 });

    res.json({
      enrollments
    });
  } catch (error) {
    console.error('Get enrolled courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/enroll/:courseId/status
// @desc    Check enrollment status for a course
// @access  Private
router.get('/:courseId/status', auth, async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId
    });

    res.json({
      isEnrolled: !!enrollment,
      enrollment: enrollment || null
    });
  } catch (error) {
    console.error('Check enrollment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
