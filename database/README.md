# Anuranan Database Documentation

Complete database schema for Anuranan Employee Portal using PostgreSQL (Supabase).

## Quick Setup

### 1. Create Supabase Project
1. Go to https://app.supabase.com/
2. Create a new project
3. Wait for database provisioning

### 2. Run Schema Script
1. Open **SQL Editor** in Supabase Dashboard
2. Copy entire contents of `schema.sql`
3. Execute the script
4. Verify tables created successfully

### 3. Create First CEO User
See instructions in main README.md

---

## Database Schema

### Tables

#### 1. roles
Stores employee role definitions.

| Column | Type | Description |
|--------|------|-------------|
| id | SMALLSERIAL | Primary key |
| name | TEXT | Role name (unique) |
| description | TEXT | Role description |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Default Roles:**
- CEO (Admin privileges)
- Manager
- Teacher
- Operation Manager
- Editor

---

#### 2. employees
Employee records linked to Supabase auth users.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| auth_user_id | UUID | FK to auth.users (unique) |
| full_name | TEXT | Employee full name |
| email | TEXT | Email address (unique) |
| role_id | SMALLINT | FK to roles |
| active | BOOLEAN | Account status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_employees_auth_user` on auth_user_id
- `idx_employees_role` on role_id
- `idx_employees_active` on active
- `idx_employees_email` on email

---

#### 3. tasks
Task assignments and tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| task_number | BIGSERIAL | Human-readable task ID |
| title | TEXT | Task title |
| details | TEXT | Task description |
| assigned_to | UUID | FK to employees |
| created_by | UUID | FK to employees (creator) |
| status | TEXT | OPEN, IN_PROGRESS, COMPLETED |
| due_date | DATE | Task due date |
| recurring_id | BIGINT | FK to recurring_tasks |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_tasks_assigned_to` on assigned_to
- `idx_tasks_created_by` on created_by
- `idx_tasks_status` on status
- `idx_tasks_due_date` on due_date
- `idx_tasks_status_assigned` on (status, assigned_to)
- `idx_tasks_status_due_date` on (status, due_date)

---

#### 4. recurring_tasks
Recurring task definitions for automated creation.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| title | TEXT | Task title template |
| details | TEXT | Task description template |
| created_by | UUID | FK to employees |
| assigned_to | UUID | FK to employees |
| recurrence_type | TEXT | WEEKLY or MONTHLY |
| day_of_week | SMALLINT | 0-6 for weekly (0=Sunday) |
| day_of_month | SMALLINT | 1-31 for monthly |
| start_date | DATE | Rule start date |
| end_date | DATE | Rule end date (optional) |
| last_spawned | TIMESTAMPTZ | Last task creation time |
| created_at | TIMESTAMPTZ | Creation timestamp |

**Constraints:**
- `recurrence_type` must be 'WEEKLY' or 'MONTHLY'
- Weekly tasks require `day_of_week`
- Monthly tasks require `day_of_month`

---

#### 5. self_tasks
Employee-created personal task log.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| employee_id | UUID | FK to employees |
| task_date | DATE | Task date |
| details | TEXT | Task description |
| is_private | BOOLEAN | Private flag |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Indexes:**
- `idx_self_tasks_employee` on employee_id
- `idx_self_tasks_date` on task_date
- `idx_self_tasks_employee_date` on (employee_id, task_date)

---

#### 6. leaves
Employee leave/absence requests.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| employee_id | UUID | FK to employees |
| start_date | DATE | Leave start date |
| end_date | DATE | Leave end date |
| reason | TEXT | Leave reason |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Constraints:**
- `start_date` must be <= `end_date`

**Indexes:**
- `idx_leaves_employee` on employee_id
- `idx_leaves_date_range` on (start_date, end_date)
- `idx_leaves_current` on (start_date, end_date) for active leaves

---

#### 7. task_history
Audit log of task status changes.

| Column | Type | Description |
|--------|------|-------------|
| id | BIGSERIAL | Primary key |
| task_id | BIGINT | FK to tasks |
| changed_by | UUID | FK to employees |
| old_status | TEXT | Previous status |
| new_status | TEXT | New status |
| note | TEXT | Change note |
| changed_at | TIMESTAMPTZ | Change timestamp |

**Indexes:**
- `idx_history_task` on (task_id, changed_at)
- `idx_history_changed_by` on changed_by

---

## Views

### 1. employee_performance
Aggregated employee performance metrics.

