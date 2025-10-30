# 🔧 Netlify Dashboard Fix - Data Loading Issue on Page Reload

## 🎯 Problem
When you reload any page on your Netlify-deployed URL, data doesn't load from Supabase database.

## 🔍 Root Cause
This is typically caused by:
1. **Wrong publish directory** - Netlify serving static files incorrectly
2. **Missing environment variables** - Supabase credentials not available on page reload
3. **Incorrect build configuration** - Next.js not building with proper SSR/CSR support
4. **Service Worker cache issues** - Old cached data being served

---

## ✅ STEP-BY-STEP FIX IN NETLIFY DASHBOARD

### Step 1: Clear All Caches First 🧹

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Build & deploy** → **Environment**
3. Scroll down and click **"Clear build cache"**
4. Then go to **Deploys** tab
5. Click **"Trigger deploy"** → **"Clear cache and deploy site"**

This ensures no stale builds are interfering.

---

### Step 2: Verify Build Settings ⚙️

Go to **Site settings** → **Build & deploy** → **Build settings**

#### Configure these EXACT settings:

```
Base directory: frontend
Build command: npm run build
Publish directory: frontend/.next
Functions directory: [leave empty]
```

**Important:** The publish directory should be `frontend/.next` NOT just `.next`

#### If you see different settings:
Click **"Edit settings"** and update them to match above.

---

### Step 3: Verify Environment Variables 🔐

Go to **Site settings** → **Environment variables**

#### You MUST have these variables set:

```bash
NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (your anon key)

NEXT_PUBLIC_API_URL
Value: https://your-backend.onrender.com (if using separate backend)
```

#### To add/verify:
1. Click **"Add a variable"** or **"Edit"** for existing ones
2. Enter variable name EXACTLY as shown (case-sensitive!)
3. Paste the value
4. Select scope: **All deploy contexts** (important!)
5. Click **"Create variable"** or **"Save"**

**Critical:** After adding/changing ANY environment variable, you MUST redeploy!

---

### Step 4: Check Build Plugins 🔌

Go to **Site settings** → **Build & deploy** → **Build plugins**

You should see:
- **@netlify/plugin-nextjs** (Essential Next.js support)

#### If it's not there:
1. Click **"Install plugin"**
2. Search for "@netlify/plugin-nextjs"
3. Click **"Install"**

#### If it's already there:
1. Check the version - should be 4.x or 5.x
2. If it's older, remove and reinstall the latest version

---

### Step 5: Configure Deploy Settings 🚀

Go to **Site settings** → **Build & deploy** → **Continuous deployment**

#### Branch deploys:
- **Branch to deploy:** main (or your default branch)
- **Production branch:** main

#### Deploy contexts:
Ensure "Production" is enabled and pointing to your main branch.

---

### Step 6: Add Build Hooks (Optional but Recommended) 🪝

Go to **Site settings** → **Build & deploy** → **Build hooks**

1. Click **"Add build hook"**
2. Name: "Manual Deploy"
3. Branch to build: main
4. Save

This gives you a way to force rebuild when needed.

---

### Step 7: Check Asset Optimization 📦

Go to **Site settings** → **Build & deploy** → **Post processing**

#### Recommended settings:
- **Bundle CSS:** OFF (Next.js handles this)
- **Minify CSS:** OFF (Next.js handles this)
- **Minify JavaScript:** OFF (Next.js handles this)
- **Image optimization:** OFF (Next.js handles this)
- **Pretty URLs:** ON (safe to enable)

These are important because Netlify's post-processing can break Next.js builds.

---

### Step 8: Configure Headers (Already in code, but verify) 📋

Your headers are configured in `netlify.toml`, but you can verify them:

Go to **Site settings** → **Build & deploy** → **Headers**

You should see headers configured from your `netlify.toml` file. If not, they'll be applied on next deploy.

---

### Step 9: Redeploy with Clean Build 🔄

Now that everything is configured:

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** dropdown
3. Select **"Clear cache and deploy site"**
4. Wait for build to complete (usually 2-5 minutes)
5. Watch the build logs for any errors

#### What to look for in build logs:
```
✓ Building...
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

### Step 10: Test After Deploy ✅

Once deployed, test these scenarios:

1. **Fresh load:** Open site in incognito/private window → Login → Should see data
2. **Navigation:** Click between pages → Should work smoothly
3. **Hard refresh:** Press F5 or Ctrl+F5 on any page → Data should reload
4. **Direct URL:** Copy a page URL (like /dashboard), open in new tab → Should work
5. **Browser back/forward:** Use browser navigation → Should maintain state

---

## 🐛 Still Not Working? Try These

### Option A: Switch to Export Mode (SPA Only)

If your app doesn't need SSR (server-side rendering), try static export:

1. Update `frontend/next.config.js`:
```javascript
const nextConfig = {
  // ... other config
  output: 'export',  // Force static export
  images: {
    unoptimized: true, // Required for static export
  },
}
```

2. Update `netlify.toml`:
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "out"  # Change to 'out' for export mode
```

3. Redeploy

**Note:** This removes SSR but makes deployment simpler.

---

### Option B: Disable Service Worker/PWA

The PWA service worker might be caching old data:

