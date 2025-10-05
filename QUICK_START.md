# 🚀 Quick Start Guide - MicroCourses LMS

## ✅ Installation Complete!

All dependencies have been installed and the project is ready to run.

## 🎯 Next Steps

### 1. Start MongoDB
Make sure MongoDB is running on `localhost:27017`
- If you don't have MongoDB installed, download it from: https://www.mongodb.com/try/download/community
- Or use MongoDB Atlas (cloud): Update the connection string in `backend/.env`

### 2. Start the Application
```bash
npm run dev
```

This will start:
- **Backend API**: https://microcourse.onrender.com/
- **Frontend App**: http://localhost:3000

### 3. Access the Application
Open your browser and go to: **http://localhost:3000**

## 👥 Test User Accounts

### Create Test Users:
1. **Admin User**: Sign up with role "admin"
2. **Creator User**: Sign up with role "learner", then apply to become creator
3. **Learner User**: Sign up with role "learner"

## 🧪 Test the MVP Flow

1. **Sign up as Admin** → Approve creator applications
2. **Sign up as Creator** → Apply to become creator → Create courses
3. **Sign up as Learner** → Browse courses → Enroll → Complete lessons → Earn certificates

## 📱 Features Available

### For Learners:
- Browse and enroll in published courses
- View lessons with video player
- Track progress and completion
- Earn certificates upon completion

### For Creators:
- Apply to become a creator
- Create and manage courses
- Add lessons with video uploads
- Submit courses for review

### For Admins:
- Review creator applications
- Approve/reject creators
- Review and publish courses
- Manage platform content

## 🔧 Troubleshooting

### If MongoDB connection fails:
- Check if MongoDB is running: `mongod --version`
- Update connection string in `backend/.env`
- For MongoDB Atlas, use: `mongodb+srv://username:password@cluster.mongodb.net/microcourses`

### If ports are busy:
- Backend runs on port 5000 (change in `backend/.env`)
- Frontend runs on port 3000 (change in `frontend/vite.config.js`)

## 🎉 You're Ready!

The MicroCourses LMS is now fully set up and ready to use. Enjoy building your learning platform!