**Columns:**
- employee_id, full_name, email, role
- total_assigned, open_tasks, in_progress_tasks, completed_tasks
- completion_rate (percentage)
- overdue_count
- avg_hours_to_complete
- last_completed_task_date

**Usage:**
```sql
SELECT * FROM employee_performance
WHERE completion_rate > 80
ORDER BY completed_tasks DESC;
```

---

### 2. task_summary
Task statistics grouped by month and role.

**Columns:**
- month, status, assigned_role
- task_count, overdue_count

**Usage:**
```sql
SELECT * FROM task_summary
WHERE month >= '2024-01-01'
ORDER BY month DESC, task_count DESC;
```

---

### 3. leave_summary
Employee leave statistics.

**Columns:**
- employee_id, full_name, role
- total_leave_requests, total_leave_days
- last_leave_date

**Usage:**
```sql
SELECT * FROM leave_summary
ORDER BY total_leave_days DESC;
```

---

## Functions

### 1. spawn_task_from_recurring(rec_id BIGINT)
Creates a new task from a recurring task rule.

**Parameters:**
- `rec_id` - Recurring task ID

**Returns:** 
- Task ID (BIGINT) or NULL if expired

**Usage:**
```sql
SELECT spawn_task_from_recurring(1);
```

Called automatically by cron job.

---

### 2. get_employee_role(emp_id UUID)
Gets employee role name.

**Parameters:**
- `emp_id` - Employee ID

**Returns:** 
- Role name (TEXT)

**Usage:**
```sql
SELECT get_employee_role('employee-uuid-here');
```

---

### 3. is_ceo(emp_id UUID)
Checks if employee is CEO.

**Parameters:**
- `emp_id` - Employee ID

**Returns:** 
- TRUE or FALSE (BOOLEAN)

**Usage:**
```sql
SELECT is_ceo('employee-uuid-here');
```

---

## Triggers

### update_updated_at_column()
Automatically updates `updated_at` timestamp on row updates.

**Applied to tables:**
- employees
- tasks
- self_tasks
- leaves

---

## Row-Level Security (RLS)

RLS is **enabled** on all tables to enforce access control at the database level.

### Policy Summary

#### Employees Table
- CEO can view all employees
- Employees can view their own record
- CEO can insert/update employees

#### Tasks Table
- CEO can view/manage all tasks
- Employees can view their assigned tasks
- Employees can update status of assigned tasks
- CEO can delete tasks

#### Recurring Tasks Table
- CEO has full access (CRUD)
- Other roles have no direct access

#### Self Tasks Table
- CEO can view all self tasks
- Employees can view/manage their own self tasks

#### Leaves Table
- CEO can view all leave requests
- Employees can view/manage their own leaves

#### Task History Table
- CEO can view all history
- Employees can view history of their tasks
- System can insert history records

### Testing RLS

```sql
-- Set session to act as specific user
SET request.jwt.claim.sub = 'auth-user-uuid';

-- Now queries respect RLS policies
SELECT * FROM tasks;  -- Only sees allowed tasks
```

---

## Indexes for Performance

All indexes are optimized for common query patterns:
- Foreign keys (employee lookups)
- Status filters
- Date range queries
- Combined filters (status + employee)

**Index Maintenance:**
```sql
-- Reindex all tables
REINDEX DATABASE postgres;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

---

## Backup & Restore

### Backup
```bash
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

### Restore
```bash
psql -h db.xxx.supabase.co -U postgres -d postgres < backup.sql
```

---

## Monitoring Queries

### Active Connections
```sql
SELECT count(*) FROM pg_stat_activity;
```

### Table Sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Slow Queries
```sql
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

---

## Maintenance

### Vacuum Tables
```sql
VACUUM ANALYZE;
```

### Update Statistics
```sql
ANALYZE;
```

### Check for Bloat
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Security Best Practices

1. **Use Service Role Key only on backend** - Never expose in frontend
2. **Enable RLS on all tables** - Provides defense in depth
3. **Validate inputs** - Prevent SQL injection
4. **Use prepared statements** - Supabase client handles this
5. **Regular backups** - Automated in Supabase
6. **Monitor suspicious activity** - Check auth logs

---

## Support

For database issues:
1. Check Supabase Dashboard > Database > Logs
2. Review query performance in Dashboard > Database > Query Performance
3. Open support ticket in Supabase

---

**Schema Version:** 1.0.0  
**Last Updated:** 2024
