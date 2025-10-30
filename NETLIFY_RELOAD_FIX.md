# Netlify Reload Issue - Root Cause & Fix

## Problem
When reloading any page (except login) on Netlify, the application gets stuck in an infinite "Loading" state. The issue does NOT occur on localhost.

## Root Cause
The Netlify-specific service worker cleanup code in `_app.tsx` was creating an **infinite reload loop**:

1. User reloads a protected page (e.g., `/dashboard`)
2. App detects Netlify environment and runs cleanup
3. Cleanup clears service workers and caches
4. Code sets `sessionStorage` flag and triggers `window.location.replace()`
5. **Page reloads → sessionStorage is cleared → cleanup runs again → infinite loop**

## The Fix (Build v1.0.19)

### 1. Changed Storage from sessionStorage to localStorage
- `sessionStorage` is cleared on page reload
- `localStorage` persists across reloads
- This ensures the flag survives the reload

### 2. Set Flag BEFORE Cleanup
```typescript
// Set flag FIRST to prevent loops
localStorage.setItem(flagKey, 'yes');

// Then do cleanup and reload
```

### 3. Changed Flag Key
- Changed from `'netlify-sw-cleaned'` to `'netlify-sw-cleaned-v2'`
- This ensures old sessions get the new behavior

### 4. Simplified Auth Sync
- Removed complex cached profile logic from `_app.tsx`
- Always fetch fresh employee data from Supabase
- Prevents stale data issues after reload

## Files Modified
1. `frontend/pages/_app.tsx` - Fixed infinite reload loop
2. `frontend/lib/api.ts` - Removed cached profile logic

## Testing Instructions
1. Deploy to Netlify
2. Login and navigate to any page (dashboard, tasks, etc.)
3. Hard reload the page (Ctrl+Shift+R or F5)
4. **Expected**: Page should reload once and display data correctly
5. **Before Fix**: Page would reload infinitely and stay loading forever

## How to Clear the Fix (If Needed)
If a user gets stuck, they can clear the localStorage flag:
```javascript
// In browser console
localStorage.removeItem('netlify-sw-cleaned-v2');
```

## Deployment Date
October 30, 2025 - Build v1.0.19
