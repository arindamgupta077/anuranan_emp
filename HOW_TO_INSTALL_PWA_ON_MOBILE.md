# How to Install PWA on Mobile Devices

## ⚠️ CRITICAL REQUIREMENTS

### 1. **HTTPS is MANDATORY** (Except localhost)
PWAs **CANNOT** be installed over HTTP on mobile devices. You MUST:
- Deploy to a hosting service with HTTPS (Vercel, Netlify, etc.), OR
- Use a tool like **ngrok** to create HTTPS tunnel from your local dev server

### 2. Service Worker Must Be Registered
- PWA is enabled in production builds only
- You need to build and deploy, not just run `npm run dev`

---

## 🚀 Quick Start: Deploy to Vercel (Recommended)

### Step 1: Install Vercel CLI
```powershell
npm install -g vercel
```

### Step 2: Deploy Your App
```powershell
cd c:\VSCODE\anuranan_emp\frontend
vercel
```

### Step 3: Install on Mobile
1. Open the Vercel URL on your mobile browser (e.g., `https://your-app.vercel.app`)
2. Follow device-specific instructions below

---

## 📱 Installation Instructions by Device

### Android (Chrome/Edge)

1. **Open your app URL** in Chrome or Edge browser
2. Look for one of these indicators:
   - **Install prompt** (popup at bottom): Tap "Install" or "Add to Home screen"
   - **Three dots menu** (⋮) → "Install app" or "Add to Home screen"
   - **Share button** → "Add to Home screen"
3. Confirm the installation
4. App icon will appear on your home screen

**Chrome Requirements:**
- Must be HTTPS
- Must have valid manifest.json
- Must have service worker registered
- User must have visited the site at least once

### iOS/iPadOS (Safari)

