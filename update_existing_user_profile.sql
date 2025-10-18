-- Update existing user profile for ladiomole@hotmail.com

-- 1. Check current user record
SELECT 'Current user record for ladiomole@hotmail.com:' as info;
SELECT * FROM users WHERE email = 'ladiomole@hotmail.com';

-- 2. Check pending_registrations for alumni_id
SELECT 'Pending registrations for ladiomole@hotmail.com:' as info;
SELECT * FROM pending_registrations WHERE email = 'ladiomole@hotmail.com';

-- 3. Update the existing user record with alumni_id
DO $$
DECLARE
    auth_user_id UUID;
    user_alumni_id TEXT;
    existing_user_id UUID;
BEGIN
    -- Get the auth user ID
    SELECT id INTO auth_user_id FROM auth.users WHERE email = 'ladiomole@hotmail.com';
    
    IF auth_user_id IS NULL THEN
        RAISE NOTICE 'No auth user found for ladiomole@hotmail.com';
        RETURN;
    END IF;
    
    -- Get the alumni_id from pending_registrations
    SELECT pending_registrations.alumni_id INTO user_alumni_id 
    FROM pending_registrations 
    WHERE pending_registrations.email = 'ladiomole@hotmail.com' 
    ORDER BY pending_registrations.created_at DESC 
    LIMIT 1;
    
    IF user_alumni_id IS NULL THEN
        RAISE NOTICE 'No alumni_id found in pending_registrations for ladiomole@hotmail.com';
        RETURN;
    END IF;
    
    -- Check if user record exists
    SELECT id INTO existing_user_id FROM users WHERE email = 'ladiomole@hotmail.com';
    
    IF existing_user_id IS NOT NULL THEN
        -- UPDATE the existing record
        UPDATE users 
        SET alumni_id = user_alumni_id,
            id = auth_user_id  -- Make sure the ID matches the auth user
        WHERE email = 'ladiomole@hotmail.com';
        
        RAISE NOTICE 'Updated existing user record for ladiomole@hotmail.com with alumni_id: %', user_alumni_id;
    ELSE
        -- INSERT new record (shouldn't happen based on the error)
        INSERT INTO users (id, email, alumni_id, created_at)
        VALUES (auth_user_id, 'ladiomole@hotmail.com', user_alumni_id, NOW());
        
        RAISE NOTICE 'Created new user record for ladiomole@hotmail.com with alumni_id: %', user_alumni_id;
    END IF;
END $$;

-- 4. Verify the user record was updated
SELECT 'Final verification - updated user record:' as info;
SELECT * FROM users WHERE email = 'ladiomole@hotmail.com';
