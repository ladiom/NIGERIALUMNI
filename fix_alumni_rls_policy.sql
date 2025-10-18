-- Fix RLS policy for alumni table to allow new alumni creation

-- 1. Check current RLS policies on alumni table
SELECT 'Current RLS policies on alumni table:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'alumni';

-- 2. Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to all alumni for authenticated users" ON alumni;
DROP POLICY IF EXISTS "Allow insert access for anonymous users" ON alumni;
DROP POLICY IF EXISTS "Allow authenticated users to update alumni" ON alumni;
DROP POLICY IF EXISTS "Allow authenticated users to delete alumni" ON alumni;

-- 3. Create new RLS policies for alumni table

-- Policy 1: Allow everyone to read alumni records
CREATE POLICY "Allow everyone to read alumni"
ON alumni
FOR SELECT
TO public
USING (true);

-- Policy 2: Allow anonymous users to insert new alumni records
CREATE POLICY "Allow anonymous users to insert alumni"
ON alumni
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy 3: Allow authenticated users to update alumni records
CREATE POLICY "Allow authenticated users to update alumni"
ON alumni
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete alumni records
CREATE POLICY "Allow authenticated users to delete alumni"
ON alumni
FOR DELETE
TO authenticated
USING (true);

-- 4. Verify the new policies
SELECT 'New RLS policies on alumni table:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'alumni';

-- 5. Test alumni creation
SELECT 'Testing alumni creation...' as info;
DO $$
DECLARE
    test_alumni_id TEXT;
    test_school_id INTEGER;
BEGIN
    -- Get a real school ID for the test
    SELECT id INTO test_school_id FROM schools LIMIT 1;
    
    IF test_school_id IS NULL THEN
        RAISE NOTICE 'No schools found - skipping alumni creation test';
    ELSE
        -- Test alumni creation
        test_alumni_id := 'TEST' || gen_random_uuid()::text;
        
        INSERT INTO alumni (
            id, full_name, phone_number, email, graduation_year, 
            school_id, adm_year, current_position, current_company
        ) VALUES (
            test_alumni_id, 'Test Alumni', '1234567890', 'test@example.com', 
            2023, test_school_id, 2020, 'Test Position', 'Test Company'
        );
        
        RAISE NOTICE 'Alumni creation test PASSED with ID: %', test_alumni_id;
        
        -- Clean up the test record
        DELETE FROM alumni WHERE id = test_alumni_id;
        RAISE NOTICE 'Test alumni cleaned up successfully';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Alumni creation test FAILED: %', SQLERRM;
        RAISE;
END $$;
