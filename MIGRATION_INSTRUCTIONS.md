# IMPORTANT: Run This Migration First!

## Database Migration Required

Before the leave approval feature will work, you need to add the new columns to the `leaves` table.

## Quick Setup Steps:

### 1. Run the Database Migration

**Option A: Using Supabase Dashboard (Recommended)**
1. Go to https://app.supabase.com
2. Select your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the entire content from `database/add-leave-status.sql`
6. Paste it into the SQL editor
7. Click "Run" or press `Ctrl+Enter`

**Option B: Using psql or Database Client**
```bash
# If you have direct database access
psql -h <your-host> -U postgres -d <your-db> -f database/add-leave-status.sql
```

### 2. Verify the Migration

Run this query to verify the columns were added:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'leaves' 
AND column_name IN ('status', 'approved_by', 'approved_at');
```

You should see 3 rows returned.

### 3. Restart the Backend Server

After running the migration:
```bash
cd backend
npm run dev
```

### 4. Refresh the Frontend

If the frontend is already running, just refresh your browser. The new features should now work!

## What This Migration Does:

✅ Adds `status` column (PENDING, APPROVED, REJECTED)
✅ Adds `approved_by` column (tracks who approved/rejected)
✅ Adds `approved_at` column (timestamp of approval)
✅ Sets all existing leaves to PENDING status
✅ Creates index for better performance

## Troubleshooting:

### Error: "relation 'leaves' does not exist"
- Make sure you're connected to the correct database
- Run the main schema.sql first if this is a fresh setup

### Error: "column already exists"
- The migration has already been run
- You can skip this step

### Still seeing the error in the UI?
1. Hard refresh the browser (Ctrl+Shift+R)
2. Check browser console for errors
3. Make sure backend server restarted after migration
4. Check that Supabase connection is working

## Need Help?

Check the backend logs for any errors:
```bash
# In the backend directory
npm run dev
```

Look for any SQL-related errors in the terminal output.
