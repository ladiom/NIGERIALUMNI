-- Clean fix for pending_registrations RLS policies
-- This will drop ALL existing policies and create clean new ones

-- Step 1: Drop ALL existing policies for pending_registrations
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    -- Get all policies for pending_registrations table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'pending_registrations'
    LOOP
        -- Drop each policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON pending_registrations', policy_record.policyname);
    END LOOP;
END $$;

-- Step 2: Create clean, simple policies

-- Allow anonymous users to insert pending registrations
CREATE POLICY "anon_insert_pending_registrations" 
ON pending_registrations FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow authenticated users to insert pending registrations
CREATE POLICY "authenticated_insert_pending_registrations" 
ON pending_registrations FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow everyone to read pending registrations (for admin interface)
CREATE POLICY "public_read_pending_registrations" 
ON pending_registrations FOR SELECT 
USING (true);

-- Allow admins to manage all pending registrations
CREATE POLICY "admin_manage_pending_registrations" 
ON pending_registrations FOR ALL 
USING (auth.role() = 'admin') 
WITH CHECK (auth.role() = 'admin');

-- Allow users to update their own pending registrations by email
CREATE POLICY "users_update_own_pending_registrations" 
ON pending_registrations FOR UPDATE 
TO authenticated 
USING (email = auth.email())
WITH CHECK (email = auth.email());
