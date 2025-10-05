const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  serialHash: {
    type: String,
    required: true,
    unique: true
  },
  issuedAt: {
    type: Date,
    default: Date.now
  },
  courseTitle: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  completionDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Ensure unique certificate per user-course pair
certificateSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Certificate', certificateSchema);
