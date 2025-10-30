# 🚀 Netlify Deployment Guide - Anuranan Employee Portal

## 📋 Prerequisites

✅ GitHub repository with your code (already done!)
✅ Netlify account (create one at https://netlify.com if you don't have)
✅ Supabase project set up and running
✅ Backend API deployed (see Backend Deployment section)

---

## 🎯 IMPORTANT: Two-Part Deployment

This application has **TWO PARTS** that need to be deployed separately:

1. **Frontend** (Next.js) → Deploy on **Netlify**
2. **Backend** (Express API) → Deploy on **Render** or **Railway**

---

## Part 1️⃣: Deploy Frontend to Netlify

### Step 1: Connect GitHub Repository

1. Go to https://app.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select your repository: `anuranan_emp`

### Step 2: Configure Build Settings

Netlify will auto-detect Next.js, but verify these settings:

```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/.next
```

### Step 3: Add Environment Variables

Click **"Add environment variables"** and add these:

```bash
# Supabase Configuration (REQUIRED)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API URL (REQUIRED - add after deploying backend)
NEXT_PUBLIC_API_URL=https://your-backend-app.onrender.com

# App Configuration
NEXT_PUBLIC_APP_NAME=Anuranan Employee Portal
NEXT_PUBLIC_APP_URL=https://your-site-name.netlify.app
```

### Step 4: Deploy!

1. Click **"Deploy site"**
2. Wait 2-5 minutes for the build to complete
3. Your site will be live at: `https://random-name-12345.netlify.app`

### Step 5: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow instructions to set up your domain

---

## Part 2️⃣: Deploy Backend to Render (Recommended)

### Option A: Render (Recommended - Free Tier Available)

#### Step 1: Create Render Account
1. Go to https://render.com/
2. Sign up with GitHub

#### Step 2: Create New Web Service
1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Select `anuranan_emp`

#### Step 3: Configure Backend Settings

```
Name: anuranan-backend
Region: Choose closest to your users
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

#### Step 4: Add Environment Variables

Click **"Environment"** tab and add:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Server Configuration
PORT=4000
NODE_ENV=production

# CORS Configuration (Your Netlify URL)
FRONTEND_URL=https://your-site-name.netlify.app

# Cron Job Configuration
CRON_SCHEDULE=0 2 * * *

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Step 5: Deploy Backend
1. Click **"Create Web Service"**
2. Wait for deployment (2-5 minutes)
3. Copy your backend URL: `https://anuranan-backend.onrender.com`

#### Step 6: Update Frontend Environment Variable
1. Go back to Netlify dashboard
2. Navigate to **Site settings** → **Environment variables**
3. Update `NEXT_PUBLIC_API_URL` with your Render backend URL
4. Click **"Trigger deploy"** to rebuild frontend with new API URL

---

### Option B: Railway (Alternative)

#### Step 1: Create Railway Account
1. Go to https://railway.app/
2. Sign up with GitHub

#### Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose `anuranan_emp`

#### Step 3: Configure Settings
1. Click on the service
2. Go to **Settings** → **Root Directory**
3. Set to: `backend`
4. Set **Start Command**: `npm start`
5. Set **Build Command**: `npm install && npm run build`

#### Step 4: Add Environment Variables
Same as Render (see above)

#### Step 5: Get Backend URL
Railway will provide a URL like: `https://anuranan-backend.up.railway.app`

---

## 🔐 Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (Backend only)

---

## ✅ Verify Deployment

### Test Frontend:
1. Visit your Netlify URL
2. Try to login
3. Check all pages work

### Test Backend:
1. Visit: `https://your-backend-url.onrender.com/api/health`
2. Should return: `{"status":"ok","message":"Server is running"}`

### Test Integration:
1. Login to the application
2. Create a task
3. Check if data saves properly

---

## 🔧 Post-Deployment Configuration

### Enable Automatic Deploys
Both Netlify and Render/Railway will auto-deploy when you push to GitHub!

### Set Up Custom Domain (Netlify)
1. Go to **Site settings** → **Domain management**
2. Add your domain
3. Update DNS records as instructed

### Monitor Application
- **Netlify**: Site settings → Analytics
- **Render**: Logs tab → View real-time logs
- **Railway**: Deployments → Logs

---

## 🚨 Troubleshooting

### Build Fails on Netlify:
```bash
# Check build logs in Netlify dashboard
# Common issues:
- Missing environment variables
- Node version mismatch
- Dependencies not installing
```

### API Calls Failing:
```bash
# Verify CORS settings in backend
# Check FRONTEND_URL matches your Netlify URL
# Check NEXT_PUBLIC_API_URL in frontend points to backend
```

### Database Connection Issues:
```bash
# Verify Supabase credentials
# Check Supabase project is active
# Verify RLS policies are set up correctly
```

---

## 📊 Deployment Checklist

### Before Deploying:
- [ ] Code pushed to GitHub
- [ ] Supabase project created and configured
- [ ] Database schema migrated
- [ ] RLS policies enabled
- [ ] First user created in database

### Frontend Deployment:
- [ ] Netlify connected to GitHub
- [ ] Build settings configured
- [ ] Environment variables added
- [ ] Site deployed successfully
- [ ] Login page accessible

### Backend Deployment:
- [ ] Render/Railway account created
- [ ] Service created and configured
- [ ] Environment variables added
- [ ] Backend deployed successfully
- [ ] Health endpoint responding

### Integration:
- [ ] Frontend environment updated with backend URL
- [ ] Frontend redeployed
- [ ] CORS configured properly
- [ ] Login working
- [ ] All features tested

---

## 📝 Quick Commands

### Redeploy Frontend (Netlify):
```bash
# Push to GitHub - auto-deploys
git add .
git commit -m "Update frontend"
git push origin main

# Or trigger manual deploy in Netlify dashboard
```

### Redeploy Backend (Render/Railway):
```bash
# Push to GitHub - auto-deploys
git add .
git commit -m "Update backend"
git push origin main
```

### View Logs:
- **Netlify**: Deploys → Click on deployment → View logs
- **Render**: Logs tab
- **Railway**: Deployments → Logs

---

## 🎉 Success!

Your application is now live! 

**Frontend URL**: `https://your-site-name.netlify.app`
**Backend URL**: `https://your-backend.onrender.com`

Share the frontend URL with your team to start using the portal!

---

## 💰 Cost Estimation

### Free Tier (Recommended for MVP):
- **Netlify**: 100GB bandwidth/month, 300 build minutes/month (FREE)
- **Render**: 750 hours/month, sleeps after 15 min inactivity (FREE)
- **Railway**: $5 credit/month (FREE trial)
- **Supabase**: 500MB database, 2GB bandwidth (FREE)

**Total Cost**: $0/month for starting out! 🎉

### Paid Plans (For Production):
- **Netlify Pro**: $19/month (unlimited bandwidth)
- **Render**: $7-25/month (always-on, no sleep)
- **Railway**: Pay-as-you-go (~$10-20/month)
- **Supabase Pro**: $25/month (8GB database, 50GB bandwidth)

**Total Cost**: ~$50-90/month for production use

---

## 🆘 Need Help?

- Check deployment logs in Netlify/Render dashboard
- Review environment variables are correct
- Verify Supabase connection
- Check CORS settings in backend
- Test backend health endpoint
- Review browser console for errors

Good luck with your deployment! 🚀
