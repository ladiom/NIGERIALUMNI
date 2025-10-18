-- Fix ONLY the users table issues for user creation and login
-- This is a focused fix for the foreign key constraint problems

-- 1. Check current users table structure
SELECT 'Current users table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Check foreign key constraints on users table
SELECT 'Foreign key constraints on users table:' as info;
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'users';

-- 3. Fix the users table - remove problematic foreign key constraints
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find and drop any self-referencing or problematic foreign key constraints
    FOR constraint_name IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = 'users'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND (kcu.column_name = 'id' OR kcu.column_name = 'alumni_id')
    LOOP
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped foreign key constraint: %', constraint_name;
    END LOOP;
    
    RAISE NOTICE 'All problematic foreign key constraints removed from users table';
END $$;

-- 4. Ensure users table has proper structure
-- Make sure id is a primary key with UUID default
ALTER TABLE users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Ensure id is the primary key
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'users' 
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        ALTER TABLE users ADD PRIMARY KEY (id);
        RAISE NOTICE 'Added primary key constraint to users.id';
    ELSE
        RAISE NOTICE 'Primary key constraint already exists on users.id';
    END IF;
END $$;

-- 5. Verify the fixes
SELECT 'Updated users table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 6. Test user creation
SELECT 'Testing user creation:' as info;
DO $$ 
DECLARE
    test_id UUID;
BEGIN
    test_id := gen_random_uuid();
    
    INSERT INTO users (id, email, alumni_id, created_at) 
    VALUES (test_id, 'test@example.com', 'TEST123', NOW());
    
    RAISE NOTICE 'User creation test PASSED with ID: %', test_id;
    
    -- Clean up test record
    DELETE FROM users WHERE id = test_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'User creation test FAILED: %', SQLERRM;
END $$;
