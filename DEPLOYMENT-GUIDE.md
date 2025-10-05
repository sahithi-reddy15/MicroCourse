# 🚀 Vercel Deployment Guide for MicroCourse LMS

## 📋 **Step-by-Step Deployment Instructions**

### **1. Environment Variables Setup**

Go to your Vercel project dashboard and add these environment variables:

#### **Variable 1: MONGODB_URI**
- **Name:** `MONGODB_URI`
- **Value:** `mongodb+srv://kumarshah7755_db_user:7CbupWHX0PM1CASc@cluster0.4ql28ug.mongodb.net/microcourse?retryWrites=true&w=majority&appName=Cluster0`
- **Environment:** Production

#### **Variable 2: JWT_SECRET**
- **Name:** `JWT_SECRET`
- **Value:** `LMS2024SecretKey!@#$%^&*()_+{}|:<>?[]ABCDEFGHIJKLMNOPQRSTUVWXYZ`
- **Environment:** Production

#### **Variable 3: NODE_ENV**
- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environment:** Production

### **2. Update Frontend Configuration**

After deployment, update the frontend configuration:

1. **Get your Vercel URL** (e.g., `https://your-app-name.vercel.app`)
2. **Update `frontend/src/config/axios.js`**:
   ```javascript
   const baseURL = process.env.NODE_ENV === 'production' 
     ? 'https://your-actual-vercel-url.vercel.app'  // Replace with your actual URL
     : 'http://localhost:5000'
   ```

### **3. Deploy to Vercel**

#### **Option A: GitHub Integration (Recommended)**
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Vercel will automatically deploy

#### **Option B: Vercel CLI**
```bash
npm install -g vercel
vercel login
vercel
```

### **4. Project Structure for Vercel**

Your project should have this structure:
```
MicroCourse/
├── api/
│   ├── index.js          # Vercel API handler
│   └── package.json      # API dependencies
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/              # Not used in Vercel deployment
├── vercel.json          # Vercel configuration
└── package.json         # Root package.json
```

### **5. Important Notes**

#### **API Routes:**
- All API calls will go to `/api/*`
- Backend logic is in `api/index.js`
- Original backend folder is not used in Vercel deployment

#### **Frontend:**
- Built with Vite and served as static files
- API calls configured to use production URL

#### **Database:**
- MongoDB Atlas connection string provided
- All data stored in cloud database

### **6. Testing After Deployment**

1. **Check API endpoints:**
   - `https://your-app.vercel.app/api/courses`
   - Should return JSON data

2. **Test frontend:**
   - `https://your-app.vercel.app`
   - Should load the React app

3. **Test authentication:**
   - Try signing up/logging in
   - Check if data persists

### **7. Troubleshooting**

#### **If you get 404 errors:**
- Check that `vercel.json` is in the root directory
- Ensure `api/index.js` exists
- Verify environment variables are set

#### **If API calls fail:**
- Update the base URL in `frontend/src/config/axios.js`
- Check browser console for CORS errors
- Verify MongoDB connection

#### **If frontend doesn't load:**
- Check that `frontend/package.json` has correct build script
- Ensure Vite build completes successfully

### **8. Final Checklist**

- [ ] Environment variables added to Vercel
- [ ] Code pushed to GitHub
- [ ] Vercel project connected to GitHub
- [ ] Deployment successful
- [ ] Frontend loads correctly
- [ ] API endpoints working
- [ ] Database connection established
- [ ] Authentication working
- [ ] Certificate generation working

## 🎉 **Your MicroCourse LMS is now live on Vercel!**

**Access your app at:** `https://your-app-name.vercel.app`
