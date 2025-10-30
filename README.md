# Anuranan Employee Portal

> **Complete Employee Management System** for Anuranan - Bengali Recitation Training Institute

A modern, lightweight, and performance-optimized employee management application built with Next.js, TypeScript, Express.js, and Supabase. Features include task management, leave tracking, self-task logging, reporting dashboard, and PWA support for mobile installation.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [User Roles & Permissions](#user-roles--permissions)
- [Features Guide](#features-guide)
- [PWA Installation](#pwa-installation)
- [Performance Optimizations](#performance-optimizations)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## ✨ Features

### Core Features
- ✅ **Authentication & Authorization** - Supabase Auth with role-based access control
- ✅ **Task Management** - Assign, track, and manage employee tasks with status updates
- ✅ **Recurring Tasks** - Weekly/monthly automated task creation
- ✅ **Self Task Logging** - Employees track their daily independent activities
- ✅ **Leave Management** - Request and track employee leave days
- ✅ **Admin Panel** - CEO/Admin can manage employees and roles
- ✅ **Performance Reports** - Comprehensive analytics and CSV export
- ✅ **Real-time Updates** - Live data synchronization
- ✅ **PWA Support** - Installable on mobile devices
- ✅ **Responsive Design** - Optimized for all screen sizes
- ✅ **Lightweight** - Fast performance on low-end devices

### Advanced Features
- 📊 Dashboard with key metrics
- 🔔 Task status filters (OPEN, IN_PROGRESS, COMPLETED)
- 📅 Date-based filtering and search
- 📈 Visual performance analytics
- 🔒 Row-Level Security (RLS) in database
- ⏰ Automated recurring task scheduler (cron jobs)
- 📄 CSV export for reports
- 🎨 Clean, intuitive UI with Tailwind CSS

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with SSR and SSG
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Next PWA** - Progressive Web App support

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Supabase Client** - Database and auth SDK
- **Node-cron** - Task scheduler
- **Helmet** - Security headers
- **Compression** - Response compression
- **CSV Stringify** - CSV generation

### Database & Auth
- **Supabase (PostgreSQL)** - Database and authentication
- **Row-Level Security (RLS)** - Database-level access control
- **Supabase Auth** - User authentication

---

## 📁 Project Structure

```
anuranan_emp/
├── backend/                    # Express.js API server
│   ├── src/
│   │   ├── server.ts          # Main server file
│   │   ├── lib/
│   │   │   └── supabase.ts    # Supabase client
│   │   ├── middleware/
│   │   │   └── auth.ts        # Authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.ts        # Auth endpoints
│   │   │   ├── tasks.ts       # Task management
│   │   │   ├── selfTasks.ts   # Self tasks
│   │   │   ├── leaves.ts      # Leave management
│   │   │   ├── admin.ts       # Admin operations
│   │   │   └── reports.ts     # Analytics & reports
│   │   └── jobs/
│   │       └── recurring.ts   # Cron job for recurring tasks
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # Next.js application
│   ├── pages/
│   │   ├── _app.tsx           # App wrapper
│   │   ├── _document.tsx      # HTML document
│   │   ├── login.tsx          # Login page
│   │   ├── dashboard.tsx      # Main dashboard
│   │   ├── tasks/             # Task pages
│   │   ├── self-tasks/        # Self task pages
│   │   ├── leaves/            # Leave pages
│   │   ├── admin/             # Admin panel
│   │   └── reports/           # Reports pages
│   ├── components/            # Reusable React components
│   ├── lib/
│   │   ├── supabaseClient.ts  # Supabase client
│   │   └── api.ts             # API client
│   ├── store/
│   │   └── authStore.ts       # Authentication state
│   ├── styles/
│   │   └── globals.css        # Global styles
│   ├── public/
│   │   ├── manifest.json      # PWA manifest
│   │   └── icons/             # App icons
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   ├── tailwind.config.js
│   └── .env.local.example
│
└── database/
    └── schema.sql             # Complete database schema
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Supabase Account** - [Sign up](https://supabase.com/)
- **Git** - Version control

---

## 🚀 Installation

### 1. Clone the Repository

```powershell
git clone https://github.com/yourusername/anuranan-emp.git
cd anuranan-emp
```

### 2. Install Backend Dependencies

```powershell
cd backend
npm install
```

### 3. Install Frontend Dependencies

```powershell
cd ../frontend
npm install
```

---

## 🗄️ Database Setup

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Enter project details and create
4. Wait for the database to be provisioned

### Step 2: Run SQL Schema

1. Open **SQL Editor** in Supabase Dashboard
2. Copy the entire content from `database/schema.sql`
3. Paste and execute in SQL Editor
4. Verify tables are created:
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

### Step 3: Create First CEO User

1. Go to **Authentication > Users** in Supabase Dashboard
2. Click "Add User" > "Create new user"
3. Enter email and password (e.g., `ceo@anuranan.local`)
4. Copy the User ID (UUID)
5. Run in SQL Editor:
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

---

## 🔐 Environment Variables

### Backend (.env)

Create `backend/.env` file:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Server Configuration
PORT=4000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Cron Job Configuration (2 AM daily)
CRON_SCHEDULE=0 2 * * *

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

**Get your Supabase keys:**
1. Supabase Dashboard > Settings > API
2. Copy `Project URL` → `SUPABASE_URL`
3. Copy `anon public` key → `SUPABASE_ANON_KEY`
4. Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

### Frontend (.env.local)

Create `frontend/.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:4000

# App Configuration
NEXT_PUBLIC_APP_NAME=Anuranan Employee Portal
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## ▶️ Running the Application

### Development Mode

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
Server runs on `http://localhost:4000`

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
App runs on `http://localhost:3000`

### Production Build

**Backend:**
```powershell
cd backend
npm run build
npm start
```

**Frontend:**
```powershell
cd frontend
npm run build
npm start
```

---

## 👥 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **CEO** | Full admin access - manage all employees, tasks, view all reports |
| **Manager** | View and manage team tasks, limited reports |
| **Teacher** | View assigned tasks, manage own self-tasks and leaves |
| **Operation Manager** | Operations-focused access, task management |
| **Editor** | Content editing, own tasks and leaves |

### Role-Based Access Control (RBAC)

- ✅ CEO can create/assign tasks to any employee
- ✅ CEO can view all self-tasks and leave requests
- ✅ CEO has access to admin panel and reports
- ✅ Employees can update status of assigned tasks
- ✅ Employees can manage their own self-tasks and leaves
- ✅ Row-Level Security enforced at database level

---

## 📖 Features Guide

### 1. Task Management

**Creating Tasks (CEO Only):**
1. Navigate to **Tasks** page
2. Click "Create Task"
3. Fill in details:
   - Title (required)
   - Description
   - Assign to employee
   - Due date
   - Recurring options (optional)
4. Submit

**Task Statuses:**
- `OPEN` - Newly created, not started
- `IN_PROGRESS` - Work has begun
- `COMPLETED` - Task finished

**Updating Task Status:**
- Employees can update status of assigned tasks
- CEO can update any task
- Status changes are logged in task history

**Filtering Tasks:**
- By status (default: OPEN & IN_PROGRESS)
- By assigned employee
- By date range
- Search by title/description

### 2. Recurring Tasks

**Creating Recurring Tasks:**
1. When creating a task, enable "Recurring"
2. Select frequency:
   - **Weekly** - Choose day of week (0=Sunday, 6=Saturday)
   - **Monthly** - Choose day of month (1-31)
3. Set start and end dates (optional)

**How It Works:**
- Cron job runs daily at 2 AM (configurable)
- Automatically creates tasks based on recurrence rules
- Tasks are created 7 days before due date
- Prevents duplicate tasks on same day

### 3. Self Task Logging

**For Employees:**
1. Navigate to **Self Tasks**
2. Click "Add Self Task"
3. Enter date and task details
4. Submit

**For CEO:**
- View all employees' self tasks
- Filter by employee and date range
- Track independent work activities

### 4. Leave Management

**Requesting Leave:**
1. Go to **Leaves** page
2. Click "Request Leave"
3. Enter start date, end date, and reason
4. Submit

**CEO View:**
- See all employee leaves
- Current and upcoming leaves dashboard
- Leave summary reports

### 5. Admin Panel (CEO Only)

**Managing Employees:**
- Add new employees with email/password
- Assign roles
- Activate/deactivate accounts
- Reset passwords

**Adding an Employee:**
1. Go to **Admin Panel**
2. Click "Add Employee"
3. Fill form:
   - Full name
   - Email
   - Role
   - Initial password
4. System creates Supabase auth user + employee record

### 6. Reports & Analytics

**Available Reports:**
- **Dashboard** - Key metrics overview
- **Performance Report** - Employee completion rates
- **Task Summary** - Tasks by status and employee
- **Recurring Tasks Report** - Compliance rates
- **Leave Summary** - Leave days by employee

**Export to CSV:**
- Click "Export CSV" on reports page
- Downloads comprehensive data

---

## 📱 PWA Installation

### On Android (Chrome/Edge)

1. Open app in Chrome
2. Tap menu (⋮) > "Install app" or "Add to Home Screen"
3. Confirm installation
4. App icon appears on home screen

### On iOS (Safari)

1. Open app in Safari
2. Tap Share button (square with arrow)
3. Scroll and tap "Add to Home Screen"
4. Name the app and tap "Add"

### On Desktop

1. Open app in Chrome/Edge
2. Look for install icon (+) in address bar
3. Click and confirm installation
4. App opens in standalone window

---

## ⚡ Performance Optimizations

### Frontend Optimizations
- **Server-Side Rendering (SSR)** for initial page loads
- **Code Splitting** - Lazy load components
- **Image Optimization** - Next.js Image component
- **PWA Caching** - Service worker caches assets
- **Debounced Inputs** - Reduces API calls
- **Pagination** - Limits data fetched per request
- **Tailwind CSS Purging** - Removes unused styles

### Backend Optimizations
- **Database Indexing** - Fast query performance
- **Query Optimization** - Efficient SQL with joins
- **Response Compression** - Gzip/Brotli
- **Rate Limiting** - Prevents abuse
- **Connection Pooling** - Reuses database connections

### Low-End Device Support
- **Minimal animations** with `prefers-reduced-motion`
- **Lightweight libraries** (Zustand instead of Redux)
- **Small bundle size** (~200KB gzipped)
- **Efficient re-renders** with React optimization

---

## 🔌 API Documentation

### Authentication

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {...},
  "session": {...},
  "employee": {...}
}
```

### Tasks

**GET /api/tasks?status=OPEN,IN_PROGRESS&page=1&per_page=20**

**POST /api/tasks** (CEO only)
```json
{
  "title": "Task Title",
  "details": "Description",
  "assigned_to": "employee-uuid",
  "due_date": "2024-12-31",
  "recurring": {
    "type": "WEEKLY",
    "day_of_week": 1
  }
}
```

**PATCH /api/tasks/:id/status**
```json
{
  "status": "COMPLETED"
}
```

### Self Tasks

**GET /api/self-tasks?employee_id=uuid&start_date=2024-01-01**

**POST /api/self-tasks**
```json
{
  "task_date": "2024-01-15",
  "details": "Task description"
}
```

### Leaves

**GET /api/leaves?employee_id=uuid**

**POST /api/leaves**
```json
{
  "start_date": "2024-02-01",
  "end_date": "2024-02-05",
  "reason": "Vacation"
}
```

### Admin

**GET /api/admin/employees**

**POST /api/admin/employees** (CEO only)
```json
{
  "email": "new@example.com",
  "full_name": "John Doe",
  "role_id": 3,
  "password": "securepass"
}
```

### Reports

**GET /api/reports/dashboard**

**GET /api/reports/performance?format=csv**

---

## 🚢 Deployment

### Deploying Backend (Heroku, Railway, Render)

1. Push code to Git repository
2. Connect to hosting platform
3. Set environment variables
4. Deploy

**Example - Heroku:**
```powershell
cd backend
heroku create anuranan-api
heroku config:set SUPABASE_URL=your-url
heroku config:set SUPABASE_SERVICE_ROLE_KEY=your-key
# ... set other vars
git push heroku main
```

### Deploying Frontend (Vercel, Netlify)

**Vercel (Recommended):**
```powershell
cd frontend
npm i -g vercel
vercel
# Follow prompts
# Set environment variables in Vercel dashboard
```

**Environment Variables on Vercel:**
- Add all `NEXT_PUBLIC_*` variables
- Update `NEXT_PUBLIC_API_URL` to backend URL

### Custom Domain

1. Purchase domain
2. Add to hosting platform
3. Update environment variables
4. Configure DNS

---

## 🔧 Troubleshooting

### Backend won't start

**Problem:** `Cannot find module '@supabase/supabase-js'`

**Solution:**
```powershell
cd backend
rm -rf node_modules
npm install
```

### Frontend compilation errors

**Problem:** TypeScript errors

**Solution:**
```powershell
cd frontend
npm run type-check
```

### Database connection issues

**Problem:** `Invalid API key`

**Solution:**
- Verify `.env` has correct Supabase keys
- Check Supabase project is active
- Ensure service role key is used on backend

### Recurring tasks not spawning

**Problem:** Cron job not running

**Solution:**
- Check `CRON_SCHEDULE` in `.env`
- Verify server is running continuously
- Check server logs for cron execution

### PWA not installing

**Problem:** Install prompt doesn't appear

**Solution:**
- Must be served over HTTPS (use localhost or deploy)
- Check `manifest.json` is accessible
- Ensure service worker registered
- Check browser console for errors

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Support

For issues or questions:
- Open an issue on GitHub
- Contact: support@anuranan.local

---

## 🙏 Acknowledgments

- Supabase for backend infrastructure
- Next.js team for the amazing framework
- Tailwind CSS for beautiful styling
- All contributors and supporters

---

**Built with ❤️ for Anuranan - Bengali Recitation Training Institute**
