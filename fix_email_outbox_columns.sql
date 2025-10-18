-- Fix email_outbox table by adding missing columns
-- This is a simple, focused fix for the schema cache error

-- 1. Check current email_outbox structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'email_outbox' 
ORDER BY ordinal_position;

-- 2. Add missing columns to email_outbox
ALTER TABLE email_outbox 
ADD COLUMN IF NOT EXISTS to_email VARCHAR(255);

ALTER TABLE email_outbox 
ADD COLUMN IF NOT EXISTS to_name VARCHAR(255);

-- 3. Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'email_outbox' 
ORDER BY ordinal_position;

-- 4. Test inserting a record to verify it works
DO $$ 
BEGIN
    INSERT INTO email_outbox (to_email, to_name, subject, body, status) 
    VALUES ('test@example.com', 'Test User', 'Test Subject', 'Test Body', 'pending');
    
    RAISE NOTICE 'Email outbox test passed - columns are working';
    
    -- Clean up test record
    DELETE FROM email_outbox WHERE to_email = 'test@example.com';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Email outbox test failed: %', SQLERRM;
END $$;
