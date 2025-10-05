const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const { auth, requireRole } = require('../middleware/auth');
const { upload } = require('../utils/cloudiary');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// -------------------------
// Helper: Check course ownership
// -------------------------
const checkOwnership = (course, userId) => course.creator.toString() === userId.toString();

// -------------------------
// POST /api/courses - Create course
// -------------------------
router.post(
  '/',
  [
    auth,
    requireRole(['creator']),
    upload.single('thumbnail'),
    body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty level')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

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
      res.status(201).json({ message: 'Course created successfully', course });
    } catch (error) {
      console.error('Create course error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// -------------------------
// GET /api/courses - List courses
// -------------------------
router.get('/', async (req, res) => {
  try {
    const { category, difficulty, search } = req.query;
    let query = {};

    // Auth check
    if (req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const user = await User.findById(decoded.userId);

        if (user.role === 'creator') query = { $or: [{ status: 'published' }, { creator: user._id }] };
        else if (user.role !== 'admin') query.status = 'published';
      } catch {
        query.status = 'published';
      }
    } else {
      query.status = 'published';
    }

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];

    const courses = await Course.find(query)
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });

    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------
// GET /api/courses/:id - Course details
// -------------------------
router.get('/:id', async (req, res) => {
  try {
    if (!req.params.id || req.params.id.length !== 24)
      return res.status(400).json({ message: 'Invalid course ID' });

    const course = await Course.findById(req.params.id).populate('creator', 'name email');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (!req.headers.authorization && course.status !== 'published')
      return res.status(404).json({ message: 'Course not found' });

    const lessons = await Lesson.find({ course: course._id }).sort({ orderIndex: 1 });
    res.json({ course, lessons });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------
// PUT /api/courses/:id - Update course
// -------------------------
router.put(
  '/:id',
  [
    auth,
    requireRole(['creator']),
    upload.single('thumbnail'),
    body('title').optional().trim().isLength({ min: 3 }),
    body('description').optional().trim().isLength({ min: 10 }),
    body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced'])
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ message: 'Course not found' });
      if (!checkOwnership(course, req.user._id)) return res.status(403).json({ message: 'Not authorized' });
      if (course.status !== 'draft') return res.status(400).json({ message: 'Can only update draft courses' });

      const updateData = { ...req.body };
      if (req.file) updateData.thumbnail = req.file.path;

      const updatedCourse = await Course.findByIdAndUpdate(req.params.id, updateData, { new: true });
      res.json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (error) {
      console.error('Update course error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// -------------------------
// PATCH /api/courses/:id/submit - Submit course
// -------------------------
router.patch('/:id/submit', [auth, requireRole(['creator'])], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!checkOwnership(course, req.user._id)) return res.status(403).json({ message: 'Not authorized' });
    if (course.status !== 'draft') return res.status(400).json({ message: 'Can only submit draft courses' });

    const lessonCount = await Lesson.countDocuments({ course: course._id });
    if (lessonCount === 0) return res.status(400).json({ message: 'Course must have at least one lesson before submission' });

    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, { status: 'pending' }, { new: true });
    res.json({ message: 'Course submitted for review successfully', course: updatedCourse });
  } catch (error) {
    console.error('Submit course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------------
// DELETE /api/courses/:id - Delete course
// -------------------------
router.delete('/:id', [auth, requireRole(['creator'])], async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (!checkOwnership(course, req.user._id)) return res.status(403).json({ message: 'Not authorized' });
    if (course.status !== 'draft') return res.status(400).json({ message: 'Can only delete draft courses' });

    await Lesson.deleteMany({ course: course._id });
    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
