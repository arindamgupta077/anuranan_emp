-- ============================================================================
-- DEBUG: Check RLS and Employee Query
-- ============================================================================

-- First, let's see what auth.uid() returns for your session
-- (This will be NULL when running from SQL Editor, but shows the concept)
SELECT auth.uid() AS current_auth_uid;

-- Check the actual employee data that exists
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
WHERE e.auth_user_id = '5464c313-888f-483c-adfe-1740bf4ff7dd';

-- Check what the auth user looks like
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE id = '5464c313-888f-483c-adfe-1740bf4ff7dd';

-- Test the exact query that the frontend uses (as service_role)
-- This bypasses RLS to see if data exists
SELECT 
  e.*,
  jsonb_build_object('id', r.id, 'name', r.name) as roles
FROM employees e
LEFT JOIN roles r ON e.role_id = r.id
WHERE e.auth_user_id = '5464c313-888f-483c-adfe-1740bf4ff7dd'
  AND e.active = true;

-- ============================================================================
-- POTENTIAL ISSUE: RLS Policy
-- ============================================================================
-- The frontend uses the ANON key, which goes through RLS policies
-- Let's check if the RLS policies are working correctly

-- Check current RLS policies on employees table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'employees';
