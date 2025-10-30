-- ============================================================================
-- TEST RLS WITH YOUR USER
-- ============================================================================
-- This tests if RLS policies are working correctly
-- ============================================================================

-- Test 1: Direct query (bypasses RLS because you're using service_role in SQL Editor)
SELECT 'Test 1: Direct query (as service_role)' AS test;
SELECT * FROM employees WHERE auth_user_id = '5464c313-888f-483c-adfe-1740bf4ff7dd';

-- Test 2: Simulate what happens when authenticated user queries
-- Note: This won't work exactly the same in SQL Editor because auth.uid() is NULL here
-- But we can test the policy logic

-- Test 3: Check if there are any other policies blocking
SELECT 'Test 3: Check all policies on employees table' AS test;
SELECT 
  policyname,
  cmd,
  qual as using_expression,
  with_check
FROM pg_policies 
WHERE tablename = 'employees'
ORDER BY cmd, policyname;

-- Test 4: Verify the user's auth_user_id matches what we expect  
SELECT 'Test 4: Verify auth user' AS test;
SELECT 
  u.id as auth_id,
  u.email,
  e.id as employee_id,
  e.full_name,
  e.auth_user_id,
  CASE 
    WHEN e.auth_user_id = u.id THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as status
FROM auth.users u
LEFT JOIN employees e ON e.auth_user_id = u.id
WHERE u.email = 'admin@anuranan.com';

-- ============================================================================
-- SOLUTION: The frontend needs to use the authenticated context
-- ============================================================================
-- The issue might be timing - auth.uid() might not be set yet when querying

-- Let's add a bypass for anon users to view their own employee record
-- This is already in place with: auth_user_id = auth.uid()

-- The real issue is likely that Supabase client isn't passing the JWT properly
-- Let's verify the environment variables are correct
