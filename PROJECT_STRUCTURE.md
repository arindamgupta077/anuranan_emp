# 📂 Project Structure Overview

Complete directory structure for the Anuranan Employee Portal.

```
anuranan_emp/
│
├── 📁 backend/                         # Express.js API Server
│   ├── 📁 src/
│   │   ├── 📄 server.ts               # Main server entry point
│   │   │   └── Express app configuration
│   │   │   └── Middleware setup
│   │   │   └── Route mounting
│   │   │   └── Error handling
│   │   │   └── Cron job initialization
│   │   │
│   │   ├── 📁 lib/
│   │   │   └── 📄 supabase.ts         # Supabase client setup
│   │   │       └── Database connection
│   │   │       └── Helper functions
│   │   │
│   │   ├── 📁 middleware/
│   │   │   └── 📄 auth.ts             # Authentication middleware
│   │   │       └── JWT verification
│   │   │       └── Role-based access control
│   │   │       └── Request user injection
│   │   │
│   │   ├── 📁 routes/
│   │   │   ├── 📄 auth.ts             # Authentication endpoints
│   │   │   │   ├── POST /api/auth/login
│   │   │   │   ├── POST /api/auth/logout
│   │   │   │   └── GET /api/auth/me
│   │   │   │
│   │   │   ├── 📄 tasks.ts            # Task management endpoints
│   │   │   │   ├── GET /api/tasks (list, filter, paginate)
│   │   │   │   ├── POST /api/tasks (create)
│   │   │   │   ├── GET /api/tasks/:id (details)
│   │   │   │   ├── PATCH /api/tasks/:id/status (update)
│   │   │   │   └── DELETE /api/tasks/:id (delete)
│   │   │   │
│   │   │   ├── 📄 selfTasks.ts        # Self task endpoints
│   │   │   │   ├── GET /api/self-tasks (list)
│   │   │   │   ├── POST /api/self-tasks (create)
│   │   │   │   ├── PATCH /api/self-tasks/:id (update)
│   │   │   │   └── DELETE /api/self-tasks/:id (delete)
│   │   │   │
│   │   │   ├── 📄 leaves.ts           # Leave management endpoints
│   │   │   │   ├── GET /api/leaves (list)
│   │   │   │   ├── POST /api/leaves (create)
│   │   │   │   ├── PATCH /api/leaves/:id (update)
│   │   │   │   └── DELETE /api/leaves/:id (delete)
│   │   │   │
│   │   │   ├── 📄 admin.ts            # Admin endpoints (CEO only)
│   │   │   │   ├── GET /api/admin/employees (list)
│   │   │   │   ├── GET /api/admin/roles (list)
│   │   │   │   ├── POST /api/admin/employees (create)
│   │   │   │   ├── PATCH /api/admin/employees/:id (update)
│   │   │   │   ├── DELETE /api/admin/employees/:id (deactivate)
│   │   │   │   └── POST /api/admin/employees/:id/reset-password
│   │   │   │
│   │   │   └── 📄 reports.ts          # Analytics & reporting
│   │   │       ├── GET /api/reports/dashboard
│   │   │       ├── GET /api/reports/performance
│   │   │       ├── GET /api/reports/tasks-summary
│   │   │       ├── GET /api/reports/recurring-tasks
│   │   │       └── GET /api/reports/leaves-summary
│   │   │
│   │   └── 📁 jobs/
│   │       └── 📄 recurring.ts        # Cron job for recurring tasks
│   │           └── Daily task spawning
│   │           └── Rule processing
│   │
│   ├── 📄 package.json                # Dependencies & scripts
│   ├── 📄 tsconfig.json               # TypeScript configuration
│   ├── 📄 .env.example                # Environment variables template
│   ├── 📄 .gitignore                  # Git ignore rules
│   └── 📄 README.md                   # Backend documentation
│
├── 📁 frontend/                        # Next.js Application
│   ├── 📁 pages/
│   │   ├── 📄 _app.tsx                # App wrapper
│   │   │   └── Global state provider
│   │   │   └── Auth check
│   │   │   └── Toast provider
│   │   │
│   │   ├── 📄 _document.tsx           # HTML document structure
│   │   │   └── Font loading
│   │   │   └── Meta tags
│   │   │
│   │   ├── 📄 index.tsx               # Landing/Home page
│   │   ├── 📄 login.tsx               # Login page
│   │   ├── 📄 dashboard.tsx           # Main dashboard
│   │   │
│   │   ├── 📁 tasks/
│   │   │   └── 📄 index.tsx           # Task management page
│   │   │       └── Task list
│   │   │       └── Task creation form
│   │   │       └── Status filters
│   │   │
│   │   ├── 📁 self-tasks/
│   │   │   └── 📄 index.tsx           # Self task logging
│   │   │
│   │   ├── 📁 leaves/
│   │   │   └── 📄 index.tsx           # Leave management
│   │   │
│   │   ├── 📁 admin/
│   │   │   └── 📄 index.tsx           # Admin panel (CEO only)
│   │   │       └── Employee management
│   │   │       └── Role assignment
│   │   │
│   │   └── 📁 reports/
│   │       └── 📄 index.tsx           # Reports & analytics
│   │           └── Performance reports
│   │           └── CSV export
│   │
│   ├── 📁 components/                 # Reusable React components
│   │   ├── 📄 Layout.tsx              # Main layout wrapper
│   │   ├── 📄 Navbar.tsx              # Top navigation
│   │   ├── 📄 Sidebar.tsx             # Side navigation
│   │   ├── 📄 ProtectedRoute.tsx      # Auth guard
│   │   ├── 📄 TaskList.tsx            # Task list component
│   │   ├── 📄 TaskCard.tsx            # Task card
│   │   ├── 📄 TaskForm.tsx            # Task creation/edit form
│   │   ├── 📄 StatusBadge.tsx         # Status display
│   │   ├── 📄 Modal.tsx               # Modal dialog
│   │   ├── 📄 ConfirmDialog.tsx       # Confirmation dialog
│   │   ├── 📄 DatePicker.tsx          # Date selector
│   │   ├── 📄 LoadingSpinner.tsx      # Loading indicator
│   │   └── 📄 EmptyState.tsx          # Empty state display
│   │
│   ├── 📁 lib/
│   │   ├── 📄 supabaseClient.ts       # Supabase client
│   │   │   └── Client initialization
│   │   │   └── Auth configuration
│   │   │
│   │   └── 📄 api.ts                  # API client
│   │       └── Axios instance
│   │       └── Request interceptors
│   │       └── Response interceptors
│   │       └── API method exports
│   │
│   ├── 📁 store/
│   │   └── 📄 authStore.ts            # Zustand auth state
│   │       └── User state
│   │       └── Employee state
│   │       └── Auth actions
│   │
│   ├── 📁 styles/
│   │   └── 📄 globals.css             # Global CSS + Tailwind
│   │       └── Base styles
│   │       └── Component classes
│   │       └── Utility classes
│   │       └── Animations
│   │
│   ├── 📁 public/
│   │   ├── 📄 manifest.json           # PWA manifest
│   │   ├── 📄 robots.txt              # SEO robots
│   │   ├── 📄 favicon.ico             # Favicon
│   │   └── 📁 icons/                  # PWA icons
│   │       ├── icon-72x72.png
│   │       ├── icon-96x96.png
│   │       ├── icon-128x128.png
│   │       ├── icon-144x144.png
│   │       ├── icon-152x152.png
│   │       ├── icon-192x192.png
│   │       ├── icon-384x384.png
│   │       └── icon-512x512.png
│   │
│   ├── 📄 package.json                # Dependencies & scripts
│   ├── 📄 tsconfig.json               # TypeScript configuration
│   ├── 📄 next.config.js              # Next.js + PWA config
│   ├── 📄 tailwind.config.js          # Tailwind configuration
│   ├── 📄 postcss.config.js           # PostCSS configuration
│   ├── 📄 .env.local.example          # Environment variables template
│   ├── 📄 .gitignore                  # Git ignore rules
│   └── 📄 README.md                   # Frontend documentation
│
├── 📁 database/                        # Database scripts & docs
│   ├── 📄 schema.sql                  # Complete database schema
│   │   └── Tables (7)
│   │   └── Indexes (20+)
│   │   └── Views (3)
│   │   └── Functions (3)
│   │   └── Triggers (4)
│   │   └── RLS Policies (20+)
│   │
│   └── 📄 README.md                   # Database documentation
│
├── 📄 README.md                        # Main project documentation
├── 📄 QUICKSTART.md                    # Quick setup guide
├── 📄 FEATURES.md                      # Complete features list
├── 📄 LICENSE                          # License file
└── 📄 .gitignore                       # Root gitignore

```

