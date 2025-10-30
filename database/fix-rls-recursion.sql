-- ============================================================================
-- FIX: Infinite Recursion in RLS Policies
-- ============================================================================
-- This fixes the circular dependency in employee table policies
-- ============================================================================

-- Drop the problematic policies
DROP POLICY IF EXISTS "CEO can view all employees" ON employees;
DROP POLICY IF EXISTS "Employees can view own record" ON employees;

-- Create better policies without circular dependencies

-- Policy 1: Everyone can view their own employee record (no recursion)
CREATE POLICY "Users can view own employee record"
  ON employees FOR SELECT
  USING (auth_user_id = auth.uid());

-- Policy 2: CEOs can view all employees (simplified, no subquery)
-- We'll use a direct role check without querying employees table
CREATE POLICY "CEOs can view all employees"
  ON employees FOR SELECT
  USING (
    (
      SELECT r.name 
      FROM employees e
      JOIN roles r ON e.role_id = r.id
      WHERE e.auth_user_id = auth.uid()
      LIMIT 1
    ) = 'CEO'
  );

-- Wait, that still has the same issue. Let me use a different approach:
-- We'll create a security definer function that breaks the recursion

DROP POLICY IF EXISTS "CEOs can view all employees" ON employees;

-- Create a function that checks if current user is CEO (SECURITY DEFINER bypasses RLS)
CREATE OR REPLACE FUNCTION is_current_user_ceo()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM employees e
    JOIN roles r ON e.role_id = r.id
    WHERE e.auth_user_id = auth.uid() 
      AND r.name = 'CEO'
      AND e.active = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now create the CEO policy using this function
CREATE POLICY "CEOs can view all employees"
  ON employees FOR SELECT
  USING (is_current_user_ceo());

-- Verify policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd
FROM pg_policies 
WHERE tablename = 'employees' 
  AND cmd = 'SELECT'
ORDER BY policyname;
