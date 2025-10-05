const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  orderIndex: {
    type: Number,
    required: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  videoDuration: {
    type: Number, // in seconds
    required: true
  },
  transcript: {
    type: String,
    default: ''
  },
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'link', 'document'],
      default: 'link'
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Ensure unique orderIndex per course
lessonSchema.index({ course: 1, orderIndex: 1 }, { unique: true });

module.exports = mongoose.model('Lesson', lessonSchema);
