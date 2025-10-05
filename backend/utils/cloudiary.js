// cloudinary.js
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,       // Your Cloudinary cloud name
  api_key: process.env.CLOUD_API_KEY,       // Your Cloudinary API key
  api_secret: process.env.CLOUD_API_SECRET, // Your Cloudinary API secret
});

// Setup storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'microcourse', // folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4'], // allowed file types
  },
});

// Multer middleware
const upload = multer({ storage });

module.exports = { cloudinary, upload };
