-- Check what alumni records exist and their ID format

-- 1. Check all alumni records (first 10)
SELECT 'First 10 alumni records:' as info;
SELECT id, full_name, email, graduation_year 
FROM alumni 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check if SPADY1962965HI exists
SELECT 'Checking for SPADY1962965HI:' as info;
SELECT * FROM alumni WHERE id = 'SPADY1962965HI';

-- 3. Check if there's a similar ID (maybe typo)
SELECT 'Checking for similar IDs:' as info;
SELECT id, full_name, email 
FROM alumni 
WHERE id LIKE 'SPA%' 
   OR id LIKE '%1962965%'
   OR id LIKE '%1962%';

-- 4. Check pending_registrations to see what alumni_id was stored
SELECT 'Pending registrations for ladiomole@hotmail.com:' as info;
SELECT alumni_id, status, created_at 
FROM pending_registrations 
WHERE email = 'ladiomole@hotmail.com' 
ORDER BY created_at DESC;

-- 5. Check if there's an alumni record with ladiomole@hotmail.com email
SELECT 'Alumni record by email:' as info;
SELECT * FROM alumni WHERE email = 'ladiomole@hotmail.com';
