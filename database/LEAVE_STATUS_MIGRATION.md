# Leave Request Status Migration

This migration adds approval workflow functionality to the leaves table.

## What's Added

1. **status** column - Tracks leave request status (PENDING, APPROVED, REJECTED)
2. **approved_by** column - Records which admin approved/rejected the request
3. **approved_at** column - Timestamp of approval/rejection

## How to Run

### Using Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `add-leave-status.sql`
4. Click "Run" to execute the migration

### Using Supabase CLI:
```bash
supabase db push
```

Or run the SQL file directly:
```bash
psql -h your-db-host -U postgres -d your-db-name -f add-leave-status.sql
```

## After Migration

The backend and frontend are already updated to support:
- Admins can approve/reject leave requests
- Employees can see the status of their leave requests
- Status indicators with color coding (green for approved, red for rejected, yellow for pending)
- Approval history tracking

## Verification

After running the migration, verify with:
```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'leaves' AND column_name IN ('status', 'approved_by', 'approved_at');
```

You should see all three new columns listed.
