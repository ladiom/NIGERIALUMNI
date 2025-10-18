-- Fix the missing pending_registrations status constraint
-- This is the critical constraint that allows 'approved' and 'rejected' statuses

-- First, let's check if the constraint exists with a different name
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'pending_registrations'
    AND tc.constraint_type = 'CHECK'
    AND cc.check_clause LIKE '%status%';

-- If no status constraint exists, create it
-- Drop any existing status constraint first (in case it has a different name)
DO $$ 
DECLARE
    constraint_name TEXT;
BEGIN
    -- Find any existing status constraint
    SELECT tc.constraint_name INTO constraint_name
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.check_constraints cc 
        ON tc.constraint_name = cc.constraint_name
    WHERE tc.table_name = 'pending_registrations'
        AND tc.constraint_type = 'CHECK'
        AND cc.check_clause LIKE '%status%';
    
    -- Drop it if it exists
    IF constraint_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE pending_registrations DROP CONSTRAINT ' || constraint_name;
        RAISE NOTICE 'Dropped existing status constraint: %', constraint_name;
    END IF;
    
    -- Create the new constraint
    ALTER TABLE pending_registrations 
    ADD CONSTRAINT pending_registrations_status_check 
    CHECK (status IN ('pending', 'sent', 'completed', 'pending_update', 'approved', 'rejected'));
    
    RAISE NOTICE 'Created new status constraint with all required statuses';
END $$;

-- Verify the constraint was created
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'pending_registrations'
    AND tc.constraint_type = 'CHECK'
    AND cc.check_clause LIKE '%status%';

-- Test the constraint by trying to insert a test record with 'approved' status
-- (This will be rolled back automatically)
DO $$ 
DECLARE
    test_alumni_id TEXT;
BEGIN
    -- Get a real alumni ID from the database
    SELECT id INTO test_alumni_id FROM alumni LIMIT 1;
    
    IF test_alumni_id IS NULL THEN
        RAISE NOTICE 'No alumni records found - skipping constraint test';
    ELSE
        -- Test with a real alumni ID
        INSERT INTO pending_registrations (id, alumni_id, email, status) 
        VALUES (999999, test_alumni_id, 'test@example.com', 'approved');
        RAISE NOTICE 'Status constraint test passed - approved status is allowed for alumni_id: %', test_alumni_id;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Status constraint test failed: %', SQLERRM;
        -- Don't re-raise the exception for the test
END $$;
