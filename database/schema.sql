-- ============================================================================
-- Anuranan Employee Portal - Database Schema
-- ============================================================================
-- This script creates all tables, indexes, views, functions, triggers, and
-- Row Level Security (RLS) policies for the Anuranan Employee Portal.
--
-- Run this script in the Supabase SQL Editor to set up your database.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ROLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS roles (
  id SMALLSERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default roles
INSERT INTO roles (name, description) VALUES 
  ('CEO', 'Chief Executive Officer - Full admin access'),
  ('Manager', 'Manager - Supervisory access'),
  ('Teacher', 'Teacher - Standard employee access'),
  ('Operation Manager', 'Operation Manager - Operations focused access'),
  ('Editor', 'Editor - Content editing access')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. EMPLOYEES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  role_id SMALLINT NOT NULL REFERENCES roles(id),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Indexes for employees
CREATE INDEX IF NOT EXISTS idx_employees_auth_user ON employees(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role_id);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(active);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- ============================================================================
-- 3. TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  id BIGSERIAL PRIMARY KEY,
  task_number BIGSERIAL UNIQUE NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  assigned_to UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  created_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  due_date DATE,
  recurring_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED'))
);

-- Indexes for tasks (optimized for common queries)
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_status_assigned ON tasks(status, assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_recurring_id ON tasks(recurring_id) WHERE recurring_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);

-- Composite index for common filter patterns
CREATE INDEX IF NOT EXISTS idx_tasks_status_due_date ON tasks(status, due_date);

-- ============================================================================
-- 4. RECURRING TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS recurring_tasks (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  details TEXT,
  created_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  assigned_to UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  recurrence_type TEXT NOT NULL,
  day_of_week SMALLINT,
  day_of_month SMALLINT,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  last_spawned TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_recurrence_type CHECK (recurrence_type IN ('WEEKLY', 'MONTHLY')),
  CONSTRAINT valid_day_of_week CHECK (day_of_week IS NULL OR (day_of_week >= 0 AND day_of_week <= 6)),
  CONSTRAINT valid_day_of_month CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31)),
  CONSTRAINT weekly_needs_day_of_week CHECK (recurrence_type != 'WEEKLY' OR day_of_week IS NOT NULL),
  CONSTRAINT monthly_needs_day_of_month CHECK (recurrence_type != 'MONTHLY' OR day_of_month IS NOT NULL)
);

-- Add foreign key to tasks table for recurring_id
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS fk_tasks_recurring;
ALTER TABLE tasks ADD CONSTRAINT fk_tasks_recurring 
  FOREIGN KEY (recurring_id) REFERENCES recurring_tasks(id) ON DELETE SET NULL;

-- Indexes for recurring tasks
CREATE INDEX IF NOT EXISTS idx_recurring_assigned_to ON recurring_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_recurring_type_day ON recurring_tasks(recurrence_type, day_of_week, day_of_month);
CREATE INDEX IF NOT EXISTS idx_recurring_active ON recurring_tasks(start_date, end_date);

