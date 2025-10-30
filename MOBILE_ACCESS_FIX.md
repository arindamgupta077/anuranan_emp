# Fix: "Failed to load page" on Mobile Device

## Problem
When accessing the app from a mobile device, every page shows "Failed to load page". This happens because the app is trying to connect to `localhost:4000` which doesn't exist on the mobile device.

## Root Cause
- Frontend is configured to connect to `http://localhost:4000` for the backend API
- `localhost` on a mobile device refers to the mobile device itself, not your computer
- Mobile device cannot reach your development backend server

## Solutions

### Solution 1: Use Your Computer's Local IP Address (Recommended for Testing)

#### Step 1: Find Your Computer's IP Address

**On Windows (PowerShell):**
```powershell
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually WiFi or Ethernet).
Example: `192.168.1.100`

**On Mac/Linux:**
```bash
ifconfig | grep "inet "
# or
ip addr show
```

#### Step 2: Update Environment Variables

Create/Edit `c:\VSCODE\anuranan_emp\frontend\.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_API_URL=http://192.168.1.100:4000
```
**Replace `192.168.1.100` with YOUR computer's actual IP address!**

#### Step 3: Update Backend to Accept Connections from Network

**Edit `c:\VSCODE\anuranan_emp\backend\src\server.ts`:**

The server needs to listen on `0.0.0.0` instead of `localhost` to accept network connections.

Find the line with `app.listen` and ensure it's:
```typescript
const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
```

#### Step 4: Allow Firewall Access (Windows)

Windows Firewall might block incoming connections:

**Option A - PowerShell (Run as Administrator):**
```powershell
New-NetFirewallRule -DisplayName "Node.js Backend" -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow
```

**Option B - Windows Defender Firewall GUI:**
1. Search "Windows Defender Firewall with Advanced Security"
2. Click "Inbound Rules" → "New Rule"
3. Select "Port" → Next
4. Select "TCP", enter port `4000` → Next
5. Select "Allow the connection" → Next
6. Check all profiles → Next
7. Name it "Node.js Backend" → Finish

#### Step 5: Ensure Mobile and Computer are on Same Network
- Both devices must be connected to the same WiFi network
- Check that your router doesn't have "AP Isolation" enabled (common in guest networks)

#### Step 6: Restart Services

**Backend:**
```powershell
cd c:\VSCODE\anuranan_emp\backend
# Press Ctrl+C to stop if running
npm run dev
```

**Frontend:**
```powershell
cd c:\VSCODE\anuranan_emp\frontend
# Press Ctrl+C to stop if running
npm run dev
```

#### Step 7: Access from Mobile

1. Find the frontend port (usually 3000 or 3001)
2. On your mobile browser, go to: `http://192.168.1.100:3000` (use YOUR IP)
3. The app should now work!

---

### Solution 2: Deploy Both Frontend and Backend (Production)

For production or easier mobile testing:

#### Option A: Deploy to Vercel + Railway

**Frontend (Vercel):**
```powershell
cd c:\VSCODE\anuranan_emp\frontend
npm install -g vercel
vercel
```

**Backend (Railway):**
1. Go to https://railway.app
2. Sign up and create new project
3. Deploy from GitHub or CLI
4. Railway will provide a URL like: `https://your-app.railway.app`

**Update Frontend Environment:**
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

#### Option B: Deploy to Same Platform

Both frontend and backend can be deployed to:
- **Heroku**
- **Render**
- **DigitalOcean App Platform**
- **AWS/Azure/GCP**

---

### Solution 3: Use ngrok for Both Services (Quick Testing)

If you don't want to expose your local IP:

#### Step 1: Install ngrok
Download from: https://ngrok.com/download

#### Step 2: Create Tunnels

**Terminal 1 - Backend:**
```powershell
ngrok http 4000
```
Note the HTTPS URL: `https://abc123.ngrok.io`

**Terminal 2 - Frontend (if needed):**
```powershell
ngrok http 3000
```

#### Step 3: Update Environment
```env
NEXT_PUBLIC_API_URL=https://abc123.ngrok.io
```

#### Step 4: Access from Mobile
Open the ngrok URL for frontend on your mobile device.

---

## Verification Steps

### 1. Test Backend Accessibility from Mobile

**On your mobile browser, go to:**
```
http://YOUR_COMPUTER_IP:4000/api/health
```

You should see a response (even if it's an error, it means the server is reachable).

### 2. Check Browser Console

**On mobile (Chrome):**
1. Connect phone to computer via USB
2. On computer, open Chrome and go to: `chrome://inspect`
3. Click "Inspect" under your mobile device
4. Check Console tab for errors

**On mobile (Safari/iOS):**
1. Enable "Web Inspector" on iPhone: Settings → Safari → Advanced
2. Connect to Mac
3. On Mac: Safari → Develop → [Your iPhone] → [Your Page]

### 3. Common Errors and Solutions

**Error: "Network Error" or "ERR_CONNECTION_REFUSED"**
- Backend is not running
- Wrong IP address
- Firewall blocking connection
- Devices on different networks

**Error: "Failed to fetch"**
- CORS issue (check backend CORS settings)
- Backend not listening on 0.0.0.0
- Service worker caching old config

**Error: "Cannot read properties of undefined"**
- Supabase environment variables missing
- Check `.env.local` exists with correct values

---

## Quick Reference

### Get Your Local IP
```powershell
# Windows
ipconfig | findstr "IPv4"

# Or more detailed
Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}
```

### Check if Backend is Accessible
```powershell
# From your computer
curl http://localhost:4000/api/health

# From another device on same network (replace IP)
curl http://192.168.1.100:4000/api/health
```

### Restart Everything
```powershell
# Backend
cd c:\VSCODE\anuranan_emp\backend
npm run dev

# Frontend (new terminal)
cd c:\VSCODE\anuranan_emp\frontend
npm run dev
```

---

## Production Deployment Checklist

For production, you should:

- ✅ Deploy backend to a cloud service with HTTPS
- ✅ Deploy frontend to Vercel/Netlify
- ✅ Update `NEXT_PUBLIC_API_URL` to production backend URL
- ✅ Enable HTTPS (required for PWA)
- ✅ Configure CORS properly in backend
- ✅ Set up environment variables in hosting platform
- ✅ Test on mobile device over HTTPS

---

## Example Configuration

### Your Setup Should Look Like:

**Development (Local Network):**
```
Computer IP: 192.168.1.100
Backend: http://192.168.1.100:4000
Frontend: http://192.168.1.100:3000
Mobile Access: http://192.168.1.100:3000
```

**Production:**
```
Backend: https://your-backend.railway.app
Frontend: https://your-app.vercel.app
Mobile Access: https://your-app.vercel.app (installable as PWA)
```

---

## Need More Help?

If you're still having issues:

1. Check what error appears in mobile browser console
2. Verify both services are running: `npm run dev`
3. Confirm you're using the correct IP address
4. Ensure firewall allows the connection
5. Make sure both devices are on the same WiFi network
6. Try accessing from mobile browser: `http://YOUR_IP:4000/api/health`

If the backend test URL works but frontend doesn't, the issue is in the frontend configuration.
If the backend test URL doesn't work, the issue is with network/firewall/backend configuration.
