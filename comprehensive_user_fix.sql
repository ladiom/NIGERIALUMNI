-- Comprehensive fix for user profile issue

-- Step 1: Check all related data
SELECT '=== STEP 1: CHECKING ALL DATA ===' as info;

-- Check auth.users
SELECT 'Auth users for ladiomole@hotmail.com:' as info;
SELECT id, email, created_at FROM auth.users WHERE email = 'ladiomole@hotmail.com';

-- Check users table
SELECT 'Users table for ladiomole@hotmail.com:' as info;
SELECT * FROM users WHERE email = 'ladiomole@hotmail.com';

-- Check pending_registrations
SELECT 'Pending registrations for ladiomole@hotmail.com:' as info;
SELECT * FROM pending_registrations WHERE email = 'ladiomole@hotmail.com';

-- Check alumni table
SELECT 'Alumni table for ladiomole@hotmail.com:' as info;
SELECT * FROM alumni WHERE email = 'ladiomole@hotmail.com';

-- Step 2: Comprehensive fix
SELECT '=== STEP 2: COMPREHENSIVE FIX ===' as info;

DO $$
DECLARE
    auth_user_id UUID;
    user_alumni_id TEXT;
    existing_user_record RECORD;
BEGIN
    -- Get the auth user ID
    SELECT id INTO auth_user_id FROM auth.users WHERE email = 'ladiomole@hotmail.com';
    
    IF auth_user_id IS NULL THEN
        RAISE NOTICE 'ERROR: No auth user found for ladiomole@hotmail.com';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found auth user ID: %', auth_user_id;
    
    -- Get the alumni_id from pending_registrations (approved status)
    SELECT alumni_id INTO user_alumni_id 
    FROM pending_registrations 
    WHERE email = 'ladiomole@hotmail.com' 
      AND status = 'approved'
    ORDER BY created_at DESC 
    LIMIT 1;
    
    IF user_alumni_id IS NULL THEN
        -- Try without status filter
        SELECT alumni_id INTO user_alumni_id 
        FROM pending_registrations 
        WHERE email = 'ladiomole@hotmail.com' 
        ORDER BY created_at DESC 
        LIMIT 1;
    END IF;
    
    IF user_alumni_id IS NULL THEN
        RAISE NOTICE 'ERROR: No alumni_id found in pending_registrations for ladiomole@hotmail.com';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found alumni_id: %', user_alumni_id;
    
    -- Check if user record exists by email
    SELECT * INTO existing_user_record FROM users WHERE email = 'ladiomole@hotmail.com';
    
    IF existing_user_record IS NOT NULL THEN
        -- Update existing record
        UPDATE users 
        SET alumni_id = user_alumni_id,
            id = auth_user_id
        WHERE email = 'ladiomole@hotmail.com';
        
        RAISE NOTICE 'SUCCESS: Updated existing user record with alumni_id: %', user_alumni_id;
    ELSE
        -- Check if user record exists by auth ID
        SELECT * INTO existing_user_record FROM users WHERE id = auth_user_id;
        
        IF existing_user_record IS NOT NULL THEN
            -- Update by auth ID
            UPDATE users 
            SET alumni_id = user_alumni_id,
                email = 'ladiomole@hotmail.com'
            WHERE id = auth_user_id;
            
            RAISE NOTICE 'SUCCESS: Updated user record by auth ID with alumni_id: %', user_alumni_id;
        ELSE
            -- Insert new record
            INSERT INTO users (id, email, alumni_id, created_at)
            VALUES (auth_user_id, 'ladiomole@hotmail.com', user_alumni_id, NOW());
            
            RAISE NOTICE 'SUCCESS: Created new user record with alumni_id: %', user_alumni_id;
        END IF;
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- Step 3: Final verification
SELECT '=== STEP 3: FINAL VERIFICATION ===' as info;

-- Check the final user record
SELECT 'Final user record:' as info;
SELECT * FROM users WHERE email = 'ladiomole@hotmail.com';

-- Check by auth ID too
SELECT 'Final user record by auth ID:' as info;
SELECT u.*, au.email as auth_email 
FROM users u 
JOIN auth.users au ON u.id = au.id 
WHERE au.email = 'ladiomole@hotmail.com';
