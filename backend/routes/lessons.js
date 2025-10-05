const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { auth, requireRole } = require('../middleware/auth');
const { generateTranscript } = require('../utils/transcriptGenerator');

const router = express.Router();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'));
    }
  }
});

// @route   POST /api/lessons
// @desc    Create a new lesson
// @access  Private (Creator only)
router.post('/', [
  auth,
  requireRole(['creator']),
  upload.single('video'),
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('course').isMongoId().withMessage('Valid course ID is required'),
  body('orderIndex').isInt({ min: 1 }).withMessage('Order index must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, course, orderIndex, transcript } = req.body;

    // Check if course exists and user owns it
    const courseDoc = await Course.findById(course);
    if (!courseDoc) {
      return res.status(404).json({ message: 'Course not found' });
    }

    if (courseDoc.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to add lessons to this course' });
    }

    // Check if orderIndex already exists for this course
    const existingLesson = await Lesson.findOne({ course, orderIndex });
    if (existingLesson) {
      return res.status(400).json({ message: 'Order index already exists for this course' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    // Simulate video duration (in a real app, you'd extract this from the video file)
    const videoDuration = Math.floor(Math.random() * 1800) + 300; // 5-35 minutes in seconds

    // Generate transcript automatically
    let generatedTranscript = transcript;
    if (!transcript || transcript.trim() === '') {
      try {
        const transcriptResult = await generateTranscript(req.file.path, videoDuration);
        generatedTranscript = transcriptResult.transcript;
      } catch (error) {
        console.error('Transcript generation failed:', error);
        generatedTranscript = 'Transcript generation failed. Please add manually.';
      }
    }

    const lesson = new Lesson({
      title,
      description,
      course,
      orderIndex,
      videoUrl: req.file.path,
      videoDuration: videoDuration,
      transcript: generatedTranscript
    });

    await lesson.save();

    res.status(201).json({
      message: 'Lesson created successfully',
      lesson
    });
  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/lessons/:lessonId
// @desc    Get lesson details
// @access  Public (for published courses) or Private (for enrolled users)
router.get('/:lessonId', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId)
      .populate('course', 'title status creator');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if course is published or user is enrolled
    const course = lesson.course;
    
    // If course is published, allow access
    if (course.status === 'published') {
      return res.json({ lesson });
    }

    // If user is authenticated, check if they're enrolled or the creator
    if (req.headers.authorization) {
      try {
        const jwt = require('jsonwebtoken');
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const User = require('../models/User');
        const user = await User.findById(decoded.userId);
        
        // Check if user is the creator or enrolled
        if (user._id.toString() === course.creator.toString()) {
          return res.json({ lesson });
        }

        // Check enrollment
        const Enrollment = require('../models/Enrollment');
        const enrollment = await Enrollment.findOne({
          user: user._id,
          course: course._id
        });

        if (enrollment) {
          return res.json({ lesson });
        }
      } catch (error) {
        // Invalid token, treat as unauthenticated
      }
    }

    res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    console.error('Get lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/lessons/:lessonId
// @desc    Update lesson
// @access  Private (Creator - own lessons only)
router.put('/:lessonId', [
  auth,
  requireRole(['creator']),
  upload.single('video'),
  body('title').optional().trim().isLength({ min: 3 }),
  body('description').optional().trim().isLength({ min: 10 }),
  body('orderIndex').optional().isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const lesson = await Lesson.findById(req.params.lessonId)
      .populate('course', 'creator status');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user owns this lesson's course
    if (lesson.course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this lesson' });
    }

    // Only allow updates to lessons in draft courses
    if (lesson.course.status !== 'draft') {
      return res.status(400).json({ message: 'Can only update lessons in draft courses' });
    }

    const updateData = { ...req.body };
    if (req.file) {
      updateData.videoUrl = req.file.path;
    }

    // Check for orderIndex conflict if it's being updated
    if (updateData.orderIndex && updateData.orderIndex !== lesson.orderIndex) {
      const existingLesson = await Lesson.findOne({
        course: lesson.course._id,
        orderIndex: updateData.orderIndex,
        _id: { $ne: lesson._id }
      });
      if (existingLesson) {
        return res.status(400).json({ message: 'Order index already exists for this course' });
      }
    }

    const updatedLesson = await Lesson.findByIdAndUpdate(
      req.params.lessonId,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Lesson updated successfully',
      lesson: updatedLesson
    });
  } catch (error) {
    console.error('Update lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/lessons/:lessonId
// @desc    Delete lesson
// @access  Private (Creator - own lessons only)
router.delete('/:lessonId', [auth, requireRole(['creator'])], async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId)
      .populate('course', 'creator status');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user owns this lesson's course
    if (lesson.course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this lesson' });
    }

    // Only allow deletion of lessons in draft courses
    if (lesson.course.status !== 'draft') {
      return res.status(400).json({ message: 'Can only delete lessons in draft courses' });
    }

    await Lesson.findByIdAndDelete(req.params.lessonId);

    res.json({
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    console.error('Delete lesson error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/lessons/:lessonId/regenerate-transcript
// @desc    Regenerate transcript for a lesson
// @access  Private (Creator - own lessons only)
router.post('/:lessonId/regenerate-transcript', [auth, requireRole(['creator'])], async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId)
      .populate('course', 'creator status');

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Check if user owns this lesson's course
    if (lesson.course.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to regenerate transcript for this lesson' });
    }

    // Only allow regeneration for lessons in draft courses
    if (lesson.course.status !== 'draft') {
      return res.status(400).json({ message: 'Can only regenerate transcripts for lessons in draft courses' });
    }

    // Generate new transcript
    try {
      const transcriptResult = await generateTranscript(lesson.videoUrl, lesson.videoDuration);
      
      const updatedLesson = await Lesson.findByIdAndUpdate(
        req.params.lessonId,
        { transcript: transcriptResult.transcript },
        { new: true }
      );

      res.json({
        message: 'Transcript regenerated successfully',
        lesson: updatedLesson
      });
    } catch (error) {
      console.error('Transcript regeneration failed:', error);
      res.status(500).json({ message: 'Failed to regenerate transcript' });
    }
  } catch (error) {
    console.error('Regenerate transcript error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