## Key Files Breakdown

### Backend Core Files

| File | Purpose | Key Features |
|------|---------|--------------|
| `server.ts` | Main entry | Express setup, middleware, routing |
| `lib/supabase.ts` | DB client | Connection, helper functions |
| `middleware/auth.ts` | Auth guard | JWT verify, role check |
| `routes/*.ts` | API routes | CRUD endpoints, business logic |
| `jobs/recurring.ts` | Cron jobs | Automated task spawning |

### Frontend Core Files

| File | Purpose | Key Features |
|------|---------|--------------|
| `_app.tsx` | App root | Global state, auth check |
| `pages/*.tsx` | Route pages | UI for each feature |
| `components/*.tsx` | UI components | Reusable React components |
| `lib/api.ts` | API client | HTTP requests, interceptors |
| `store/authStore.ts` | State mgmt | User/employee state |

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies & scripts |
| `tsconfig.json` | TypeScript compiler config |
| `next.config.js` | Next.js + PWA config |
| `tailwind.config.js` | Tailwind theme & plugins |
| `.env` / `.env.local` | Environment variables |

### Database Files

| File | Purpose |
|------|---------|
| `schema.sql` | Complete DB schema |
| `README.md` | Database documentation |

## Tech Stack by Layer

### Frontend Layer
```
Next.js 14
  ├── React 18
  ├── TypeScript
  ├── Tailwind CSS
  ├── Zustand (state)
  ├── Axios (HTTP)
  ├── React Hot Toast (notifications)
  └── Next PWA (offline support)
```

