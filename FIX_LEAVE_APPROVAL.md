# 🔧 FIX: Leave Approval Error

## ❌ Problem
"Error: Failed to approve leave request" - This happened because the database `leaves` table was missing required columns for the approval workflow.

## ✅ Solution
I've fixed the database schema and added the missing columns.

---

## 🚀 What You Need to Do NOW:

### Step 1: Run the Migration in Supabase

1. Go to https://supabase.com/dashboard
2. Open your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**
5. Copy and paste the entire content from this file:
   ```
   database/migration-add-leave-approval.sql
   ```
6. Click **"Run"** (or press Ctrl+Enter)
7. Wait for "Success. No rows returned" message

---

## 📋 What This Migration Does:

### Adds 3 New Columns to `leaves` table:
1. **`status`** - TEXT (PENDING, APPROVED, REJECTED) - Default: PENDING
2. **`approved_by`** - UUID (references employee who approved/rejected)
3. **`approved_at`** - TIMESTAMPTZ (timestamp when approved/rejected)

### Updates RLS Policies:
- ✅ Employees can only edit/delete PENDING leaves
- ✅ CEO can approve/reject any leave request
- ✅ Proper permission checks in place

---

## 🧪 Test After Migration:

### For CEO Users:
1. Go to `/leaves` page
2. You should see all employee leave requests
3. Each request shows: 
   - Status badge (🟡 PENDING / ✅ APPROVED / ❌ REJECTED)
   - Approve/Reject buttons for PENDING requests
4. Click **"Approve"** on a PENDING leave
5. Should see success message
6. Status should change to APPROVED ✅

### For Regular Employees:
1. Go to `/leaves` page
2. Can create new leave request
3. Can edit/delete only PENDING requests
4. Cannot edit APPROVED or REJECTED requests
5. See approval status and who approved

---

## 📊 Migration Verification

After running the migration, you can verify it worked by running this in SQL Editor:

```sql
-- Check table structure
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'leaves' 
ORDER BY ordinal_position;
```

You should see these columns:
- id
- employee_id
- start_date
- end_date
- reason
- **status** ✅ (NEW)
- **approved_by** ✅ (NEW)
- **approved_at** ✅ (NEW)
- created_at
- updated_at

---

## 🔍 What Was Wrong in the Original Schema?

The original `leaves` table only had:
```sql
CREATE TABLE leaves (
  id BIGSERIAL PRIMARY KEY,
  employee_id UUID,
  start_date DATE,
  end_date DATE,
  reason TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

❌ Missing: status, approved_by, approved_at columns
❌ Missing: RLS policy for CEO to update leaves

This is why the `updateStatus` API call was failing - it was trying to update columns that didn't exist!

---

## ✨ After Migration - Features That Now Work:

### 1. Leave Status Tracking
- 🟡 **PENDING** - Waiting for CEO approval
- ✅ **APPROVED** - CEO approved the leave
- ❌ **REJECTED** - CEO rejected the leave

### 2. Approval Workflow
- Employee submits leave request (status = PENDING)
- CEO reviews and approves/rejects
- System records who approved and when
- Employee can see approval status

### 3. Permissions
- Employees can only edit PENDING leaves
- CEO can approve/reject any leave
- Approved/Rejected leaves are locked

---

## 🆘 Troubleshooting

### If migration fails:
1. Check if columns already exist (might have been added manually)
2. Try running just the ALTER TABLE statements individually
3. Check Supabase logs for specific error

### If approval still doesn't work:
1. Clear browser cache
2. Check browser console for errors
3. Verify environment variables are set
4. Check if user role is actually 'CEO' in database

---

## 📁 Files Changed:

1. **`database/migration-add-leave-approval.sql`** - NEW migration file
2. **`database/schema.sql`** - Updated main schema
3. Frontend code already had the approval UI - just needed database support!

---

## ⚡ Quick Test Command:

After migration, test with this SQL:

```sql
-- Create a test leave request
INSERT INTO leaves (employee_id, start_date, end_date, reason, status)
VALUES (
  (SELECT id FROM employees LIMIT 1),
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '2 days',
  'Test leave',
  'PENDING'
);

-- Check if it was created
SELECT * FROM leaves ORDER BY created_at DESC LIMIT 1;
```

---

**Run the migration now and your leave approval will work!** 🚀

The frontend code is already perfect - it was just waiting for the database to catch up!