1. In `frontend/next.config.js`, verify PWA is disabled:
```javascript
const withPWA = require('next-pwa')({
  disable: process.env.NODE_ENV === 'production', // Should be true
  // ... rest of config
});
```

2. Clear browser cache and service workers:
   - Open DevTools (F12)
   - Go to Application tab
   - Click "Service Workers" → Unregister all
   - Click "Cache Storage" → Delete all
   - Hard refresh (Ctrl+Shift+R)

---

### Option C: Check Supabase Settings

1. Go to your Supabase dashboard
2. Navigate to **Settings** → **API**
3. Verify:
   - URL matches your `NEXT_PUBLIC_SUPABASE_URL`
   - Anon key matches your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Check **Authentication** → **URL Configuration**:
   - Add your Netlify URL to "Site URL"
   - Add your Netlify URL to "Redirect URLs"

Example:
```
Site URL: https://your-site.netlify.app
Redirect URLs: https://your-site.netlify.app/**
```

---

### Option D: Enable Netlify Debug Mode

1. Add this environment variable in Netlify:
   ```
   DEBUG = *
   ```
2. Redeploy
3. Check browser console for detailed logs
4. Check Netlify function logs (if using functions)

---

### Option E: Try Different Publish Directory

If none of the above works, try these publish directories one at a time:

#### Try 1: Static export
```
Build command: npm run build
Publish directory: frontend/out
```

#### Try 2: Standard Next.js
```
Build command: npm run build  
Publish directory: frontend/.next
```

#### Try 3: With explicit path
```
Build command: cd frontend && npm run build
Publish directory: frontend/.next
```

After each change, clear cache and redeploy.

---

## 🔍 Debugging Tips

### Check Browser Console
Press F12 → Console tab, look for:
- ❌ Failed fetch requests to Supabase
- ❌ Missing environment variables (undefined)
- ❌ CORS errors
- ❌ Authentication errors

### Check Network Tab
F12 → Network tab:
- Look for failed requests (red)
- Check if Supabase requests are being made
- Verify response codes (should be 200, not 401/403)

### Check Netlify Function Logs
If you have any Netlify functions:
1. Go to **Functions** tab in Netlify
2. Click on a function
3. View real-time logs

### Enable Verbose Logging

Add to your `_app.tsx` temporarily:
```typescript
useEffect(() => {
  console.log('ENV CHECK:', {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  });
}, []);
```

This will show if environment variables are actually available.

---

## 📞 Common Error Messages & Solutions

### "Missing Supabase environment variables"
**Fix:** Environment variables not set in Netlify dashboard. Add them in Site settings → Environment variables.

### "Failed to fetch" or "NetworkError"
**Fix:** 
- Check Supabase project is active
- Verify Supabase URL/key are correct
- Check if Supabase allows your Netlify domain

### "Session expired" or "Invalid token"
**Fix:**
- Clear browser cookies/cache
- Check Supabase authentication settings
- Verify JWT expiration settings in Supabase

### Page shows blank after reload
**Fix:**
- Wrong publish directory
- Check browser console for errors
- Verify build completed successfully

### "404 Not Found" on page reload
**Fix:**
- Ensure `@netlify/plugin-nextjs` is installed
- Check `_redirects` file isn't breaking routing
- Verify publish directory is correct

---

## ✅ Final Checklist

Before asking for more help, verify:

- [ ] Environment variables are set in Netlify (all 3 required ones)
- [ ] Build settings are correct (base, command, publish)
- [ ] @netlify/plugin-nextjs is installed and active
- [ ] Cleared Netlify build cache
- [ ] Deployed with "Clear cache and deploy site"
- [ ] Supabase credentials are correct and active
- [ ] Your Netlify URL is added to Supabase allowed domains
- [ ] Browser cache is cleared
- [ ] Service workers are unregistered
- [ ] Tested in incognito/private window
- [ ] Build logs show no errors
- [ ] Browser console shows no errors

---

## 🆘 If Nothing Works

1. **Try deploying to a different Netlify site**
   - Sometimes sites get corrupted
   - Create a new site in Netlify
   - Connect same repo
   - Configure from scratch

2. **Try a different platform temporarily**
   - Vercel (better Next.js support)
   - Railway
   - Render

3. **Contact support**
   - Netlify Support: https://answers.netlify.com/
   - Share your build logs
   - Share browser console errors
   - Share site URL

---

## 🎯 Quick Win Solution

If you're in a hurry and need it working NOW:

1. **Change to static export mode:**

Edit `frontend/next.config.js`:
```javascript
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
  // Remove all PWA config temporarily
};
module.exports = nextConfig; // Don't use withPWA wrapper
```

2. **Update netlify.toml:**
```toml
[build]
  base = "frontend"
  command = "npm run build"
  publish = "out"
```

3. **Deploy:** Clear cache and redeploy

This sacrifices SSR but gets your app working on Netlify immediately.

---

## 📚 Additional Resources

- [Netlify Next.js Docs](https://docs.netlify.com/frameworks/next-js/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)
- [Netlify Build Debugging](https://docs.netlify.com/configure-builds/troubleshooting-tips/)

Good luck! 🚀