1. **Open your app URL** in Safari browser (NOT Chrome/other browsers)
2. Tap the **Share button** (square with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Edit the name if desired, then tap **"Add"**
5. App icon will appear on your home screen

**Note:** iOS has limited PWA support:
- Only works in Safari
- No installation prompt (manual only)
- Some features like push notifications may not work

---

## 🧪 Testing on Mobile Using ngrok (Local Development)

If you want to test on your mobile before deploying:

### Step 1: Install ngrok
1. Download from: https://ngrok.com/download
2. Extract to a folder
3. Sign up for free account and get auth token

### Step 2: Start Your Dev Server
```powershell
cd c:\VSCODE\anuranan_emp\frontend
npm run build
npm run start
```

### Step 3: Create HTTPS Tunnel
```powershell
# Assuming Next.js is running on port 3000
ngrok http 3000
```

### Step 4: Access on Mobile
1. ngrok will show a URL like: `https://abc123.ngrok.io`
2. Open this URL on your mobile device
3. Follow device-specific installation steps above

---

## ✅ Verification Checklist

Before testing on mobile, verify:

### 1. Production Build
```powershell
cd c:\VSCODE\anuranan_emp\frontend
npm run build
npm run start
```

### 2. Check Manifest
Open: `http://localhost:3000/manifest.json`
- Should load without errors
- Icons should exist and be accessible

### 3. Check Service Worker
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers**
4. Should show registered service worker

### 4. Check PWA Requirements
1. In DevTools, go to **Lighthouse** tab
2. Select **Progressive Web App** category
3. Click **Generate report**
4. Should pass all PWA checks

### 5. Test HTTPS
- PWA installation only works over HTTPS
- Use ngrok or deploy to production

---

## 🔧 Configuration Check

### Current PWA Settings (`next.config.js`)
```javascript
disable: false  // PWA enabled
register: true  // Auto-register service worker
skipWaiting: true  // Update immediately
```

### Build for Production
```powershell
cd c:\VSCODE\anuranan_emp\frontend
npm run build
npm run start
```

**Important:** Development mode (`npm run dev`) has limited PWA functionality!

---

## 🐛 Troubleshooting

### "Add to Home Screen" doesn't appear (Android)

**Possible causes:**
1. ❌ Not using HTTPS (most common)
   - **Solution:** Use ngrok or deploy to Vercel
   
2. ❌ Service worker not registered
   - **Solution:** Build for production (`npm run build && npm run start`)
   
3. ❌ Manifest errors
   - **Check:** DevTools → Console for errors
   - **Check:** DevTools → Application → Manifest
   
4. ❌ Icons missing or wrong format
   - **Verify:** Icons exist in `/public/icons/` folder
   - **Verify:** Icons are valid PNG files
   
5. ❌ Browser requirements not met
   - Chrome requires user to visit site at least once
   - Wait a few seconds after page load

### iOS Installation Issues

1. ❌ Using Chrome instead of Safari
   - **Solution:** Only Safari supports "Add to Home Screen" on iOS
   
2. ❌ In-app browser (Instagram, Facebook, etc.)
   - **Solution:** Copy URL and open in Safari
   
3. ❌ Private/Incognito mode
   - **Solution:** Use regular Safari window

### Service Worker Not Registering

**Check Console for errors:**
```javascript
// Open browser console and check for:
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Registered workers:', registrations.length);
});
```

**Force re-register:**
1. DevTools → Application → Service Workers
2. Click "Unregister" on all workers
3. Click "Update on reload"
4. Hard refresh (Ctrl+Shift+R)

---

## 📊 Testing PWA Score

### Using Lighthouse (Desktop)
1. Open your app in Chrome
2. Press F12 (DevTools)
3. Go to **Lighthouse** tab
4. Select **Progressive Web App**
5. Click **Generate report**

### PWA Requirements
- ✅ Installable (manifest + service worker)
- ✅ Works offline (service worker caching)
- ✅ Fast and reliable
- ✅ Mobile-friendly
- ✅ HTTPS required

---

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```powershell
npm install -g vercel
cd c:\VSCODE\anuranan_emp\frontend
vercel
```
- Free tier available
- Automatic HTTPS
- Easy deployment
- Custom domain support

### Option 2: Netlify
1. Sign up at netlify.com
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `.next`

### Option 3: Custom Server
- Must have HTTPS certificate
- Configure reverse proxy (nginx/Apache)
- Run: `npm run build && npm run start`

---

## 📋 Quick Command Reference

```powershell
# Build for production
cd c:\VSCODE\anuranan_emp\frontend
npm run build

# Start production server
npm run start

# Test with ngrok (if installed)
ngrok http 3000

# Deploy to Vercel
vercel

# Check service worker registration
# (Run in browser console)
navigator.serviceWorker.getRegistrations()
```

---

## 🆘 Still Having Issues?

### Debug Checklist:
1. ✅ Using HTTPS or localhost
2. ✅ Production build (`npm run build`)
3. ✅ Service worker registered (check DevTools)
4. ✅ Manifest.json accessible
5. ✅ All icons exist and load correctly
6. ✅ No console errors
7. ✅ Lighthouse PWA score > 90

### Get More Info:
```powershell
# Check if build succeeded
cd c:\VSCODE\anuranan_emp\frontend
npm run build

# Look for errors in output
# Service worker should be generated at: public/sw.js
```

### Browser Console Tests:
```javascript
// Check manifest
fetch('/manifest.json').then(r => r.json()).then(console.log)

// Check service worker
navigator.serviceWorker.getRegistrations().then(r => console.log('Workers:', r))

// Check if installable (Chrome only)
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('App is installable!', e);
});
```

---

## 📱 Expected Behavior After Installation

### Android:
- App icon on home screen
- Opens in standalone window (no browser UI)
- Shows splash screen on launch
- Can be found in app drawer

### iOS:
- App icon on home screen
- Opens in standalone window
- Limited features compared to Android
- No splash screen by default

---

## 🔄 Updates

When you deploy a new version:
1. Service worker will detect changes
2. Update downloads in background
3. Shows on next app launch
4. Users don't need to reinstall

---

**Need help?** Check the browser console for specific error messages!
