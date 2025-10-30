# 🚀 Quick Deployment Steps

## ⚡ Fast Track (10 Minutes)

### 1. Deploy Backend First (Render)

1. Go to https://render.com/ and sign up with GitHub
2. Click **"New"** → **"Web Service"**
3. Select your `anuranan_emp` repository
4. Configure:
   - **Name**: `anuranan-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   
5. Add Environment Variables (click "Environment"):
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   PORT=4000
   NODE_ENV=production
   FRONTEND_URL=https://your-site.netlify.app
   CRON_SCHEDULE=0 2 * * *
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

6. Click **"Create Web Service"**
7. Wait 2-5 minutes, then copy your backend URL (e.g., `https://anuranan-backend.onrender.com`)

---

### 2. Deploy Frontend (Netlify)

1. Go to https://app.netlify.com/ and sign up
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub and select `anuranan_emp`
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next`

5. Add Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_API_URL=https://anuranan-backend.onrender.com
   NEXT_PUBLIC_APP_NAME=Anuranan Employee Portal
   NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
   ```

6. Click **"Deploy site"**
7. Wait 2-5 minutes for build to complete
8. Copy your Netlify URL (e.g., `https://anuranan-portal.netlify.app`)

---

### 3. Update Backend CORS

1. Go back to Render dashboard
2. Click on your backend service
3. Go to **Environment** tab
4. Update `FRONTEND_URL` with your actual Netlify URL
5. Click **"Save Changes"** (will auto-redeploy)

---

### 4. Test Your Deployment

1. Visit your Netlify URL
2. Try to login
3. Create a task
4. Check if everything works!

---

## 🔑 Where to Find Supabase Keys

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (SUPABASE_URL)
   - **anon public** key (SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY)

---

## ✅ Verification Checklist

- [ ] Backend deployed on Render
- [ ] Backend health check working: `https://your-backend.onrender.com/health`
- [ ] Frontend deployed on Netlify
- [ ] Frontend loads without errors
- [ ] Login page accessible
- [ ] Can login successfully
- [ ] Dashboard loads
- [ ] Tasks can be created
- [ ] All pages working

---

## 🎉 Done!

Your app is live! Share the Netlify URL with your team.

**Note**: Free tier backends sleep after 15 minutes of inactivity. First request after sleep may take 30-60 seconds to wake up.

For detailed instructions, see `NETLIFY_DEPLOYMENT_GUIDE.md`
