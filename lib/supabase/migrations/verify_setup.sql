-- Verification queries for role-based authentication setup
-- Run these queries in Supabase SQL Editor to verify your setup

-- 1. Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
) AS profiles_table_exists;

-- 2. Check if user_role enum exists
SELECT EXISTS (
  SELECT FROM pg_type 
  WHERE typname = 'user_role'
) AS user_role_enum_exists;

-- 3. View all profiles with their roles
SELECT 
  id,
  email,
  full_name,
  role,
  created_at,
  updated_at
FROM public.profiles
ORDER BY created_at ASC;

-- 4. Count users by role
SELECT 
  role,
  COUNT(*) as count
FROM public.profiles
GROUP BY role
ORDER BY 
  CASE role
    WHEN 'superadmin' THEN 1
    WHEN 'admin' THEN 2
    WHEN 'student' THEN 3
  END;

-- 5. Check RLS policies on profiles table
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
WHERE tablename = 'profiles';

-- 6. Verify triggers exist
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'profiles' OR event_object_table = 'users';

-- 7. Check if first user is superadmin
SELECT 
  email,
  role,
  created_at,
  CASE 
    WHEN role = 'superadmin' THEN '✓ Correct - First user is SuperAdmin'
    ELSE '✗ Error - First user should be SuperAdmin'
  END as status
FROM public.profiles
ORDER BY created_at ASC
LIMIT 1;

-- 8. List all superadmins (should typically be 1)
SELECT 
  email,
  full_name,
  created_at
FROM public.profiles
WHERE role = 'superadmin'
ORDER BY created_at ASC;

-- 9. Check table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 10. Test RLS is enabled
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'profiles';

-- Expected Results:
-- ✓ profiles_table_exists: true
-- ✓ user_role_enum_exists: true
-- ✓ At least one profile exists
-- ✓ First user has role 'superadmin'
-- ✓ RLS policies exist (at least 5)
-- ✓ Triggers exist (on_auth_user_created, on_profile_updated)
-- ✓ rowsecurity: true
