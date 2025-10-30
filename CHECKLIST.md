# ✅ Setup & Deployment Checklist

Use this checklist to ensure proper setup and deployment of Anuranan Employee Portal.

---

## 🎯 Pre-Setup Checklist

- [ ] Node.js v18+ installed
- [ ] npm or yarn installed
- [ ] Git installed
- [ ] Code editor (VS Code recommended)
- [ ] Supabase account created
- [ ] Project cloned/downloaded

---

## 🗄️ Database Setup

### Supabase Project Creation
- [ ] Created new Supabase project
- [ ] Noted down project name
- [ ] Saved database password securely
- [ ] Waited for provisioning to complete

### Schema Deployment
- [ ] Opened SQL Editor in Supabase
- [ ] Copied entire `database/schema.sql` content
- [ ] Executed SQL script successfully
- [ ] Verified all tables created
- [ ] Verified all indexes created
- [ ] Verified all views created
- [ ] Verified all functions created
- [ ] Verified RLS policies enabled

### First Admin User
- [ ] Created auth user in Supabase Dashboard
- [ ] Copied User UUID
- [ ] Created employee record linked to auth user
- [ ] Assigned CEO role
- [ ] Verified can login

### API Keys
- [ ] Retrieved Project URL
- [ ] Retrieved anon public key
- [ ] Retrieved service_role key
- [ ] Saved keys securely (not committed to Git)

---

## 🔧 Backend Setup

### Installation
- [ ] Navigated to `backend/` folder
- [ ] Ran `npm install`
- [ ] Verified no installation errors
- [ ] All dependencies installed

