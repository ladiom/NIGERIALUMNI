-- Fix the users_id_fkey constraint that's preventing user creation

-- 1. Check current foreign key constraints on users table
SELECT 'Current foreign key constraints on users table:' as info;
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

-- 2. Drop the problematic users_id_fkey constraint
DO $$
BEGIN
    -- Drop the specific constraint that's causing the issue
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'public.users'::regclass 
        AND conname = 'users_id_fkey'
    ) THEN
        ALTER TABLE users DROP CONSTRAINT users_id_fkey;
        RAISE NOTICE 'Dropped users_id_fkey constraint successfully';
    ELSE
        RAISE NOTICE 'users_id_fkey constraint not found - may have been already dropped';
    END IF;
END $$;

-- 3. Verify the constraint was dropped
SELECT 'Foreign key constraints after fix:' as info;
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

-- 4. Test user creation
SELECT 'Testing user creation...' as info;
DO $$
DECLARE
    test_user_id UUID;
    test_alumni_id TEXT;
BEGIN
    -- Get a real alumni ID for the test
    SELECT id INTO test_alumni_id FROM alumni LIMIT 1;
    
    IF test_alumni_id IS NULL THEN
        RAISE NOTICE 'No alumni records found - skipping user creation test';
    ELSE
        -- Test user creation
        INSERT INTO users (email, alumni_id)
        VALUES ('test_user_' || gen_random_uuid() || '@example.com', test_alumni_id)
        RETURNING id INTO test_user_id;
        
        RAISE NOTICE 'User creation test PASSED with ID: %', test_user_id;
        
        -- Clean up the test user
        DELETE FROM users WHERE id = test_user_id;
        RAISE NOTICE 'Test user cleaned up successfully';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'User creation test FAILED: %', SQLERRM;
        RAISE;
END $$;

-- 5. Now create the actual user account for ladiomole@hotmail.com
SELECT 'Creating user account for ladiomole@hotmail.com...' as info;
DO $$
DECLARE
    target_email TEXT := 'ladiomole@hotmail.com';
    target_alumni_id TEXT;
    new_user_id UUID;
    user_exists BOOLEAN;
BEGIN
    -- Check if user already exists
    SELECT EXISTS(SELECT 1 FROM users WHERE email = target_email) INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'User account already exists for %', target_email;
    ELSE
        -- Get the alumni_id from the approved registration
        SELECT alumni_id INTO target_alumni_id 
        FROM pending_registrations 
        WHERE email = target_email 
            AND status = 'approved'
        ORDER BY created_at DESC
        LIMIT 1;
        
        IF target_alumni_id IS NULL THEN
            RAISE NOTICE 'No approved registration found for %', target_email;
        ELSE
            -- Create user account
            INSERT INTO users (email, alumni_id)
            VALUES (target_email, target_alumni_id)
            RETURNING id INTO new_user_id;
            
            RAISE NOTICE 'Created user account for % with ID: % and alumni_id: %', 
                target_email, new_user_id, target_alumni_id;
        END IF;
    END IF;
END $$;

-- 6. Verify the user account was created
SELECT 'Final verification - user account:' as info;
SELECT * FROM users WHERE email = 'ladiomole@hotmail.com';
