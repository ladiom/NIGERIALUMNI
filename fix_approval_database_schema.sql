-- Fix database schema issues for admin approval functionality

-- 1. Fix pending_registrations status constraint to include 'approved' and 'rejected'
ALTER TABLE pending_registrations 
DROP CONSTRAINT IF EXISTS pending_registrations_status_check;

ALTER TABLE pending_registrations 
ADD CONSTRAINT pending_registrations_status_check 
CHECK (status IN ('pending', 'sent', 'completed', 'pending_update', 'approved', 'rejected'));

-- 2. Fix users table to have proper ID generation
-- First, let's check the current users table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- If the users table doesn't have proper ID setup, we need to fix it
-- Add a proper ID column if it doesn't exist or fix the existing one
ALTER TABLE users 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 3. Add missing email_type column to email_outbox table
ALTER TABLE email_outbox 
ADD COLUMN IF NOT EXISTS email_type VARCHAR(50);

-- 4. Add any other missing columns that might be needed
ALTER TABLE email_outbox 
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMP;

-- 5. Verify all constraints and columns
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('pending_registrations', 'users', 'email_outbox')
ORDER BY table_name, ordinal_position;

-- 6. Check constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name IN ('pending_registrations', 'users', 'email_outbox')
ORDER BY tc.table_name, tc.constraint_name;