-- ============================================================================
-- 5. SELF TASKS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS self_tasks (
  id BIGSERIAL PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  task_date DATE NOT NULL,
  details TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for self tasks
CREATE INDEX IF NOT EXISTS idx_self_tasks_employee ON self_tasks(employee_id);
CREATE INDEX IF NOT EXISTS idx_self_tasks_date ON self_tasks(task_date DESC);
CREATE INDEX IF NOT EXISTS idx_self_tasks_employee_date ON self_tasks(employee_id, task_date DESC);

-- ============================================================================
-- 6. LEAVES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS leaves (
  id BIGSERIAL PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

-- Indexes for leaves
CREATE INDEX IF NOT EXISTS idx_leaves_employee ON leaves(employee_id);
CREATE INDEX IF NOT EXISTS idx_leaves_date_range ON leaves(start_date, end_date);

-- ============================================================================
-- 7. TASK HISTORY TABLE (Audit Log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_history (
  id BIGSERIAL PRIMARY KEY,
  task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  old_status TEXT,
  new_status TEXT,
  note TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_old_status CHECK (old_status IS NULL OR old_status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED')),
  CONSTRAINT valid_new_status CHECK (new_status IN ('OPEN', 'IN_PROGRESS', 'COMPLETED'))
);

-- Indexes for task history
CREATE INDEX IF NOT EXISTS idx_history_task ON task_history(task_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_changed_by ON task_history(changed_by);

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trg_employees_updated_at ON employees;
CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks;
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_self_tasks_updated_at ON self_tasks;
CREATE TRIGGER trg_self_tasks_updated_at
  BEFORE UPDATE ON self_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_leaves_updated_at ON leaves;
CREATE TRIGGER trg_leaves_updated_at
  BEFORE UPDATE ON leaves
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 9. VIEWS FOR REPORTING
-- ============================================================================

-- Employee Performance View
CREATE OR REPLACE VIEW employee_performance AS
SELECT
  e.id AS employee_id,
  e.full_name,
  e.email,
  r.name AS role,
  r.id AS role_id,
  COUNT(t.id) AS total_assigned,
  COUNT(t.id) FILTER (WHERE t.status = 'OPEN') AS open_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'IN_PROGRESS') AS in_progress_tasks,
  COUNT(t.id) FILTER (WHERE t.status = 'COMPLETED') AS completed_tasks,
  ROUND(
    COUNT(t.id) FILTER (WHERE t.status = 'COMPLETED')::NUMERIC / 
    NULLIF(COUNT(t.id), 0) * 100, 
    2
  ) AS completion_rate,
  COUNT(t.id) FILTER (
    WHERE t.due_date < CURRENT_DATE 
    AND t.status != 'COMPLETED'
  ) AS overdue_count,
  ROUND(
    AVG(
      EXTRACT(EPOCH FROM (t.updated_at - t.created_at)) / 3600
    ) FILTER (WHERE t.status = 'COMPLETED'),
    2
  ) AS avg_hours_to_complete,
  MAX(t.updated_at) FILTER (WHERE t.status = 'COMPLETED') AS last_completed_task_date
FROM employees e
LEFT JOIN roles r ON r.id = e.role_id
LEFT JOIN tasks t ON t.assigned_to = e.id
WHERE e.active = TRUE
GROUP BY e.id, e.full_name, e.email, r.name, r.id
ORDER BY completed_tasks DESC;

-- Task Summary View
CREATE OR REPLACE VIEW task_summary AS
SELECT
  DATE_TRUNC('month', t.created_at) AS month,
  t.status,
  r.name AS assigned_role,
  COUNT(*) AS task_count,
  COUNT(*) FILTER (WHERE t.due_date < CURRENT_DATE AND t.status != 'COMPLETED') AS overdue_count
FROM tasks t
JOIN employees e ON t.assigned_to = e.id
JOIN roles r ON e.role_id = r.id
GROUP BY DATE_TRUNC('month', t.created_at), t.status, r.name
ORDER BY month DESC, task_count DESC;

-- Leave Summary View
CREATE OR REPLACE VIEW leave_summary AS
SELECT
  e.id AS employee_id,
  e.full_name,
  r.name AS role,
  COUNT(l.id) AS total_leave_requests,
  SUM(l.end_date - l.start_date + 1) AS total_leave_days,
  MAX(l.end_date) AS last_leave_date
FROM employees e
LEFT JOIN leaves l ON l.employee_id = e.id
LEFT JOIN roles r ON e.role_id = r.id
WHERE e.active = TRUE
GROUP BY e.id, e.full_name, r.name
ORDER BY total_leave_days DESC NULLS LAST;

-- ============================================================================
-- 10. FUNCTIONS
-- ============================================================================

-- Function to spawn a task from recurring task rule
CREATE OR REPLACE FUNCTION spawn_task_from_recurring(rec_id BIGINT)
RETURNS BIGINT AS $$
DECLARE
  r RECORD;
  new_task_id BIGINT;
  new_due_date DATE;
BEGIN
  -- Get the recurring task rule
  SELECT * INTO r FROM recurring_tasks WHERE id = rec_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recurring task rule not found: %', rec_id;
  END IF;

  -- Check if rule is still active
  IF r.end_date IS NOT NULL AND r.end_date < CURRENT_DATE THEN
    RAISE NOTICE 'Recurring task rule % has expired', rec_id;
    RETURN NULL;
  END IF;

  -- Calculate due date (7 days from today by default)
  new_due_date := CURRENT_DATE + INTERVAL '7 days';

  -- Insert new task
  INSERT INTO tasks (
    title, 
    details, 
    assigned_to, 
    created_by, 
    status, 
    due_date, 
    recurring_id
  )
  VALUES (
    r.title,
    r.details,
    r.assigned_to,
    r.created_by,
    'OPEN',
    new_due_date,
    r.id
  )
  RETURNING id INTO new_task_id;

  -- Update last_spawned timestamp
  UPDATE recurring_tasks 
  SET last_spawned = NOW() 
  WHERE id = rec_id;

  RETURN new_task_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get employee role
CREATE OR REPLACE FUNCTION get_employee_role(emp_id UUID)
RETURNS TEXT AS $$
DECLARE
  role_name TEXT;
BEGIN
  SELECT r.name INTO role_name
  FROM employees e
  JOIN roles r ON e.role_id = r.id
  WHERE e.id = emp_id AND e.active = TRUE;
  
  RETURN role_name;
END;
$$ LANGUAGE plpgsql;

-- Function to check if employee is CEO
CREATE OR REPLACE FUNCTION is_ceo(emp_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT get_employee_role(emp_id) = 'CEO');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE self_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_history ENABLE ROW LEVEL SECURITY;

-- ===== EMPLOYEES TABLE POLICIES =====

-- CEO can see all employees
CREATE POLICY "CEO can view all employees"
  ON employees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

-- Employees can view their own record
CREATE POLICY "Employees can view own record"
  ON employees FOR SELECT
  USING (auth_user_id = auth.uid());

-- CEO can insert employees
CREATE POLICY "CEO can insert employees"
  ON employees FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

-- CEO can update employees
CREATE POLICY "CEO can update employees"
  ON employees FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

-- ===== TASKS TABLE POLICIES =====

-- CEO can see all tasks
CREATE POLICY "CEO can view all tasks"
  ON tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

-- Employees can view their assigned tasks
CREATE POLICY "Employees can view assigned tasks"
  ON tasks FOR SELECT
  USING (
    assigned_to = (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- CEO can insert tasks
CREATE POLICY "CEO can insert tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

-- CEO can update all tasks
CREATE POLICY "CEO can update all tasks"
  ON tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

-- Employees can update status of their assigned tasks
CREATE POLICY "Employees can update assigned tasks status"
  ON tasks FOR UPDATE
  USING (
    assigned_to = (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- CEO can delete tasks
CREATE POLICY "CEO can delete tasks"
  ON tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

-- ===== RECURRING TASKS TABLE POLICIES =====

-- CEO can manage all recurring tasks
CREATE POLICY "CEO can view all recurring tasks"
  ON recurring_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

CREATE POLICY "CEO can insert recurring tasks"
  ON recurring_tasks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

CREATE POLICY "CEO can update recurring tasks"
  ON recurring_tasks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

CREATE POLICY "CEO can delete recurring tasks"
  ON recurring_tasks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

-- ===== SELF TASKS TABLE POLICIES =====

-- CEO can view all self tasks
CREATE POLICY "CEO can view all self tasks"
  ON self_tasks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

-- Employees can view their own self tasks
CREATE POLICY "Employees can view own self tasks"
  ON self_tasks FOR SELECT
  USING (
    employee_id = (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- Employees can insert their own self tasks
CREATE POLICY "Employees can insert own self tasks"
  ON self_tasks FOR INSERT
  WITH CHECK (
    employee_id = (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- Employees can update their own self tasks
CREATE POLICY "Employees can update own self tasks"
  ON self_tasks FOR UPDATE
  USING (
    employee_id = (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- Employees can delete their own self tasks
CREATE POLICY "Employees can delete own self tasks"
  ON self_tasks FOR DELETE
  USING (
    employee_id = (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- ===== LEAVES TABLE POLICIES =====

-- CEO can view all leaves
CREATE POLICY "CEO can view all leaves"
  ON leaves FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

-- Employees can view their own leaves
CREATE POLICY "Employees can view own leaves"
  ON leaves FOR SELECT
  USING (
    employee_id = (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- Employees can insert their own leaves
CREATE POLICY "Employees can insert own leaves"
  ON leaves FOR INSERT
  WITH CHECK (
    employee_id = (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- Employees can update their own leaves
CREATE POLICY "Employees can update own leaves"
  ON leaves FOR UPDATE
  USING (
    employee_id = (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- Employees can delete their own leaves
CREATE POLICY "Employees can delete own leaves"
  ON leaves FOR DELETE
  USING (
    employee_id = (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  );

-- ===== TASK HISTORY TABLE POLICIES =====

-- CEO can view all task history
CREATE POLICY "CEO can view all task history"
  ON task_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

-- Employees can view history of their tasks
CREATE POLICY "Employees can view own task history"
  ON task_history FOR SELECT
  USING (
    task_id IN (
      SELECT id FROM tasks 
      WHERE assigned_to = (
        SELECT id FROM employees WHERE auth_user_id = auth.uid()
      )
    )
  );

-- Allow system to insert task history
CREATE POLICY "Allow task history inserts"
  ON task_history FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- 12. GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;

-- ============================================================================
-- 13. SAMPLE DATA (Optional - for testing)
-- ============================================================================

-- Insert a sample CEO employee (uncomment and modify after creating auth user)
-- INSERT INTO employees (auth_user_id, full_name, email, role_id, active)
-- VALUES (
--   'YOUR_AUTH_USER_UUID', 
--   'Admin CEO', 
--   'ceo@anuranan.local', 
--   (SELECT id FROM roles WHERE name = 'CEO'),
--   TRUE
-- )
-- ON CONFLICT (auth_user_id) DO NOTHING;

-- ============================================================================
-- SCHEMA SETUP COMPLETE
-- ============================================================================

-- Verify setup
SELECT 'Database schema setup completed successfully!' AS status;

-- Show table counts
SELECT 
  'roles' AS table_name, 
  COUNT(*) AS record_count 
FROM roles
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'recurring_tasks', COUNT(*) FROM recurring_tasks
UNION ALL
SELECT 'self_tasks', COUNT(*) FROM self_tasks
UNION ALL
SELECT 'leaves', COUNT(*) FROM leaves
UNION ALL
SELECT 'task_history', COUNT(*) FROM task_history;