### Configuration
- [ ] Created `.env` file from `.env.example`
- [ ] Set `SUPABASE_URL`
- [ ] Set `SUPABASE_ANON_KEY`
- [ ] Set `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set `PORT` (default: 4000)
- [ ] Set `NODE_ENV` (development)
- [ ] Set `FRONTEND_URL`
- [ ] Set `CRON_SCHEDULE`
- [ ] Set rate limiting values

### Testing
- [ ] Started dev server with `npm run dev`
- [ ] Server started without errors
- [ ] Verified startup message appears
- [ ] Tested `/health` endpoint
- [ ] Verified cron job scheduled message
- [ ] Left server running

---

## 🎨 Frontend Setup

### Installation
- [ ] Opened NEW terminal (keep backend running)
- [ ] Navigated to `frontend/` folder
- [ ] Ran `npm install`
- [ ] Verified no installation errors
- [ ] All dependencies installed

### Configuration
- [ ] Created `.env.local` file from `.env.local.example`
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Set `NEXT_PUBLIC_API_URL` (http://localhost:4000)
- [ ] Set `NEXT_PUBLIC_APP_NAME`
- [ ] Set `NEXT_PUBLIC_APP_URL`

### PWA Assets
- [ ] Created `public/icons/` folder
- [ ] Generated icon-72x72.png
- [ ] Generated icon-96x96.png
- [ ] Generated icon-128x128.png
- [ ] Generated icon-144x144.png
- [ ] Generated icon-152x152.png
- [ ] Generated icon-192x192.png
- [ ] Generated icon-384x384.png
- [ ] Generated icon-512x512.png
- [ ] Added favicon.ico

### Testing
- [ ] Started dev server with `npm run dev`
- [ ] Server started without errors
- [ ] Opened http://localhost:3000
- [ ] Login page loads
- [ ] No console errors
- [ ] Left server running

---

## 🔐 Authentication Testing

### Login Test
- [ ] Navigated to login page
- [ ] Entered CEO credentials
- [ ] Clicked "Sign In"
- [ ] Login successful
- [ ] Redirected to dashboard
- [ ] User info displayed
- [ ] Navigation menu visible

### Session Persistence
- [ ] Refreshed page
- [ ] Still logged in
- [ ] User data persisted

### Logout Test
- [ ] Clicked logout
- [ ] Redirected to login
- [ ] Session cleared
- [ ] Cannot access protected pages

---

## ✨ Features Testing

### Task Management
- [ ] CEO can create tasks
- [ ] Tasks appear in list
- [ ] Can assign to employees
- [ ] Can set due dates
- [ ] Status updates work (OPEN → IN_PROGRESS → COMPLETED)
- [ ] Status filter works (OPEN & IN_PROGRESS default)
- [ ] Task search works
- [ ] Pagination works
- [ ] Task details page works
- [ ] Task history shows changes

### Recurring Tasks
- [ ] CEO can create recurring task
- [ ] Weekly recurrence works
- [ ] Monthly recurrence works
- [ ] Start/end dates work
- [ ] Cron job runs (check logs)
- [ ] Tasks spawn correctly
- [ ] No duplicate spawning

### Self Tasks
- [ ] Employees can create self tasks
- [ ] Date and details save
- [ ] Can edit own self tasks
- [ ] Can delete own self tasks
- [ ] CEO sees all employee self tasks
- [ ] Filter by employee works
- [ ] Filter by date works

### Leave Management
- [ ] Employees can request leave
- [ ] Start/end date validation works
- [ ] Can edit own leaves
- [ ] Can delete own leaves
- [ ] CEO sees all leaves
- [ ] Filter by employee works
- [ ] Filter by date works

### Admin Panel (CEO Only)
- [ ] Only CEO can access
- [ ] Can list all employees
- [ ] Can add new employee
- [ ] Employee creation creates auth user
- [ ] Can assign roles
- [ ] Can update employee details
- [ ] Can deactivate employees
- [ ] Can reset passwords
- [ ] Non-CEO users blocked

### Reports (CEO Only)
- [ ] Dashboard shows statistics
- [ ] Performance report loads
- [ ] Task summary works
- [ ] Recurring tasks report works
- [ ] Leave summary works
- [ ] CSV export works
- [ ] Date filters work
- [ ] Non-CEO users blocked

---

## 📱 PWA Testing

### Desktop Installation
- [ ] Install prompt appears (Chrome/Edge)
- [ ] Clicked install
- [ ] App installed successfully
- [ ] Opens in standalone window
- [ ] Functions correctly

### Mobile Installation (Android)
- [ ] Opened in Chrome
- [ ] "Install app" option appears
- [ ] Installed to home screen
- [ ] Icon appears correct
- [ ] Opens in standalone mode
- [ ] Functions correctly

### Mobile Installation (iOS)
- [ ] Opened in Safari
- [ ] Used "Add to Home Screen"
- [ ] Icon appears correct
- [ ] Opens correctly
- [ ] Functions correctly

### Offline Support
- [ ] Enabled offline mode
- [ ] Static assets load from cache
- [ ] Previously visited pages load
- [ ] Appropriate offline message shows
- [ ] Re-connects when online

---

## 🚀 Production Deployment

### Backend Deployment
- [ ] Chose hosting platform (Heroku/Railway/Render)
- [ ] Created new app/project
- [ ] Connected Git repository (or manual deploy)
- [ ] Set all environment variables
- [ ] Deployed successfully
- [ ] Verified deployment logs
- [ ] Tested `/health` endpoint
- [ ] Tested API endpoints
- [ ] Verified cron job runs

### Frontend Deployment
- [ ] Chose hosting platform (Vercel/Netlify)
- [ ] Connected Git repository (or manual deploy)
- [ ] Set all environment variables
- [ ] Updated `NEXT_PUBLIC_API_URL` to production backend
- [ ] Deployed successfully
- [ ] Verified deployment logs
- [ ] Tested login
- [ ] Tested all features
- [ ] Verified PWA install works

### Domain Configuration (Optional)
- [ ] Purchased domain
- [ ] Added domain to hosting platform
- [ ] Configured DNS records
- [ ] Updated environment variables
- [ ] Verified SSL certificate
- [ ] Tested with custom domain

### Production Testing
- [ ] Created test employee accounts
- [ ] Tested all user roles
- [ ] Tested all features
- [ ] Verified performance
- [ ] Checked for errors in logs
- [ ] Tested on multiple devices
- [ ] Tested on multiple browsers
- [ ] Verified PWA installation
- [ ] Tested offline mode

---

## 🔒 Security Checklist

### Environment Variables
- [ ] No keys committed to Git
- [ ] `.env` and `.env.local` in `.gitignore`
- [ ] Service role key only on backend
- [ ] Anon key only for public operations

### Authentication
- [ ] JWT validation works
- [ ] Token expiry handled
- [ ] Auto-refresh works
- [ ] Logout clears session

### Authorization
- [ ] Role checks on all protected endpoints
- [ ] RLS policies tested
- [ ] CEO-only features blocked for others
- [ ] Employees can only see own data

### API Security
- [ ] Rate limiting active
- [ ] Helmet headers applied
- [ ] CORS configured correctly
- [ ] Input validation on endpoints
- [ ] SQL injection protection (via Supabase)

---

## 📊 Performance Checklist

### Frontend Performance
- [ ] Bundle size < 300KB gzipped
- [ ] First Contentful Paint < 2s
- [ ] Time to Interactive < 3s
- [ ] No console errors
- [ ] No memory leaks

### Backend Performance
- [ ] Response time < 500ms
- [ ] Database queries optimized
- [ ] Indexes used effectively
- [ ] No N+1 query problems
- [ ] Compression enabled

### Database Performance
- [ ] All tables have appropriate indexes
- [ ] Views don't cause performance issues
- [ ] Queries use EXPLAIN ANALYZE
- [ ] No missing indexes
- [ ] Connection pooling works

---

## 📝 Documentation Checklist

- [ ] README.md complete and accurate
- [ ] QUICKSTART.md tested and works
- [ ] API endpoints documented
- [ ] Environment variables documented
- [ ] Database schema documented
- [ ] Deployment process documented
- [ ] Troubleshooting guide available

---

## 🎓 Training & Handoff

### User Training
- [ ] CEO trained on admin panel
- [ ] CEO trained on task creation
- [ ] CEO trained on reports
- [ ] Employees trained on task updates
- [ ] Employees trained on self tasks
- [ ] Employees trained on leave requests

### Technical Handoff
- [ ] Code repository shared
- [ ] Supabase project access granted
- [ ] Hosting platform access granted
- [ ] Environment variables documented
- [ ] Deployment process explained
- [ ] Troubleshooting guide provided

---

## 🔧 Maintenance Setup

### Monitoring
- [ ] Set up error logging
- [ ] Set up performance monitoring
- [ ] Set up uptime monitoring
- [ ] Set up database monitoring

### Backups
- [ ] Supabase automated backups enabled
- [ ] Code backed up to Git
- [ ] Environment variables backed up securely

### Updates
- [ ] Plan for dependency updates
- [ ] Plan for security patches
- [ ] Plan for feature additions
- [ ] Version control strategy

---

## ✅ Final Sign-Off

- [ ] All features tested and working
- [ ] All documentation complete
- [ ] Deployed to production
- [ ] Users trained
- [ ] Monitoring in place
- [ ] Backups configured
- [ ] Project complete! 🎉

---

**Project:** Anuranan Employee Portal  
**Version:** 1.0.0  
**Status:** Ready for Production

**Completed By:** ________________  
**Date:** ________________  
**Signature:** ________________
