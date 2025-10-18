-- Fix RLS policies to allow admin operations on pending_registrations
-- This allows authenticated users (admins) to update pending registrations

-- Allow authenticated users to update pending_registrations
CREATE POLICY "Allow authenticated users to update pending_registrations" 
ON pending_registrations 
FOR UPDATE 
TO authenticated 
USING (true);

-- Allow authenticated users to insert into pending_registrations
CREATE POLICY "Allow authenticated users to insert pending_registrations" 
ON pending_registrations 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to delete pending_registrations
CREATE POLICY "Allow authenticated users to delete pending_registrations" 
ON pending_registrations 
FOR DELETE 
TO authenticated 
USING (true);

-- Allow authenticated users to insert into users table
CREATE POLICY "Allow authenticated users to insert users" 
ON users 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow authenticated users to insert into email_outbox
CREATE POLICY "Allow authenticated users to insert email_outbox" 
ON email_outbox 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('pending_registrations', 'users', 'email_outbox')
ORDER BY tablename, policyname;
