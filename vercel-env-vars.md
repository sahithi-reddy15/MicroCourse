# Vercel Environment Variables for MicroCourse LMS

## Required Environment Variables

### Database Configuration
```
MONGODB_URI=mongodb+srv://kumarshah7755_db_user:7CbupWHX0PM1CASc@cluster0.4ql28ug.mongodb.net/microcourse?retryWrites=true&w=majority&appName=Cluster0
```

### JWT Configuration
```
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
```

### Server Configuration
```
PORT=5000
NODE_ENV=production
```

### CORS Configuration
```
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### File Upload Configuration (if using cloud storage)
```
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

### Email Configuration (if implementing email features)
```
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Complete Environment Variables List for Vercel

Copy and paste these into your Vercel project settings:

### Core Variables
```
MONGODB_URI=mongodb+srv://kumarshah7755_db_user:7CbupWHX0PM1CASc@cluster0.4ql28ug.mongodb.net/microcourse?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-at-least-32-characters
PORT=5000
NODE_ENV=production
```

### Frontend URL (Update with your actual Vercel URL)
```
FRONTEND_URL=https://your-app-name.vercel.app
```

### Optional Variables (Add if needed)
```
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Important Notes:

1. **JWT_SECRET**: Generate a strong, random secret key (at least 32 characters)
2. **MONGODB_URI**: Your Atlas connection string (already provided)
3. **FRONTEND_URL**: Update this with your actual Vercel frontend URL after deployment
4. **PORT**: Vercel will automatically set this, but include it for completeness
5. **NODE_ENV**: Set to 'production' for production deployment

## How to Add Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the sidebar
4. Add each variable with its value
5. Make sure to set the environment to "Production" for all variables
6. Click "Save" after adding each variable

## Security Notes:

- Never commit these environment variables to your repository
- Use strong, unique values for JWT_SECRET
- Keep your MongoDB credentials secure
- Consider using Vercel's built-in secrets management for sensitive data

