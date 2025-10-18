-- Fix database schema issues preventing user creation and login

-- 1. Check the current users table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- 2. Check if there are any foreign key constraints on the users table
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
-- First, let's see what constraints exist
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find and drop any self-referencing foreign key constraints on users.id
    FOR constraint_name IN 
        SELECT tc.constraint_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu 
            ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = 'users'
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'id'
            AND ccu.table_name = 'users'
    LOOP
        EXECUTE 'ALTER TABLE users DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped self-referencing foreign key constraint: %', constraint_name;
    END LOOP;
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
    END IF;
END $$;

-- 5. Fix email_outbox table - add missing columns
ALTER TABLE email_outbox 
ADD COLUMN IF NOT EXISTS to_email VARCHAR(255);

ALTER TABLE email_outbox 
ADD COLUMN IF NOT EXISTS to_name VARCHAR(255);

-- 6. Verify the fixes
SELECT 'Users table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

SELECT 'Email outbox table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'email_outbox' 
ORDER BY ordinal_position;

-- 7. Test user creation
DO $$ 
DECLARE
    test_id UUID;
BEGIN
    test_id := gen_random_uuid();
    
    INSERT INTO users (id, email, alumni_id, created_at) 
    VALUES (test_id, 'test@example.com', 'TEST123', NOW());
    
    RAISE NOTICE 'User creation test passed with ID: %', test_id;
    
    -- Clean up test record
    DELETE FROM users WHERE id = test_id;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'User creation test failed: %', SQLERRM;
END $$;