### Backend Layer
```
Node.js + Express
  ├── TypeScript
  ├── Supabase Client
  ├── Node-cron (scheduler)
  ├── Helmet (security)
  ├── Compression (performance)
  └── Express Rate Limit (protection)
```

### Database Layer
```
PostgreSQL (Supabase)
  ├── Row-Level Security (RLS)
  ├── Triggers & Functions
  ├── Views for reporting
  └── Supabase Auth
```

## Directory Size Estimates

| Directory | Approx Size | Files Count |
|-----------|-------------|-------------|
| `backend/` | ~50 MB | ~20 files |
| `frontend/` | ~200 MB | ~40 files |
| `database/` | ~50 KB | 2 files |
| **Total** | **~250 MB** | **~65 files** |

*Sizes include node_modules*

## File Naming Conventions

- **React Components:** PascalCase (e.g., `TaskList.tsx`)
- **Pages:** kebab-case (e.g., `self-tasks/`)
- **Utilities:** camelCase (e.g., `supabaseClient.ts`)
- **Config files:** lowercase (e.g., `next.config.js`)
- **Constants:** UPPER_SNAKE_CASE (in code)

## Import Paths

### Frontend
```typescript
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabaseClient';
import { useAuthStore } from '@/store/authStore';
```

### Backend
```typescript
import { supabase } from '../lib/supabase';
import { verifySupabaseAuth } from '../middleware/auth';
import { startRecurringJob } from '../jobs/recurring';
```

## Build Outputs

### Backend Build
```
backend/
└── dist/              # Compiled JavaScript
    ├── server.js
    ├── lib/
    ├── middleware/
    ├── routes/
    └── jobs/
```

### Frontend Build
```
frontend/
├── .next/             # Next.js build cache
│   ├── static/
│   ├── server/
│   └── cache/
│
└── out/               # Static export (optional)
    ├── _next/
    ├── index.html
    └── ...
```

## Version Control

### Tracked Files
- All source code (`.ts`, `.tsx`)
- Configuration files
- Documentation (`.md`)
- Database schema (`.sql`)
- Package manifests

### Ignored Files
- `node_modules/`
- `.next/`, `dist/`, `out/`
- `.env`, `.env.local`
- Build artifacts
- Logs

---

**Last Updated:** 2024  
**Project Version:** 1.0.0
