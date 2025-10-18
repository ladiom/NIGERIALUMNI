-- Simple fix for users table constraint issue

-- 1. Drop the problematic users_id_fkey constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 2. Verify constraint was dropped
SELECT 'Foreign key constraints on users table after fix:' as info;
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'users' AND constraint_type = 'FOREIGN KEY';

-- 3. Create user account for ladiomole@hotmail.com
INSERT INTO users (email, alumni_id)
SELECT 'ladiomole@hotmail.com', alumni_id
FROM pending_registrations 
WHERE email = 'ladiomole@hotmail.com' 
    AND status = 'approved'
ORDER BY created_at DESC
LIMIT 1
ON CONFLICT (email) DO NOTHING;

-- 4. Verify user was created
SELECT 'User account created:' as info;
SELECT * FROM users WHERE email = 'ladiomole@hotmail.com';
