const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for thumbnails'));
    }
  }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Creator only)
router.post('/', [
  auth,
  requireRole(['creator']),
  upload.single('thumbnail'),
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, category, difficulty, tags } = req.body;

    const course = new Course({
      title,
      description,
      category,
      difficulty,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      creator: req.user._id,
      thumbnail: req.file ? req.file.path : null,
      status: 'draft'
    });

    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses
// @desc    Get published courses (public) or all courses (creator/admin)
// @access  Public or Private
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let query = {};

    // If not authenticated or not creator/admin, only show published courses
    if (!req.headers.authorization) {
      query.status = 'published';
    } else {
      // For authenticated users, show published courses by default
      // Creators and admins can see their own courses
      const token = req.headers.authorization.replace('Bearer ', '');
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const User = require('../models/User');
        const user = await User.findById(decoded.userId);
        
        if (user.role === 'creator') {
          query = { $or: [{ status: 'published' }, { creator: user._id }] };
        } else if (user.role === 'admin') {
          // Admins can see all courses
          query = {};
        } else {
          query.status = 'published';
        }
      } catch (error) {
        query.status = 'published';
      }
    }

    // Apply filters
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(query)
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      courses
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course details
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id || req.params.id === 'undefined' || req.params.id.length !== 24) {
      return res.status(400).json({ message: 'Invalid course ID format' });
    }

    const course = await Course.findById(req.params.id)
      .populate('creator', 'name email');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Only show published courses to non-authenticated users
    if (!req.headers.authorization && course.status !== 'published') {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get lessons for this course
    const lessons = await Lesson.find({ course: course._id })
      .sort({ orderIndex: 1 });

    res.json({
      course,
      lessons
    });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Creator - own courses only)
router.put('/:id', [
  auth,
  requireRole(['creator']),
  upload.single('thumbnail'),
  body('title').optional().trim().isLength({ min: 3 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user owns this course
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }

    // Only allow updates to draft courses
    if (course.status !== 'draft') {
      return res.status(400).json({ message: 'Can only update draft courses' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.thumbnail = req.file.path;
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PATCH /api/courses/:id/submit
// @desc    Submit course for review
// @access  Private (Creator - own courses only)
router.patch('/:id/submit', [auth, requireRole(['creator'])], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user owns this course
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit this course' });
    }

    // Only allow submission of draft courses
    if (course.status !== 'draft') {
      return res.status(400).json({ message: 'Can only submit draft courses' });
    }

    // Check if course has lessons
    const lessonCount = await Lesson.countDocuments({ course: course._id });
    if (lessonCount === 0) {
      return res.status(400).json({ message: 'Course must have at least one lesson before submission' });
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      { status: 'pending' },
      { new: true }
    );

    res.json({
      message: 'Course submitted for review successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Submit course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Creator - own courses only)
router.delete('/:id', [auth, requireRole(['creator'])], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user owns this course
    if (course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this course' });
    }

    // Only allow deletion of draft courses
    if (course.status !== 'draft') {
      return res.status(400).json({ message: 'Can only delete draft courses' });
    }

    // Delete associated lessons
    await Lesson.deleteMany({ course: course._id });

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Course deleted successfully'
    });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
