-- Check and fix user account for ladiomole@hotmail.com

-- 1. Check if user exists in users table
SELECT 'Checking users table...' as step;
SELECT * FROM users WHERE email = 'ladiomole@hotmail.com';

-- 2. Check pending registrations
SELECT 'Checking pending registrations...' as step;
SELECT * FROM pending_registrations 
WHERE email = 'ladiomole@hotmail.com' 
ORDER BY created_at DESC;

-- 3. Check if there's an approved registration that needs a user account
SELECT 'Checking for approved registrations without user accounts...' as step;
SELECT 
    pr.id as pending_id,
    pr.alumni_id,
    pr.email,
    pr.status,
    pr.created_at,
    u.id as user_id
FROM pending_registrations pr
LEFT JOIN users u ON u.email = pr.email
WHERE pr.email = 'ladiomole@hotmail.com' 
    AND pr.status = 'approved'
    AND u.id IS NULL;

-- 4. If no user account exists, create one
-- First, let's see what alumni_id we should use
SELECT 'Getting alumni_id for user creation...' as step;
SELECT alumni_id FROM pending_registrations 
WHERE email = 'ladiomole@hotmail.com' 
    AND status = 'approved'
ORDER BY created_at DESC
LIMIT 1;

-- 5. Create user account if it doesn't exist
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
SELECT 'Verifying user account creation...' as step;
SELECT * FROM users WHERE email = 'ladiomole@hotmail.com';
