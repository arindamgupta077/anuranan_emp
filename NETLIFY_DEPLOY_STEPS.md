# 🚀 Deploy to Netlify - Step by Step Guide

## ✅ Prerequisites Checklist

Before deploying, make sure you have:
- [x] Supabase project setup with database schema
- [x] Database trigger function installed (see `database/recurring-tasks-trigger.sql`)
- [x] GitHub repository with all code pushed
- [ ] Netlify account (free)

---

## 📋 Step-by-Step Deployment

### Step 1: Get Your Supabase Credentials

1. Go to https://supabase.com/dashboard
2. Open your project
3. Go to **Settings** → **API**
4. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (long string starting with `eyJ...`)

Keep these handy - you'll need them in Step 4!

---

### Step 2: Create Netlify Account

1. Go to https://app.netlify.com/
2. Click **"Sign up"**
3. Choose **"Sign up with GitHub"** (recommended)
4. Authorize Netlify to access your GitHub account

---

### Step 3: Import Your Project

1. On Netlify dashboard, click **"Add new site"**
2. Select **"Import an existing project"**
3. Click **"Deploy with GitHub"**
4. Find and select your repository: `anuranan_emp`

---

### Step 4: Configure Build Settings

You'll see a configuration screen. Fill in these values **EXACTLY**:

#### Build Settings:
```
Branch to deploy: main
Base directory: frontend
Build command: npm run build
Publish directory: .next
Functions directory: (leave empty)
```

**Important:** Based on your screenshot, I see you have:
- ✅ Branch: `main` (correct)
- ❌ Base directory: empty (should be `frontend`)
- ✅ Build command: `npm run build` (correct)
- ❌ Publish directory: `frontend/.next` (should be just `.next`)

**Fix these values:**
- **Base directory:** Type `frontend`
- **Publish directory:** Change to `.next` (remove the `frontend/` part)

---

### Step 5: Add Environment Variables

Scroll down to **"Environment variables"** section and click **"Add environment variable"**

Add these TWO variables:

**Variable 1:**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: Paste your Supabase Project URL from Step 1

**Variable 2:**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: Paste your Supabase anon public key from Step 1

---

### Step 6: Deploy!

1. Click **"Deploy anuranan_emp"** button
2. Netlify will now:
   - Install dependencies (2-3 minutes)
   - Build your Next.js app (1-2 minutes)
   - Deploy to CDN (30 seconds)

3. Wait for the build to complete (look for "Site is live" message)

---

### Step 7: Get Your Live URL

1. Once deployed, you'll see your site URL at the top
2. It will look like: `https://random-name-123456.netlify.app`
3. Click on it to open your live site!

---

### Step 8: (Optional) Setup Custom Domain

1. In your Netlify site dashboard, go to **"Domain settings"**
2. Click **"Add custom domain"**
3. Follow the instructions to connect your domain

---

### Step 9: Setup Recurring Tasks Automation

Your app needs to create recurring tasks daily. Choose one option:

#### Option A: GitHub Actions (Recommended - FREE)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add two secrets:

**Secret 1:**
- Name: `SUPABASE_URL`
- Value: Your Supabase Project URL

**Secret 2:**
- Name: `SUPABASE_SERVICE_KEY`
- Value: Go to Supabase → Settings → API → Copy "service_role key"

5. The workflow in `.github/workflows/recurring-tasks.yml` will automatically run daily at 2 AM UTC

#### Option B: Manual (If you prefer)

Run this SQL query in Supabase SQL Editor once a day:
```sql
SELECT create_recurring_tasks();
```

---

## 🎉 Success! Your App is Live

### Test Your Deployment:

1. Visit your Netlify URL
2. Try to login with your test user
3. Create a task
4. Check if data saves to Supabase

### If Something Goes Wrong:

1. In Netlify dashboard, click on your site
2. Go to **"Deploys"** tab
3. Click on the failed deploy
4. Check the build logs for errors
5. Common issues:
   - Environment variables missing
   - Wrong base directory
   - Supabase credentials incorrect

---

## 📱 Bonus: Make it a PWA (Mobile App)

Your app is already PWA-ready! To install on mobile:

1. Open your Netlify URL on a phone browser
2. You'll see "Add to Home Screen" prompt
3. Accept it - now it works like a native app!

---

## 🔄 Future Updates

Whenever you push code to GitHub `main` branch:
1. Netlify will automatically detect the change
2. Build and deploy the new version
3. Live site updates in 3-5 minutes
4. No manual work needed!

---

## 🆘 Need Help?

- Check build logs in Netlify dashboard
- Verify environment variables are correct
- Make sure Supabase URL doesn't have trailing slash
- Ensure you're using `.next` not `frontend/.next` for publish directory

---

## 📊 What You Get (Free Tier):

- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Automatic deployments from GitHub
- ✅ 100GB bandwidth/month
- ✅ 300 build minutes/month
- ✅ Instant rollbacks
- ✅ Branch previews

**Your app is production-ready!** 🚀
