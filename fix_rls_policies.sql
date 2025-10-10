-- Fix RLS policies for pending_registrations table
-- This script needs to be run in your Supabase SQL editor

-- First, check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'pending_registrations';

-- Disable RLS temporarily to allow updates (for development)
ALTER TABLE pending_registrations DISABLE ROW LEVEL SECURITY;

-- Or create a policy that allows authenticated users to update
-- (Uncomment the lines below if you want to keep RLS enabled)

-- DROP POLICY IF EXISTS "Allow authenticated users to update pending_registrations" ON pending_registrations;
-- CREATE POLICY "Allow authenticated users to update pending_registrations" 
-- ON pending_registrations 
-- FOR UPDATE 
-- TO authenticated 
-- USING (true) 
-- WITH CHECK (true);

-- Also allow updates to users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- And email_outbox table
ALTER TABLE email_outbox DISABLE ROW LEVEL SECURITY;

-- Check the status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('pending_registrations', 'users', 'email_outbox');
