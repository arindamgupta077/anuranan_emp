-- ============================================================================
-- DIAGNOSE LOGIN ISSUE
-- ============================================================================
-- Run this to check what's wrong with your login
-- ============================================================================

-- Step 1: Check if roles table has data
SELECT 'Step 1: Checking roles table' AS step;
SELECT * FROM roles;

-- Step 2: Check if the auth user exists
SELECT 'Step 2: Checking auth users (this should show your user)' AS step;
SELECT id, email, created_at, confirmed_at 
FROM auth.users 
WHERE email = 'admin@anuranan.com';

-- Step 3: Check if employee record exists
SELECT 'Step 3: Checking employees table' AS step;
SELECT 
  e.id,
  e.auth_user_id,
  e.full_name,
  e.email,
  e.role_id,
  e.active,
  r.name AS role_name
FROM employees e
LEFT JOIN roles r ON e.role_id = r.id
WHERE e.email = 'admin@anuranan.com';

-- Step 4: Show ALL employees (to see if table is empty)
SELECT 'Step 4: All employees in database' AS step;
SELECT COUNT(*) AS total_employees FROM employees;
SELECT * FROM employees;

-- ============================================================================
-- IF STEP 3 SHOWS NO EMPLOYEE RECORD, RUN THE FIX BELOW:
-- ============================================================================

-- OPTION A: If you know your auth user UUID, replace it below and run:
/*
INSERT INTO employees (auth_user_id, full_name, email, role_id, active)
VALUES (
  'PASTE-YOUR-UUID-HERE',  -- Get this from Step 2 above
  'Admin CEO', 
  'admin@anuranan.com',
  (SELECT id FROM roles WHERE name = 'CEO'),
  TRUE
)
ON CONFLICT (auth_user_id) DO UPDATE 
SET active = TRUE;
*/

-- OPTION B: Auto-create employee for existing auth user (if UUID exists):
-- Uncomment and run this:
/*
INSERT INTO employees (auth_user_id, full_name, email, role_id, active)
SELECT 
  id,
  'Admin CEO',
  email,
  (SELECT id FROM roles WHERE name = 'CEO'),
  TRUE
FROM auth.users
WHERE email = 'admin@anuranan.com'
ON CONFLICT (auth_user_id) DO UPDATE 
SET active = TRUE, full_name = 'Admin CEO';
*/

-- ============================================================================
-- After running the fix, verify it worked:
-- ============================================================================
/*
SELECT 
  e.id,
  e.auth_user_id,
  e.full_name,
  e.email,
  r.name AS role,
  e.active
FROM employees e
JOIN roles r ON e.role_id = r.id
WHERE e.email = 'admin@anuranan.com';
*/
