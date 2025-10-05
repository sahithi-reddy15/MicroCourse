const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/creator/apply
// @desc    Apply to become a creator
// @access  Private (Learner only)
router.post('/apply', [
  auth,
  requireRole(['learner']),
  body('motivation').trim().isLength({ min: 50 }).withMessage('Motivation must be at least 50 characters'),
  body('experience').trim().isLength({ min: 20 }).withMessage('Experience must be at least 20 characters'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { motivation, experience, specialization } = req.body;

    // Check if user already has a pending application
    if (req.user.creatorApplication && req.user.creatorApplication.status === 'pending') {
      return res.status(400).json({ message: 'You already have a pending application' });
    }

    // Check if user is already an approved creator
    if (req.user.isCreatorApproved) {
      return res.status(400).json({ message: 'You are already an approved creator' });
    }

    // Update user with creator application
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        creatorApplication: {
          status: 'pending',
          appliedAt: new Date(),
          motivation,
          experience,
          specialization
        }
      },
      { new: true }
    );

    res.json({
      message: 'Creator application submitted successfully',
      application: updatedUser.creatorApplication
    });
  } catch (error) {
    console.error('Creator application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/creator/status
// @desc    Get creator application status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    res.json({
      isCreatorApproved: req.user.isCreatorApproved,
      application: req.user.creatorApplication
    });
  } catch (error) {
    console.error('Get creator status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
