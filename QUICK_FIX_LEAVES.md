# Quick Fix for "Could not find a relationship" Error

## The Problem
The error `Could not find a relationship between 'leaves' and 'employees'` means the database schema needs to be updated with the new columns.

## The Solution (3 Steps)

### Step 1: Run the Database Migration

Open your Supabase SQL Editor and run the migration:

**File to run:** `database/add-leave-status.sql`

Or copy-paste this SQL directly:

```sql
-- Add status field to leaves table for approval workflow
ALTER TABLE leaves 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'));

ALTER TABLE leaves 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES employees(id) ON DELETE SET NULL;

ALTER TABLE leaves 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);

UPDATE leaves SET status = 'PENDING' WHERE status IS NULL;
```

### Step 2: Restart Backend

```powershell
cd c:\VSCODE\anuranan_emp\backend
npm run dev
```

### Step 3: Refresh Frontend

- If frontend is running, just refresh your browser (F5)
- If not running:
```powershell
cd c:\VSCODE\anuranan_emp\frontend
npm run dev
```

## Verify It Works

After completing the above steps:
1. Go to the Leaves page
2. The error should be gone
3. You should see the leave requests table
4. CEO users should see "Approve" and "Reject" buttons

## What Changed

The code has been updated to:
- ✅ Use correct Supabase relationship syntax: `employee:employee_id` instead of `employee:employees!fkey`
- ✅ Add status field with default value 'PENDING'
- ✅ Add approval tracking (approved_by, approved_at)
- ✅ Support approval/rejection workflow

## Still Having Issues?

1. **Check Supabase connection:** Make sure your `.env` file has correct credentials
2. **Check backend logs:** Look for any SQL errors in the terminal
3. **Clear browser cache:** Hard refresh with Ctrl+Shift+R
4. **Verify migration ran:** Query the database to confirm the new columns exist
