const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: 'https://micro-course-omega.vercel.app', // replace with your Vercel frontend URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/creator', require('./routes/creator'));
app.use('/admin', require('./routes/admin'));
app.use('/courses', require('./routes/courses'));
app.use('/lessons', require('./routes/lessons'));
app.use('/enroll', require('./routes/enrollment'));
app.use('/progress', require('./routes/progress'));
app.use('/certificates', require('./routes/certificates'));

// Health check
app.get('/health', (req, res) => {
  res.json({ message: 'API is working!', status: 'OK' });
});

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'YOUR_FALLBACK_MONGO_URI';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
