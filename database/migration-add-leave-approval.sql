-- ============================================================================
-- Migration: Add approval fields to leaves table
-- ============================================================================
-- This migration adds status, approved_by, and approved_at columns to the
-- leaves table to support the leave approval workflow.
-- ============================================================================

-- Add status column (PENDING, APPROVED, REJECTED)
ALTER TABLE leaves 
ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'PENDING'
CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'));

-- Add approved_by column (references employee who approved/rejected)
ALTER TABLE leaves 
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES employees(id) ON DELETE SET NULL;

-- Add approved_at column (timestamp when approved/rejected)
ALTER TABLE leaves 
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_leaves_status ON leaves(status);

-- Create index for approved_by
CREATE INDEX IF NOT EXISTS idx_leaves_approved_by ON leaves(approved_by);

-- Update existing leaves to PENDING status (if any)
UPDATE leaves SET status = 'PENDING' WHERE status IS NULL;

-- ============================================================================
-- Update RLS Policies for leaves table
-- ============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Employees can view own leaves" ON leaves;
DROP POLICY IF EXISTS "CEO can view all leaves" ON leaves;
DROP POLICY IF EXISTS "Employees can create own leaves" ON leaves;
DROP POLICY IF EXISTS "Employees can update own pending leaves" ON leaves;
DROP POLICY IF EXISTS "CEO can update any leave" ON leaves;
DROP POLICY IF EXISTS "Employees can delete own pending leaves" ON leaves;

-- Enable RLS
ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

-- Policy: Employees can view their own leaves
CREATE POLICY "Employees can view own leaves" ON leaves
  FOR SELECT
  USING (
    employee_id = (SELECT id FROM employees WHERE auth_user_id = auth.uid())
  );

-- Policy: CEO can view all leaves
CREATE POLICY "CEO can view all leaves" ON leaves
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

-- Policy: Employees can create their own leave requests
CREATE POLICY "Employees can create own leaves" ON leaves
  FOR INSERT
  WITH CHECK (
    employee_id = (SELECT id FROM employees WHERE auth_user_id = auth.uid())
  );

-- Policy: Employees can update their own PENDING leave requests
CREATE POLICY "Employees can update own pending leaves" ON leaves
  FOR UPDATE
  USING (
    employee_id = (SELECT id FROM employees WHERE auth_user_id = auth.uid())
    AND status = 'PENDING'
  )
  WITH CHECK (
    employee_id = (SELECT id FROM employees WHERE auth_user_id = auth.uid())
    AND status = 'PENDING'
  );

-- Policy: CEO can update any leave (for approval/rejection)
CREATE POLICY "CEO can update any leave" ON leaves
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid() AND r.name = 'CEO'
    )
  );

-- Policy: Employees can delete their own PENDING leave requests
CREATE POLICY "Employees can delete own pending leaves" ON leaves
  FOR DELETE
  USING (
    employee_id = (SELECT id FROM employees WHERE auth_user_id = auth.uid())
    AND status = 'PENDING'
  );

-- ============================================================================
-- Verification
-- ============================================================================

-- Check the updated table structure
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'leaves' 
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'leaves';

-- Sample query to test (should return empty if no leaves exist yet)
SELECT 
  id,
  employee_id,
  start_date,
  end_date,
  reason,
  status,
  approved_by,
  approved_at,
  created_at
FROM leaves
LIMIT 5;
