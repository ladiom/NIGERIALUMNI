-- Fix missing user profile for ladiomole@hotmail.com (FIXED VERSION)

-- 1. Check if user exists in users table
SELECT 'Checking users table for ladiomole@hotmail.com:' as info;
SELECT * FROM users WHERE email = 'ladiomole@hotmail.com';

-- 2. Check if there's a pending_registrations record
SELECT 'Checking pending_registrations for ladiomole@hotmail.com:' as info;
SELECT * FROM pending_registrations WHERE email = 'ladiomole@hotmail.com';

-- 3. Check if there's an alumni record
SELECT 'Checking alumni table for ladiomole@hotmail.com:' as info;
SELECT * FROM alumni WHERE email = 'ladiomole@hotmail.com';

-- 4. Get the Supabase Auth user ID for ladiomole@hotmail.com
SELECT 'Checking auth.users for ladiomole@hotmail.com:' as info;
SELECT id, email, created_at FROM auth.users WHERE email = 'ladiomole@hotmail.com';

-- 5. Create user record if it doesn't exist (FIXED - renamed variable to avoid ambiguity)
DO $$
DECLARE
    auth_user_id UUID;
    user_alumni_id TEXT;  -- Renamed from 'alumni_id' to avoid ambiguity
BEGIN
    -- Get the auth user ID
    SELECT id INTO auth_user_id FROM auth.users WHERE email = 'ladiomole@hotmail.com';
    
    IF auth_user_id IS NULL THEN
        RAISE NOTICE 'No auth user found for ladiomole@hotmail.com';
        RETURN;
    END IF;
    
    -- Get the alumni_id from pending_registrations (now using table.column syntax)
    SELECT pending_registrations.alumni_id INTO user_alumni_id 
    FROM pending_registrations 
    WHERE pending_registrations.email = 'ladiomole@hotmail.com' 
    ORDER BY pending_registrations.created_at DESC 
    LIMIT 1;
    
    IF user_alumni_id IS NULL THEN
        RAISE NOTICE 'No alumni_id found in pending_registrations for ladiomole@hotmail.com';
        RETURN;
    END IF;
    
    -- Check if user record already exists
    IF NOT EXISTS (SELECT 1 FROM users WHERE users.id = auth_user_id) THEN
        -- Create user record
        INSERT INTO users (id, email, alumni_id, created_at)
        VALUES (auth_user_id, 'ladiomole@hotmail.com', user_alumni_id, NOW());
        
        RAISE NOTICE 'Created user record for ladiomole@hotmail.com with alumni_id: %', user_alumni_id;
    ELSE
        RAISE NOTICE 'User record already exists for ladiomole@hotmail.com';
    END IF;
END $$;

-- 6. Verify the user record was created
SELECT 'Final verification - user record:' as info;
SELECT * FROM users WHERE email = 'ladiomole@hotmail.com';
