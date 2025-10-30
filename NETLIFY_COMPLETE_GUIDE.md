# 🚀 Netlify Deployment Checklist - Anuranan Employee Portal

## ✅ Pre-Deployment Checklist

### 1. Environment Variables Required
Before deploying, ensure you have these values ready:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key  
- [ ] `NEXT_PUBLIC_API_URL` - Your backend API URL (if using separate backend)
- [ ] `NEXT_PUBLIC_APP_NAME` - Application name (optional)
- [ ] `NEXT_PUBLIC_APP_URL` - Your Netlify site URL (can add after first deploy)

### 2. Repository Setup
- [x] Code pushed to GitHub/GitLab/Bitbucket
- [x] `netlify.toml` configuration file present
- [x] `@netlify/plugin-nextjs` added to package.json
- [x] `_redirects` file in public folder
- [x] `.npmrc` file for build configuration

### 3. Configuration Files
- [x] `next.config.js` - Configured with `output: 'standalone'`
- [x] `netlify.toml` - Build settings configured
- [x] `package.json` - Build scripts ready

---

## 🎯 Deployment Steps

### Step 1: Connect to Netlify

1. Go to https://app.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose your Git provider (GitHub/GitLab/Bitbucket)
4. Authorize Netlify to access your repositories
5. Select the `anuranan_emp` repository

### Step 2: Configure Build Settings

Netlify should auto-detect settings from `netlify.toml`, but verify:

```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/.next
```

**Important:** These settings are already configured in `netlify.toml`, so Netlify should pick them up automatically.

### Step 3: Add Environment Variables

In the Netlify dashboard, go to **Site settings** → **Environment variables** and add:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_APP_NAME=Anuranan Employee Portal
```

### Step 4: Deploy

1. Click **"Deploy site"**
2. Wait 3-5 minutes for the build to complete
3. Check build logs for any errors
4. Your site will be live at: `https://random-name-12345.netlify.app`

### Step 5: Test Deployment

Visit your site and test:
- [ ] Login page loads
- [ ] Can log in successfully
- [ ] Dashboard loads with data
- [ ] Navigation between pages works
- [ ] PWA features work (if enabled)
- [ ] Service worker registers correctly
- [ ] Page refreshes work (not 404)

---

## 🔧 Post-Deployment Configuration

### Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow DNS configuration instructions

### HTTPS/SSL

- Netlify automatically provisions SSL certificates
- Your site will be accessible via HTTPS
- HTTP requests are automatically redirected to HTTPS

### Enable Netlify Functions (If needed)

If you need serverless functions:
1. Create `netlify/functions` folder in your project root
2. Add function files (JavaScript/TypeScript)
3. Redeploy

---

## 🐛 Troubleshooting

### Build Fails

**Issue:** Build fails with dependency errors
**Solution:** 
- Check if all dependencies are in `package.json`
- Clear build cache in Netlify (Site settings → Build & deploy → Clear cache and retry deploy)
- Check Node version compatibility (set to 18 in `netlify.toml`)

### 404 on Page Refresh

**Issue:** Refreshing non-home pages gives 404
**Solution:**
- Verify `_redirects` file exists in `frontend/public/`
- Verify `@netlify/plugin-nextjs` is installed
- Check `netlify.toml` has the plugin configured

### Environment Variables Not Working

**Issue:** App can't connect to Supabase
**Solution:**
- Verify all `NEXT_PUBLIC_*` variables are set in Netlify dashboard
- Redeploy after adding/changing environment variables
- Check variable names match exactly (case-sensitive)

### Slow Build Times

**Issue:** Builds taking too long
**Solution:**
- Enable build plugins caching in `netlify.toml`
- Use `NETLIFY_USE_YARN=true` if you prefer Yarn
- Consider upgrading to paid plan for faster builds

### PWA Not Working

**Issue:** Service worker not registering
**Solution:**
- Check `next-pwa` configuration in `next.config.js`
- Verify `manifest.json` is in public folder
- Ensure HTTPS is enabled (required for PWA)
- Check browser console for errors

---

## 📊 Monitoring & Analytics

### Netlify Analytics (Paid Feature)

Enable in Site settings → Analytics for:
- Page views
- Bandwidth usage
- Performance metrics

### Custom Analytics

You can integrate:
- Google Analytics
- Plausible Analytics
- PostHog
- Mixpanel

Add tracking scripts in `_document.tsx` or use Next.js Script component.

---

## 🔄 Continuous Deployment

Netlify automatically deploys when you push to your connected branch:

1. Push code to GitHub
2. Netlify detects changes
3. Automatically builds and deploys
4. You get notified via email

### Deploy Previews

- Pull requests automatically get deploy previews
- Each PR gets its own URL
- Test changes before merging

### Branch Deploys

You can deploy multiple branches:
- `main` → Production site
- `staging` → Staging site
- `dev` → Development site

Configure in Site settings → Build & deploy → Branch deploys

---

## 📱 Backend Deployment (If Needed)

If you're using the separate Express backend:

### Option 1: Render.com (Recommended)

1. Go to https://render.com
2. Create new Web Service
3. Connect repository
4. Set root directory to `backend`
5. Set build command: `npm install && npm run build`
6. Set start command: `npm start`
7. Add environment variables (Supabase credentials)
8. Deploy

### Option 2: Railway.app

1. Go to https://railway.app
2. Create new project from GitHub
3. Select `backend` directory
4. Add environment variables
5. Deploy

### Update Frontend

After backend deploys, update `NEXT_PUBLIC_API_URL` in Netlify environment variables to your backend URL.

---

## ✅ Final Checklist

- [ ] Site deploys successfully
- [ ] All pages load correctly
- [ ] Authentication works
- [ ] Data loads from Supabase
- [ ] PWA features work (if enabled)
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Custom domain configured (if applicable)
- [ ] Backend API connected (if applicable)
- [ ] Monitoring/analytics set up
- [ ] Continuous deployment working

---

## 🎉 Your Site is Live!

**Site URL:** https://your-site.netlify.app

Share with your team and start using your employee portal!

---

## 📚 Additional Resources

- [Netlify Next.js Documentation](https://docs.netlify.com/frameworks/next-js/)
- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)

---

## 🆘 Need Help?

- Check Netlify build logs for detailed error messages
- Review the existing documentation files in this project
- Contact your team's DevOps support
- Netlify Support: https://answers.netlify.com/

Good luck with your deployment! 🚀
