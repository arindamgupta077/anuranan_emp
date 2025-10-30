# Fix: "Failed to load page" Error

## Problem
Every page shows "Failed to load page" error. This is caused by the service worker (PWA) caching old/corrupted content.

## Solution

### Option 1: Use the Cache Cleaner Page (Easiest)
1. Navigate to: `http://localhost:3001/clear-cache`
2. Wait for the automatic cleanup to complete
3. You'll be redirected to the home page automatically
4. Refresh the page (F5)

### Option 2: Manual Browser Cleanup
1. **Open Developer Tools**: Press `F12` or right-click → Inspect
2. **Go to Application Tab**: Click on "Application" in the top menu
3. **Clear Storage**: 
   - In the left sidebar, click "Clear storage" or "Storage"
   - Check all boxes (Service Workers, Cache Storage, Local Storage, etc.)
   - Click "Clear site data" button
4. **Unregister Service Workers**:
   - Still in Application tab, click "Service Workers" in left sidebar
   - Click "Unregister" for each service worker listed
5. **Close Browser Completely**: Exit and restart your browser
6. **Clear Browser Cache**: 
   - Chrome/Edge: `Ctrl + Shift + Delete`
   - Select "Cached images and files" and "Cookies and site data"
   - Choose "All time"
   - Click "Clear data"

### Option 3: Hard Refresh
1. **Stop the server**: Press `Ctrl + C` in the terminal
2. **Clear Next.js build cache**:
   ```powershell
   cd c:\VSCODE\anuranan_emp\frontend
   Remove-Item -Recurse -Force .next
   Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
   ```
3. **Restart the dev server**:
   ```powershell
   npm run dev
   ```
4. **In browser**: Press `Ctrl + Shift + R` (hard refresh)

## Prevention
The issue has been fixed in `next.config.js` by disabling PWA in development mode. PWA will only be active in production builds.

## Verification
After clearing the cache:
1. Open `http://localhost:3001`
2. You should see the login page
3. Check Developer Tools → Console for any errors
4. Check Developer Tools → Application → Service Workers should show "No service workers" or inactive workers

## If Issue Persists

### Check if server is running:
```powershell
cd c:\VSCODE\anuranan_emp\frontend
npm run dev
```

### Check for port conflicts:
- Default port is 3000
- If in use, Next.js will try 3001, 3002, etc.
- Look for the "Local: http://localhost:XXXX" message

### Check environment variables:
Make sure `.env.local` exists with correct Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Backend connection:
Ensure backend is running on `http://localhost:5000`:
```powershell
cd c:\VSCODE\anuranan_emp\backend
npm run dev
```

## Technical Details
- **Root Cause**: PWA was enabled in development (`disable: false`)
- **Fix Applied**: Changed to `disable: process.env.NODE_ENV === 'development'`
- **Impact**: Service worker and caching disabled during development, enabled in production
- **Files Modified**: 
  - `frontend/next.config.js`
  - Added `frontend/pages/clear-cache.tsx` (utility page)

## Additional Tips
- Use Incognito/Private browsing mode to avoid cache issues during development
- Use `npm run build` and `npm run start` to test PWA functionality in production mode
- Service workers persist even after closing the browser - always unregister them when troubleshooting
