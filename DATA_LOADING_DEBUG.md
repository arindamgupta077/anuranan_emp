# Data Loading Issue Debug - Build v1.0.23

## Current Status
- ✅ Page UI renders correctly
- ✅ Auth state loads (user & employee data present)
- ❌ Dashboard cards stuck with spinners - no data loads
- ❌ Tasks/Leaves pages also stuck loading

## New Comprehensive Logging Added

### What to Check in Browser Console

After reloading the dashboard, you should see this sequence:

#### 1. **Dashboard Initialization**
```
[DASHBOARD] Loading stats... { isAuthenticated: true, hasEmployee: true, employeeId: "xxx" }
```

#### 2. **Tasks API Call**
```
[DASHBOARD] Fetching tasks...
[API] tasksAPI.list called with params: { status: 'OPEN,IN_PROGRESS' }
[API] getCurrentUser called
[API] Session retrieved: { duration: "50ms", hasSession: true, userId: "xxx" }
[API] Fetching employee data...
[API] Employee query result: { duration: "200ms", hasEmployee: true, employeeId: "xxx" }
[API] ✅ getCurrentUser success
[API] Building tasks query for: { employeeId: "xxx", isCEO: false }
[API] Executing tasks query...
[API] Tasks query result: { duration: "300ms", taskCount: 5, hasError: false }
[DASHBOARD] Tasks fetched: { duration: "550ms", count: 5 }
```

#### 3. **Self Tasks & Leaves**
Similar logs for self tasks and leaves...

#### 4. **Final Result**
```
[DASHBOARD] ✅ Stats loaded: { activeTasks: 5, selfTasks: 3, leaveRequests: 2 }
[DASHBOARD] Loading complete
```

## What We're Looking For

### ❌ **If You See This:**
```
[API] ❌ Not authenticated - no session/user
```
**Means:** Supabase session is lost between _app.tsx and API calls

### ❌ **If You See This:**
```
[API] ❌ Employee not found
```
**Means:** RLS policy blocking employee lookup in API calls

### ❌ **If getCurrentUser Takes Too Long:**
```
[API] getCurrentUser called
// ... nothing for 10+ seconds
```
**Means:** Supabase API timeout or network issue

### ❌ **If No Dashboard Logs at All:**
```
// No [DASHBOARD] logs appear
```
**Means:** `loadDashboardStats()` never runs - check if `isAuthenticated && mounted` is false

## Testing Steps

1. **Open Browser Console** (F12)
2. **Clear Console** (trash icon)
3. **Login to app**
4. **Navigate to Dashboard**
5. **Hard Reload** (Ctrl+Shift+R)
6. **Watch console logs carefully**
7. **Copy ALL console output**

## Expected vs Actual

### ✅ **Working (Expected):**
```
[APP INIT] Starting...
[AUTH SYNC] ✅ Setting auth with employee data
[AUTH SYNC] Sync completed
[DASHBOARD] Loading stats...
[API] getCurrentUser called
[API] ✅ getCurrentUser success
[DASHBOARD] ✅ Stats loaded
```

### ❌ **Broken (What you're seeing):**
```
[APP INIT] Starting...
[AUTH SYNC] ✅ Setting auth with employee data
[AUTH SYNC] Sync completed
[DASHBOARD] Loading stats...
[API] getCurrentUser called
// ??? What happens here ???
```

## Quick Debug Commands

Run these in browser console:

```javascript
// Check if dashboard is trying to load
console.log('Auth State:', {
  isAuthenticated: useAuthStore.getState().isAuthenticated,
  isLoading: useAuthStore.getState().isLoading,
  hasEmployee: !!useAuthStore.getState().employee
});

// Check Supabase session directly
supabase.auth.getSession().then(({ data: { session }, error }) => {
  console.log('Direct session check:', { hasSession: !!session, error });
});

// Test API call manually
import { tasksAPI } from '../lib/api';
tasksAPI.list({ status: 'OPEN' }).then(result => {
  console.log('Manual API test:', result);
}).catch(err => {
  console.error('Manual API test failed:', err);
});
```

## What to Report

Please share:
1. **Full console output** after reload (all [DASHBOARD] and [API] logs)
2. **Where does it stop?** (last log before hanging)
3. **Any ❌ error logs?**
4. **Network tab** - any failed Supabase requests?
5. **Does clearing cache fix it?** (we know yes, but confirm)

## Next Steps

Based on the logs, we'll know:
- ✅ Is auth working in API calls?
- ✅ Is getCurrentUser succeeding?
- ✅ Are Supabase queries running?
- ✅ Is data being returned?
- ✅ Exact point of failure

This will pinpoint whether it's:
- Auth session issue
- RLS policy problem
- Network timeout
- React state update issue
