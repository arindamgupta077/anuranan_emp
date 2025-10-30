# PWA Installation Guide

## Current Status
✅ PWA is enabled
✅ Service worker registered
✅ Manifest configured
⚠️  Icons are SVG (works on Android, limited iOS support)

## Why Can't I Install on Mobile?

### Issue: Icon Format
- **iOS requires PNG icons** (doesn't support SVG in manifest)
- Android accepts SVG but PNG is preferred
- Current icons are SVG format

## Solutions

### Option 1: Quick Fix - Use Online Tool (Recommended)
1. Visit: https://realfavicongenerator.net/
2. Upload any logo/image (or create one)
3. Generate all icons
4. Download the package
5. Copy `android-chrome-192x192.png` → `frontend/public/icons/icon-192x192.png`
6. Copy `android-chrome-512x512.png` → `frontend/public/icons/icon-512x512.png`
7. Copy `apple-touch-icon.png` → `frontend/public/icons/apple-touch-icon.png`
8. Update `manifest.json` to use `.png` extensions
9. Restart dev server

### Option 2: Use Favicon.io
1. Visit: https://favicon.io/favicon-generator/
2. Settings:
   - Text: `A`
   - Background: `#14b8a6` (teal)
   - Font: Inter or Arial
   - Shape: Rounded
3. Download and extract
4. Rename files as mentioned in Option 1

### Option 3: Manual Canvas Method
1. Visit: http://localhost:3000/generate-icons.html (while dev server runs)
2. Click download buttons for each size
3. Save files to `frontend/public/icons/`

### Option 4: Use Design Software
- **Figma**: Export 192x192 and 512x512 PNG
- **Photoshop/GIMP**: Create squares with your logo
- **Canva**: Use icon template

## After Creating PNG Icons

### Update manifest.json:
```json
"icons": [
  {
    "src": "/icons/icon-192x192.png",
    "sizes": "192x192",
    "type": "image/png",
    "purpose": "any maskable"
  },
  {
    "src": "/icons/icon-512x512.png",
    "sizes": "512x512",
    "type": "image/png",
    "purpose": "any maskable"
  }
]
```

### Update _document.tsx:
```tsx
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
```

## Testing Installation

### Android (Chrome/Edge)
1. Connect phone to same network as dev PC
2. Find your PC's IP: `ipconfig` (look for IPv4, e.g., 192.168.0.x)
3. On phone, open: `http://YOUR_PC_IP:3000`
4. Tap menu (⋮) → "Install app" or "Add to Home screen"

### iOS (Safari)
1. Same network setup as Android
2. Open URL in Safari (not Chrome!)
3. Tap Share button (⬆️)
4. Scroll and tap "Add to Home Screen"
5. **Note**: iOS is strict about HTTPS in production

## Troubleshooting

### Install button not showing?
- ✅ Clear browser cache (Settings → Clear browsing data)
- ✅ Check DevTools → Application → Manifest (no errors?)
- ✅ Ensure icons are PNG format
- ✅ Try incognito/private mode
- ✅ On iOS, MUST use Safari browser

### Manifest errors?
```bash
# Check manifest is valid
curl http://localhost:3000/manifest.json

# Check icons exist
curl -I http://localhost:3000/icons/icon-192x192.svg
```

### Service worker not working?
1. DevTools → Application → Service Workers
2. Click "Unregister"
3. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Check Console for errors

## Network Access for Mobile Testing

Your app is accessible at:
- **Local**: http://localhost:3000
- **Network**: http://192.168.0.183:3000 (your current IP)

To find your IP:
```powershell
ipconfig | findstr IPv4
```

## Production Checklist

Before deploying:
- [ ] Convert all icons to PNG format
- [ ] Test on real Android device
- [ ] Test on real iOS device (Safari)
- [ ] Verify HTTPS is enabled (required for PWA)
- [ ] Run Lighthouse audit
- [ ] Test offline functionality
- [ ] Verify all manifest fields

## Quick Commands

```powershell
# Generate icons (current method - SVG)
node scripts/create-icons.js

# Check what's in icons folder
ls public/icons/

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Resources

- [PWA Builder](https://www.pwabuilder.com/)
- [Real Favicon Generator](https://realfavicongenerator.net/)
- [Favicon.io](https://favicon.io/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Can I Use - Service Workers](https://caniuse.com/serviceworkers)

## Current Icon Status

| Icon | Format | Size | Status |
|------|--------|------|--------|
| icon-192x192 | SVG | 192x192 | ✅ Created |
| icon-512x512 | SVG | 512x512 | ✅ Created |
| apple-touch-icon | SVG | 180x180 | ✅ Created |
| Needs PNG | ❌ | All sizes | **Action required** |

**Next Step**: Create PNG versions using Option 1 or 2 above!