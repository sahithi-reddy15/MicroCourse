const express = require('express');
const User = require('../models/User');
const Course = require('../models/Course');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/creators
// @desc    Get pending creator applications
// @access  Private (Admin only)
router.get('/creators', [auth, requireRole(['admin'])], async (req, res) => {
  try {
    const pendingCreators = await User.find({
      'creatorApplication.status': 'pending'
    }).select('-password');

    res.json({
      creators: pendingCreators
    });
  } catch (error) {
    console.error('Get pending creators error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/creator/:id/approve
// @desc    Approve creator application
// @access  Private (Admin only)
router.patch('/creator/:id/approve', [auth, requireRole(['admin'])], async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "approve" or "reject"' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.creatorApplication.status !== 'pending') {
      return res.status(400).json({ message: 'Application is not pending' });
    }

    const updateData = {
      'creatorApplication.status': action === 'approve' ? 'approved' : 'rejected',
      'creatorApplication.reviewedAt': new Date(),
      'creatorApplication.reviewedBy': req.user._id
    };

    if (action === 'approve') {
      updateData.role = 'creator';
      updateData.isCreatorApproved = true;
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });

    res.json({
      message: `Creator application ${action}d successfully`,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isCreatorApproved: updatedUser.isCreatorApproved,
        creatorApplication: updatedUser.creatorApplication
      }
    });
  } catch (error) {
    console.error('Approve creator error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/courses
// @desc    Get courses for review
// @access  Private (Admin only)
router.get('/courses', [auth, requireRole(['admin'])], async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    
    const courses = await Course.find({ status })
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      courses
    });
  } catch (error) {
    console.error('Get courses for review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/admin/courses/:id/publish
// @desc    Publish or reject a course
// @access  Private (Admin only)
router.patch('/courses/:id/publish', [auth, requireRole(['admin'])], async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'publish' or 'reject'

    if (!['publish', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action. Must be "publish" or "reject"' });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (course.status !== 'pending') {
      return res.status(400).json({ message: 'Course is not pending review' });
    }

    const updateData = {
      status: action === 'publish' ? 'published' : 'rejected',
      publishedAt: action === 'publish' ? new Date() : null,
      publishedBy: action === 'publish' ? req.user._id : null
    };

    const updatedCourse = await Course.findByIdAndUpdate(id, updateData, { new: true })
      .populate('creator', 'name email');

    res.json({
      message: `Course ${action}ed successfully`,
      course: updatedCourse
    });
  } catch (error) {
    console.error('Publish course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
