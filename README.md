# 🎓 MicroCourse LMS - Learning Management System

A full-stack MERN application for online learning with course creation, enrollment, and certificate generation.

## 🚀 Live Demo

**Your app will be live at:** `https://your-app-name.vercel.app` (after deployment)

## ✨ Features

### 👥 User Roles
- **Learner**: Browse courses, enroll, track progress, earn certificates
- **Creator**: Create and manage courses and lessons
- **Admin**: Approve creators, review and publish courses

### 🎯 Core Features
- **Course Management**: Create, edit, and publish courses
- **Video Lessons**: Upload and manage video content
- **Progress Tracking**: Track learning progress
- **Certificates**: Generate PDF certificates upon completion
- **Auto Transcripts**: Automatic transcript generation for videos
- **Responsive Design**: Works on all devices

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **Authentication**: JWT
- **File Upload**: Multer
- **PDF Generation**: jsPDF
- **Deployment**: Vercel

## 📦 Quick Deployment

### 1. Environment Variables for Vercel

Add these to your Vercel project settings:

```
MONGODB_URI=mongodb+srv://kumarshah7755_db_user:7CbupWHX0PM1CASc@cluster0.4ql28ug.mongodb.net/microcourse?retryWrites=true&w=majority&appName=Cluster0
```

```
JWT_SECRET=LMS2024SecretKey!@#$%^&*()_+{}|:<>?[]ABCDEFGHIJKLMNOPQRSTUVWXYZ
```

```
NODE_ENV=production
```

### 2. Deploy to Vercel

1. **Push to GitHub**: Upload this entire folder to GitHub
2. **Connect to Vercel**: Import your GitHub repository
3. **Add Environment Variables**: Use the variables above
4. **Deploy**: Vercel will automatically build and deploy

### 3. Update Frontend URL

After deployment, update `frontend/src/config/axios.js` with your actual Vercel URL.

## 🎮 How to Use

### For Learners:
1. **Sign Up** → Create account
2. **Browse Courses** → View available courses
3. **Enroll** → Join courses you're interested in
4. **Learn** → Watch lessons and track progress
5. **Get Certificate** → Download PDF certificate upon completion

### For Creators:
1. **Apply** → Request creator status
2. **Get Approved** → Wait for admin approval
3. **Create Courses** → Add courses with videos and descriptions
4. **Manage Content** → Edit courses and lessons

### For Admins:
1. **Review Applications** → Approve creator requests
2. **Publish Courses** → Review and publish creator courses
3. **Manage Platform** → Oversee the entire platform

## 🔧 Local Development

```bash
# Install dependencies
npm run install-all

# Start development servers
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📱 Features Overview

### Course Creation
- Upload course thumbnails
- Add detailed descriptions
- Set difficulty levels
- Organize by categories

### Video Lessons
- Upload video content
- Auto-generate transcripts
- Set lesson order
- Track completion

### Progress Tracking
- Visual progress bars
- Lesson completion status
- Course completion tracking
- Certificate generation

### Certificate System
- Professional PDF certificates
- Unique serial numbers
- Download functionality
- Verification system

## 🌟 Key Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live progress tracking
- **Secure Authentication**: JWT-based authentication
- **File Management**: Secure file uploads
- **PDF Generation**: Professional certificates
- **Auto Transcripts**: AI-powered transcript generation
- **Progress Analytics**: Detailed learning analytics

## 🚀 Deployment Status

✅ **Ready for Vercel Deployment**
✅ **MongoDB Atlas Connected**
✅ **Environment Variables Configured**
✅ **PDF Certificate Generation**
✅ **Responsive Design**
✅ **Authentication System**

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Ensure MongoDB Atlas connection is working
4. Check Vercel deployment logs

## 🎉 Success!

Your MicroCourse LMS is now ready for deployment! Follow the steps above to get your live application running on Vercel.

**Happy Learning! 🎓**