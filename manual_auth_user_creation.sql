-- Manual fix for ladiomole@hotmail.com
-- This user was approved before our fix, so they need an auth user created

-- 1. Check current status
SELECT 'Current user status:' as info;
SELECT 
    u.id as user_id,
    u.email,
    u.alumni_id,
    u.created_at as user_created,
    pr.id as pending_id,
    pr.status as pending_status,
    pr.created_at as pending_created
FROM users u
LEFT JOIN pending_registrations pr ON pr.email = u.email
WHERE u.email = 'ladiomole@hotmail.com';

-- 2. The user needs to go through the registration flow again
-- This will create the Supabase Auth user they need
SELECT 'SOLUTION: The user should:' as info;
SELECT '1. Go to the website and find their alumni record' as step_1;
SELECT '2. Click "Register" to update their information' as step_2;
SELECT '3. Fill out the form with a NEW password' as step_3;
SELECT '4. Submit the form - this will create their auth account' as step_4;
SELECT '5. Then they can log in with their email and new password' as step_5;
