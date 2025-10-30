-- ============================================================================
-- AUTO-FIX: Create Employee Record for Existing Auth User
-- ============================================================================
-- This will automatically link your admin@anuranan.com auth user 
-- to an employee record with CEO role
-- ============================================================================

-- This works if:
-- 1. You already created the auth user in Supabase Authentication
-- 2. The roles table has data
-- 3. The employee record is missing

INSERT INTO employees (auth_user_id, full_name, email, role_id, active)
SELECT 
  u.id AS auth_user_id,
  'Admin CEO' AS full_name,
  u.email,
  (SELECT id FROM roles WHERE name = 'CEO') AS role_id,
  TRUE AS active
FROM auth.users u
WHERE u.email = 'admin@anuranan.com'
  AND NOT EXISTS (
    SELECT 1 FROM employees WHERE auth_user_id = u.id
  )
ON CONFLICT (auth_user_id) DO UPDATE 
SET 
  active = TRUE,
  full_name = 'Admin CEO',
  email = EXCLUDED.email,
  role_id = (SELECT id FROM roles WHERE name = 'CEO');

-- Verify the fix worked
SELECT 
  '✅ SUCCESS! Employee record created/updated' AS status,
  e.id,
  e.auth_user_id,
  e.full_name,
  e.email,
  r.name AS role,
  e.active
FROM employees e
JOIN roles r ON e.role_id = r.id
WHERE e.email = 'admin@anuranan.com';

-- If no rows returned, check these:
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users WHERE email = 'admin@anuranan.com') = 0 
    THEN '❌ Auth user does not exist. Create it first in Authentication panel!'
    WHEN (SELECT COUNT(*) FROM roles WHERE name = 'CEO') = 0
    THEN '❌ CEO role does not exist. Run schema.sql first!'
    ELSE '✅ Everything looks good'
  END AS diagnostic;
