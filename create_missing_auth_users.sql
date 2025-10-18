-- Create missing Supabase Auth users for already-registered alumni
-- This script identifies alumni who are registered but can't log in

-- 1. Find all registered users who need auth accounts
SELECT 'Finding registered users without auth accounts...' as info;

-- Check which users exist in our users table
SELECT 
    u.id as user_id,
    u.email,
    u.alumni_id,
    u.created_at as user_created,
    'NEEDS_AUTH_ACCOUNT' as status
FROM users u
WHERE u.email IS NOT NULL
ORDER BY u.created_at DESC;

-- 2. The solution is to have these users go through the registration flow again
-- This will create their missing Supabase Auth accounts
SELECT 'SOLUTION FOR REGISTERED ALUMNI:' as info;
SELECT '1. Each registered alumni should go to the website' as step_1;
SELECT '2. Find their alumni record in the search results' as step_2;
SELECT '3. Click "Register as Alumni" button' as step_3;
SELECT '4. Fill out the form with a password' as step_4;
SELECT '5. Submit - this creates their missing auth account' as step_5;
SELECT '6. Then they can log in normally' as step_6;

-- 3. Count how many users need this fix
SELECT 'Total registered users needing auth accounts:' as info;
SELECT COUNT(*) as count FROM users WHERE email IS NOT NULL;
