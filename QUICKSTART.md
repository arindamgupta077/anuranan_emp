# 🚀 Quick Start Guide - Anuranan Employee Portal

This guide will help you set up and run the Anuranan Employee Portal in under 15 minutes.

---

## ✅ Prerequisites Checklist

Before starting, make sure you have:

- [ ] **Node.js v18+** installed ([Download](https://nodejs.org/))
- [ ] **npm** or **yarn** package manager
- [ ] **Supabase account** ([Sign up free](https://supabase.com/))
- [ ] **Git** installed
- [ ] Code editor (VS Code recommended)

---

## 📥 Step 1: Get the Code

```powershell
# Clone the repository
git clone https://github.com/yourusername/anuranan-emp.git

# Navigate to project directory
cd anuranan-emp
```

---

## 🗄️ Step 2: Set Up Database (5 minutes)

### 2.1 Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click **"New Project"**
3. Fill in:
   - **Name:** Anuranan Portal
   - **Database Password:** (generate strong password)
   - **Region:** Choose closest to you
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

### 2.2 Run Database Schema

1. In Supabase Dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open `database/schema.sql` from the project
4. Copy **ALL** contents and paste into SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. Wait for success message ✅

### 2.3 Create First Admin User

1. In Supabase Dashboard, go to **Authentication > Users**
2. Click **"Add User"** > **"Create new user"**
3. Enter:
   - **Email:** `ceo@anuranan.local` (or your email)
   - **Password:** Create a strong password
   - **Auto Confirm:** Check this box
4. Click **"Create user"**
5. **Copy the User ID** (UUID shown after creation)
6. Go back to **SQL Editor**
7. Run this query (replace `YOUR_USER_UUID_HERE`):

```sql
INSERT INTO employees (auth_user_id, full_name, email, role_id, active)
VALUES (
  'YOUR_USER_UUID_HERE',
  'Admin CEO',
  'ceo@anuranan.local',
  (SELECT id FROM roles WHERE name = 'CEO'),
  TRUE
);
```

8. Click **"Run"** ✅

---

## 🔑 Step 3: Get API Keys

1. In Supabase Dashboard, go to **Settings > API**
2. Find these values:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon public** key (long string starting with `eyJhbGci...`)
   - **service_role** key (another long string)
3. **Keep this tab open** - you'll need these in the next step

---

## ⚙️ Step 4: Configure Backend (2 minutes)

```powershell
# Navigate to backend folder
cd backend

# Install dependencies
npm install
```

Create a file named `.env` in the `backend` folder:

```env
# Paste your values from Step 3
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server settings
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Cron job (runs daily at 2 AM)
CRON_SCHEDULE=0 2 * * *

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Start the backend:**

```powershell
npm run dev
```

You should see:
```
╔═══════════════════════════════════════════════╗
║   Anuranan Employee Portal API Server        ║
║   Port: 4000                                  ║
╚═══════════════════════════════════════════════╝
```

✅ **Keep this terminal running!**

---

## 🎨 Step 5: Configure Frontend (2 minutes)

Open a **NEW terminal window** (keep backend running):

```powershell
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install
```

Create a file named `.env.local` in the `frontend` folder:

```env
# Same Supabase values from Step 3
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000

# App details
NEXT_PUBLIC_APP_NAME=Anuranan Employee Portal
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Start the frontend:**

```powershell
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

✅ **Keep this terminal running too!**

---

## 🎉 Step 6: Login & Test

1. Open your browser and go to: **http://localhost:3000**
2. You should see the login page
3. Enter:
   - **Email:** `ceo@anuranan.local` (or the email you used)
   - **Password:** The password you set
4. Click **"Sign In"**

**Success!** You should now see the dashboard! 🎊

---

## ✨ What's Next?

### Add More Employees

1. Go to **Admin Panel** (CEO only)
2. Click **"Add Employee"**
3. Fill in:
   - Full name
   - Email
   - Role (Manager, Teacher, etc.)
   - Initial password
4. New employee can now login!

### Create Your First Task

1. Go to **Tasks** page
2. Click **"Create Task"**
3. Fill in:
   - Task title
   - Description
   - Assign to an employee
   - Due date
4. Task appears in assigned employee's task list

### Try Recurring Tasks

1. When creating a task, check **"Recurring"**
2. Choose:
   - **Weekly** - Select day of week
   - **Monthly** - Select day of month
3. Tasks will be auto-created by the system!

### Log Self Tasks

1. Go to **Self Tasks**
2. Click **"Add Self Task"**
3. Enter date and what you did
4. CEO can view all employee self-tasks

### Request Leave

1. Go to **Leaves**
2. Click **"Request Leave"**
3. Enter start date, end date, reason
4. CEO can view all leave requests

### View Reports

1. Go to **Reports** (CEO only)
2. See:
   - Employee performance
   - Task completion rates
   - Leave statistics
3. Export to CSV for further analysis

---

## 📱 Install as Mobile App (PWA)

### On Android:

1. Open the app in **Chrome**
2. Tap **menu (⋮)** > **"Install app"**
3. Confirm installation
4. App appears on home screen! 📲

### On iOS:

1. Open the app in **Safari**
2. Tap **Share button** (square with arrow)
3. Scroll and tap **"Add to Home Screen"**
4. Name it and tap **"Add"**
5. App appears on home screen! 📲

### On Desktop:

1. Open in **Chrome** or **Edge**
2. Look for **install icon (+)** in address bar
3. Click and confirm
4. App opens in its own window! 💻

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `Cannot find module...`

```powershell
cd backend
Remove-Item -Recurse -Force node_modules
npm install
npm run dev
```

### Frontend shows errors

**Error:** Type errors or build failures

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules, .next
npm install
npm run dev
```

### Can't login

**Issue:** "Invalid credentials" or "Employee not found"

1. Check you created the employee record in SQL (Step 2.3)
2. Verify email matches exactly
3. Check Supabase Dashboard > Authentication > Users shows the user
4. Ensure employee record has correct `auth_user_id`

### Database errors

**Issue:** "relation does not exist"

- Go back to Step 2.2 and re-run the entire `schema.sql`
- Make sure you ran **ALL** of it, not just parts

### Port already in use

**Error:** `EADDRINUSE: address already in use :::4000`

```powershell
# Windows: Kill process on port 4000
netstat -ano | findstr :4000
taskkill /PID <PID_NUMBER> /F

# Or change port in backend/.env:
PORT=4001
```

---

## 🎯 Quick Commands Reference

### Backend

```powershell
cd backend
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
```

### Frontend

```powershell
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Check code style
```

---

## 📚 Learn More

- 📖 [Full Documentation](../README.md)
- 🔧 [Backend API Reference](../backend/README.md)
- 🎨 [Frontend Guide](../frontend/README.md)
- 🗄️ [Database Schema](../database/README.md)

---

## 🆘 Need Help?

- 💬 [Open an Issue](https://github.com/yourusername/anuranan-emp/issues)
- 📧 Email: support@anuranan.local
- 📝 Check [Troubleshooting Guide](../README.md#troubleshooting)

---

## 🎊 Congratulations!

You've successfully set up the Anuranan Employee Portal!

Start managing your team efficiently. 🚀

---

**Made with ❤️ for Anuranan - Bengali Recitation Training Institute**
