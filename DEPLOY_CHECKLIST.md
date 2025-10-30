# 🚀 DEPLOYMENT CHECKLIST

## Before You Start ✅

- [x] Code pushed to GitHub ✅ (Just completed!)
- [x] Serverless transformation complete ✅
- [ ] Supabase credentials ready
- [ ] Netlify account created

---

## 🎯 Quick Deploy (5 Minutes)

### 1️⃣ Get Supabase Credentials (1 min)
Visit: https://supabase.com/dashboard
- [ ] Copy Project URL
- [ ] Copy anon public key

### 2️⃣ Create Netlify Account (1 min)
Visit: https://app.netlify.com/
- [ ] Sign up with GitHub
- [ ] Authorize Netlify

### 3️⃣ Import & Configure (2 min)
- [ ] Click "Add new site" → "Import from GitHub"
- [ ] Select `anuranan_emp` repository
- [ ] **IMPORTANT:** Set these values:
  ```
  Base directory: frontend
  Build command: npm run build
  Publish directory: .next
  ```

### 4️⃣ Add Environment Variables (1 min)
- [ ] Add `NEXT_PUBLIC_SUPABASE_URL` = (your URL)
- [ ] Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your key)

### 5️⃣ Deploy! (3-5 min build time)
- [ ] Click "Deploy" button
- [ ] Wait for build to complete
- [ ] Click your live site URL
- [ ] Test login and features

---

## 🔧 Post-Deployment Setup

### Setup Recurring Tasks (Choose One):

#### Option A: GitHub Actions (Recommended)
- [ ] Go to GitHub repo → Settings → Secrets
- [ ] Add `SUPABASE_URL` secret
- [ ] Add `SUPABASE_SERVICE_KEY` secret
- [ ] Done! Runs daily at 2 AM automatically

#### Option B: Manual
- [ ] Run `SELECT create_recurring_tasks();` daily in Supabase

---

## 📱 Optional: Setup Database Trigger

Run this ONCE in Supabase SQL Editor:

```sql
-- Open database/recurring-tasks-trigger.sql and copy the entire function
-- Paste and run it in Supabase SQL Editor
```

---

## 🎉 You're Done!

Your app will be live at: `https://[your-site].netlify.app`

**Future updates:** Just push to GitHub - Netlify auto-deploys! 🚀

---

## 📖 Full Guide

For detailed steps with screenshots: See `NETLIFY_DEPLOY_STEPS.md`
