# ⚠️ URGENT: Fix "Failed to load page" on Mobile

## Your Computer's IP Address
Based on your network configuration:
- **Wi-Fi IP: `192.168.0.183`** ← Use this for mobile access
- Ethernet IP: `192.168.56.1` (virtual adapter, ignore)

---

## Quick Fix Steps

### Step 1: Update Frontend Environment Variable

Edit `c:\VSCODE\anuranan_emp\frontend\.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_API_URL=http://192.168.0.183:4000
```

**⚠️ IMPORTANT:** Replace the Supabase values with your actual credentials!

### Step 2: Allow Firewall Access

**Run PowerShell as Administrator** and execute:

```powershell
New-NetFirewallRule -DisplayName "Node Backend 4000" -Direction Inbound -Protocol TCP -LocalPort 4000 -Action Allow
New-NetFirewallRule -DisplayName "Next Frontend 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow
New-NetFirewallRule -DisplayName "Next Frontend 3001" -Direction Inbound -Protocol TCP -LocalPort 3001 -Action Allow
```

### Step 3: Restart Backend

```powershell
cd c:\VSCODE\anuranan_emp\backend
# Press Ctrl+C if already running
npm run dev
```

**You should see:**
```
Network: http://192.168.0.183:4000
```

### Step 4: Restart Frontend

```powershell
cd c:\VSCODE\anuranan_emp\frontend
# Press Ctrl+C if already running
npm run dev
```

### Step 5: Access from Mobile

1. **Ensure your mobile device is on the same Wi-Fi network**
2. **Open mobile browser and go to:**
   ```
   http://192.168.0.183:3000
   ```
   (or port 3001 if 3000 was already in use)

3. **The app should now work!**

---

## Testing Backend Connectivity

To verify the backend is accessible from your mobile:

**On mobile browser, go to:**
```
http://192.168.0.183:4000/health
```

**You should see:**
```json
{
  "status": "ok",
  "timestamp": "...",
  "environment": "development"
}
```

If you see this, the backend is accessible and the issue is in the frontend configuration.

---

## Troubleshooting

### ❌ "Cannot connect" or "ERR_CONNECTION_REFUSED"

**Check 1: Both devices on same WiFi?**
- Computer and mobile must be on the same WiFi network
- NOT guest network (guest networks usually have AP isolation)

**Check 2: Firewall rules added?**
Run the firewall commands from Step 2 (as Administrator)

**Check 3: Backend is running?**
The backend should show: `Network: http://192.168.0.183:4000`

**Check 4: IP address changed?**
Your computer's IP might change. Re-run to check:
```powershell
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" }
```

### ❌ "Failed to load page" still appears

**Check 1: Clear browser cache on mobile**
- Android Chrome: Settings → Privacy → Clear browsing data
- iOS Safari: Settings → Safari → Clear History and Website Data

**Check 2: Verify .env.local is correct**
The file should have:
```env
NEXT_PUBLIC_API_URL=http://192.168.0.183:4000
```

**Check 3: Restart everything**
Stop both servers (Ctrl+C), update .env.local, restart both servers

**Check 4: Hard refresh on mobile**
- Android: Menu → Settings → Site settings → Clear data for this site
- iOS: Hold refresh button → "Request Desktop Website"

---

## For Production (PWA Installation)

The above steps are for **development/testing only**. 

For production and PWA installation on mobile:
1. Deploy frontend to **Vercel** (free, automatic HTTPS)
2. Deploy backend to **Railway** or **Render** (free tier available)
3. Update `NEXT_PUBLIC_API_URL` to production backend URL
4. PWA will be installable over HTTPS

See: `HOW_TO_INSTALL_PWA_ON_MOBILE.md` for deployment instructions.

---

## Quick Commands Reference

```powershell
# Check your IP address
Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" }

# Start backend
cd c:\VSCODE\anuranan_emp\backend
npm run dev

# Start frontend
cd c:\VSCODE\anuranan_emp\frontend
npm run dev

# Test backend from another terminal
curl http://192.168.0.183:4000/health
```

---

## What Changed?

✅ Backend now listens on `0.0.0.0` (accepts network connections)
✅ Backend CORS updated to allow local network IPs
✅ Backend shows network IP address on startup
✅ Documentation created with step-by-step instructions

---

## Need More Help?

1. Check the error in mobile browser console (use Chrome remote debugging)
2. Verify backend is accessible: `http://192.168.0.183:4000/health`
3. Ensure .env.local has the correct IP address
4. Confirm firewall rules are added
5. Make sure both devices are on the same WiFi network

**Your IP: `192.168.0.183`**
**Backend URL: `http://192.168.0.183:4000`**
**Frontend URL: `http://192.168.0.183:3000`**
