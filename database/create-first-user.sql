-- ============================================================================
-- CREATE FIRST CEO USER
-- ============================================================================
-- Run this AFTER creating the auth user in Supabase Authentication panel
-- Replace 'YOUR_AUTH_USER_UUID_HERE' with the actual UUID from step 11
-- ============================================================================

-- Insert CEO employee record
INSERT INTO employees (auth_user_id, full_name, email, role_id, active)
VALUES (
  'YOUR_AUTH_USER_UUID_HERE',  -- ⚠️ REPLACE THIS with the UUID you copied
  'Admin CEO', 
  'admin@anuranan.com',  -- Must match the email you used in Authentication
  (SELECT id FROM roles WHERE name = 'CEO'),
  TRUE
)
ON CONFLICT (auth_user_id) DO NOTHING;

-- Verify the employee was created
SELECT 
  e.id,
  e.full_name,
  e.email,
  r.name AS role,
  e.active,
  e.auth_user_id
FROM employees e
JOIN roles r ON e.role_id = r.id
WHERE e.email = 'admin@anuranan.com';

-- Show success message
SELECT 'CEO user created successfully! You can now login with:' AS status
UNION ALL
SELECT '  Email: admin@anuranan.com'
UNION ALL
SELECT '  Password: Admin@123456';
