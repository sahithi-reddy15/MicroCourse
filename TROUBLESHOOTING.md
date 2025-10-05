# 🔧 Vercel 404 Error - Complete Fix Guide

## 🚨 **If You're Getting 404 Errors**

### **Step 1: Check Your Project Structure**

Make sure your GitHub repository has this exact structure:

```
MicroCourse-LMS/
├── api/
│   ├── index.js
│   ├── test.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── routes/
│   ├── models/
│   └── server.js
├── vercel.json
├── .gitignore
└── README.md
```

### **Step 2: Test Your API Endpoints**

After deployment, test these URLs:

1. **Health Check**: `https://your-app.vercel.app/api/health`
2. **Test Endpoint**: `https://your-app.vercel.app/api/test`
3. **Courses API**: `https://your-app.vercel.app/api/courses`

### **Step 3: Common Fixes**

#### **Fix 1: Update Vercel Configuration**

If you're still getting 404, try this simpler `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

#### **Fix 2: Check Environment Variables**

Make sure these are set in Vercel:

```
MONGODB_URI=mongodb+srv://kumarshah7755_db_user:7CbupWHX0PM1CASc@cluster0.4ql28ug.mongodb.net/microcourse?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=LMS2024SecretKey!@#$%^&*()_+{}|:<>?[]ABCDEFGHIJKLMNOPQRSTUVWXYZ
NODE_ENV=production
```

#### **Fix 3: Redeploy**

1. Go to Vercel dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click "Redeploy" on the latest deployment

### **Step 4: Debug Steps**

#### **Check Vercel Logs:**
1. Go to Vercel dashboard
2. Click on your project
3. Go to "Functions" tab
4. Check for any error messages

#### **Test API Manually:**
1. Open browser
2. Go to `https://your-app.vercel.app/api/health`
3. Should return: `{"message":"API is working!","status":"OK"}`

### **Step 5: Alternative Deployment Method**

If Vercel is still giving issues, try this approach:

#### **Option A: Separate Frontend/Backend**

1. **Deploy Backend to Vercel** (API only)
2. **Deploy Frontend to Netlify** (Static site)
3. **Update frontend config** to point to Vercel API

#### **Option B: Use Railway/Render**

1. **Deploy to Railway**: https://railway.app
2. **Deploy to Render**: https://render.com
3. **Both support full-stack apps better**

### **Step 6: Quick Test Commands**

Test these URLs after deployment:

```bash
# Test API health
curl https://your-app.vercel.app/api/health

# Test courses endpoint
curl https://your-app.vercel.app/api/courses

# Test with authentication
curl -H "Authorization: Bearer YOUR_TOKEN" https://your-app.vercel.app/api/progress
```

### **Step 7: Final Checklist**

- [ ] All files uploaded to GitHub
- [ ] Environment variables set in Vercel
- [ ] Project structure is correct
- [ ] API endpoints are working
- [ ] Frontend builds successfully
- [ ] MongoDB connection is working

### **Step 8: If Still Not Working**

#### **Try This Simple Fix:**

1. **Delete the current Vercel project**
2. **Create a new Vercel project**
3. **Import from GitHub again**
4. **Add environment variables**
5. **Deploy**

#### **Or Use This Alternative:**

Deploy to **Railway** instead:
1. Go to https://railway.app
2. Connect your GitHub
3. Deploy your project
4. Add environment variables
5. Get your live URL

## 🎯 **Expected Results**

After fixing, you should see:

- ✅ **API Working**: `https://your-app.vercel.app/api/health`
- ✅ **Frontend Loading**: `https://your-app.vercel.app/`
- ✅ **Database Connected**: No connection errors
- ✅ **Authentication Working**: Can sign up/login
- ✅ **All Features Working**: Courses, lessons, certificates

## 🆘 **Still Having Issues?**

If you're still getting 404 errors:

1. **Check Vercel logs** for specific error messages
2. **Try the alternative deployment methods** above
3. **Make sure all files are in the correct structure**
4. **Verify environment variables are set correctly**

**Your app WILL work - we just need to get the deployment right! 🚀**
