# PWA Setup Guide

## Changes Made

### 1. Enabled PWA in Development
- Modified `next.config.js` to set `disable: false` instead of disabling in development mode
- PWA is now enabled in all environments

### 2. Fixed Viewport Meta Tag Warning
- Removed viewport meta tag from `_document.tsx` (it should only be in `_app.tsx`)
- Added proper PWA meta tags for mobile installation

### 3. Created App Icons
- Generated placeholder SVG icons (192x192 and 512x512)
- Updated `manifest.json` to reference the icons

### 4. Updated Manifest
- Configured proper icon references
- Set display mode to "standalone" for app-like experience

## How to Install on Mobile

### Android (Chrome/Edge)
1. Open http://localhost:3000 (or your deployed URL) in Chrome
2. Tap the menu (3 dots) → "Install app" or "Add to Home screen"
3. The app will appear on your home screen

### iOS (Safari)
1. Open the website in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Name the app and tap "Add"

## Testing PWA

### Check PWA Status
1. Open DevTools (F12)
2. Go to Application tab → Manifest
3. Verify manifest is loaded correctly
4. Check Service Worker registration

### Lighthouse PWA Audit
1. Open DevTools → Lighthouse tab
2. Select "Progressive Web App"
3. Click "Generate report"
4. Address any issues found

## Production Deployment

For production, consider:
1. **Replace placeholder icons** with your actual logo
   - Use https://realfavicongenerator.net/ for professional icon generation
   - Create PNG versions (required for iOS)
   
2. **Enable PWA only in production** (optional):
   ```javascript
   disable: process.env.NODE_ENV === 'development'
   ```

3. **HTTPS Required**: PWA requires HTTPS in production (except localhost)

4. **Test on real devices** before launch

## Current Icon Status

✓ Basic SVG icons created (192x192, 512x512)
⚠ Recommended: Create PNG versions for better compatibility
⚠ Recommended: Replace with your actual brand logo

## Troubleshooting

### App not showing install prompt?
- Clear browser cache and reload
- Ensure you're on HTTPS (or localhost)
- Check DevTools console for errors
- Verify manifest.json is accessible

### Service Worker not registering?
- Check `public/sw.js` was generated after build
- Clear Application → Storage → "Clear site data"
- Restart dev server

### Icons not displaying?
- Verify files exist in `/public/icons/`
- Check file paths in manifest.json
- Try hard refresh (Ctrl+Shift+R)
