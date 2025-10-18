-- Check what emails are stored in the database

-- 1. Check emails in our custom users table
SELECT 'Emails in custom users table:' as info;
SELECT 
    id,
    email,
    alumni_id,
    created_at
FROM users 
ORDER BY created_at DESC;

-- 2. Check emails in pending_registrations table
SELECT 'Emails in pending_registrations table:' as info;
SELECT 
    id,
    alumni_id,
    email,
    status,
    created_at
FROM pending_registrations 
ORDER BY created_at DESC;

-- 3. Check emails in alumni table
SELECT 'Emails in alumni table:' as info;
SELECT 
    id,
    full_name,
    email,
    graduation_year,
    created_at
FROM alumni 
WHERE email IS NOT NULL
ORDER BY created_at DESC;

-- 4. Check for specific email (ladiomole@hotmail.com)
SELECT 'Checking for ladiomole@hotmail.com:' as info;
SELECT 'In users table:' as table_name, COUNT(*) as count FROM users WHERE email = 'ladiomole@hotmail.com'
UNION ALL
SELECT 'In pending_registrations table:' as table_name, COUNT(*) as count FROM pending_registrations WHERE email = 'ladiomole@hotmail.com'
UNION ALL
SELECT 'In alumni table:' as table_name, COUNT(*) as count FROM alumni WHERE email = 'ladiomole@hotmail.com';

-- 5. Get detailed info for ladiomole@hotmail.com
SELECT 'Detailed info for ladiomole@hotmail.com:' as info;
SELECT 'USERS TABLE:' as source, id, email, alumni_id, created_at FROM users WHERE email = 'ladiomole@hotmail.com'
UNION ALL
SELECT 'PENDING_REGISTRATIONS TABLE:' as source, id::text, email, alumni_id, created_at FROM pending_registrations WHERE email = 'ladiomole@hotmail.com'
UNION ALL
SELECT 'ALUMNI TABLE:' as source, id, email, full_name, created_at FROM alumni WHERE email = 'ladiomole@hotmail.com';
