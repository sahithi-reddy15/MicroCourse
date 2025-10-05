const express = require('express');
const crypto = require('crypto');
const { jsPDF } = require('jspdf');
const Certificate = require('../models/Certificate');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const { auth, requireRole } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/certificates/:courseId
// @desc    Generate certificate for completed course
// @access  Private (Learner only)
router.post('/:courseId', [auth, requireRole(['learner'])], async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled and has completed the course
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      course: courseId
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }

    if (!enrollment.isCompleted) {
      return res.status(400).json({ message: 'Course must be completed to generate certificate' });
    }

    // Check if certificate already exists
    const existingCertificate = await Certificate.findOne({
      user: req.user._id,
      course: courseId
    });

    if (existingCertificate) {
      return res.json({
        message: 'Certificate already exists',
        certificate: existingCertificate
      });
    }

    // Generate unique serial hash
    const timestamp = Date.now();
    const hashInput = `${req.user._id}${courseId}${timestamp}`;
    const serialHash = crypto.createHash('sha256').update(hashInput).digest('hex');

    // Create certificate
    const certificate = new Certificate({
      user: req.user._id,
      course: courseId,
      serialHash,
      courseTitle: course.title,
      userName: req.user.name,
      completionDate: enrollment.completedAt
    });

    await certificate.save();

    res.status(201).json({
      message: 'Certificate generated successfully',
      certificate
    });
  } catch (error) {
    console.error('Generate certificate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/certificates
// @desc    Get user's certificates
// @access  Private (Learner only)
router.get('/', [auth, requireRole(['learner'])], async (req, res) => {
  try {
    const certificates = await Certificate.find({ user: req.user._id })
      .populate('course', 'title thumbnail category')
      .sort({ issuedAt: -1 });

    res.json({
      certificates
    });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/certificates/:courseId
// @desc    Get certificate for a specific course
// @access  Private (Learner only)
router.get('/:courseId', [auth, requireRole(['learner'])], async (req, res) => {
  try {
    const { courseId } = req.params;

    const certificate = await Certificate.findOne({
      user: req.user._id,
      course: courseId
    }).populate('course', 'title thumbnail category');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    res.json({
      certificate
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/certificates/verify/:serialHash
// @desc    Verify certificate by serial hash
// @access  Public
router.get('/verify/:serialHash', async (req, res) => {
  try {
    const { serialHash } = req.params;

    const certificate = await Certificate.findOne({ serialHash })
      .populate('user', 'name email')
      .populate('course', 'title description category');

    if (!certificate) {
      return res.status(404).json({ 
        message: 'Certificate not found',
        valid: false 
      });
    }

    res.json({
      message: 'Certificate is valid',
      valid: true,
      certificate: {
        serialHash: certificate.serialHash,
        userName: certificate.userName,
        courseTitle: certificate.courseTitle,
        completionDate: certificate.completionDate,
        issuedAt: certificate.issuedAt,
        course: certificate.course
      }
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/certificates/:courseId/download
// @desc    Download certificate as PDF
// @access  Private (Learner only)
router.get('/:courseId/download', [auth, requireRole(['learner'])], async (req, res) => {
  try {
    const { courseId } = req.params;

    const certificate = await Certificate.findOne({
      user: req.user._id,
      course: courseId
    }).populate('course', 'title category');

    if (!certificate) {
      return res.status(404).json({ message: 'Certificate not found' });
    }

    console.log('Generating PDF for certificate:', certificate.serialHash);

    // Create PDF
    const doc = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background color
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Border
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(3);
    doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

    // Inner border
    doc.setDrawColor(0, 102, 204);
    doc.setLineWidth(1);
    doc.rect(25, 25, pageWidth - 50, pageHeight - 50);

    // Title
    doc.setFontSize(28);
    doc.setTextColor(0, 102, 204);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICATE OF COMPLETION', pageWidth / 2, 60, { align: 'center' });

    // Subtitle
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('This is to certify that', pageWidth / 2, 85, { align: 'center' });

    // Student name
    doc.setFontSize(24);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(certificate.userName, pageWidth / 2, 110, { align: 'center' });

    // Course completion text
    doc.setFontSize(16);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    doc.text('has successfully completed the course', pageWidth / 2, 135, { align: 'center' });

    // Course title
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.setFont('helvetica', 'bold');
    doc.text(`"${certificate.courseTitle}"`, pageWidth / 2, 160, { align: 'center' });

    // Date
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.setFont('helvetica', 'normal');
    const completionDate = new Date(certificate.completionDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Completed on: ${completionDate}`, pageWidth / 2, 200, { align: 'center' });

    // Serial number
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Certificate ID: ${certificate.serialHash.substring(0, 16)}...`, pageWidth / 2, 250, { align: 'center' });

    // Platform name
    doc.setFontSize(12);
    doc.setTextColor(0, 102, 204);
    doc.setFont('helvetica', 'bold');
    doc.text('MicroCourse Learning Platform', pageWidth / 2, 280, { align: 'center' });

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');
    const pdfData = Buffer.from(pdfBuffer);

    console.log('PDF generated successfully, size:', pdfData.length);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${certificate.serialHash.substring(0, 8)}.pdf"`);
    res.setHeader('Content-Length', pdfData.length);

    // Send PDF
    res.send(pdfData);
  } catch (error) {
    console.error('Download certificate error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
