-- Fix RLS policies for pending_registrations table
-- This allows anonymous users to create pending registrations

-- First, drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Anyone can create pending registrations" ON pending_registrations;
DROP POLICY IF EXISTS "Admins manage pending registrations" ON pending_registrations;
DROP POLICY IF EXISTS "Users can view own pending registrations" ON pending_registrations;
DROP POLICY IF EXISTS "Users can update own pending registrations" ON pending_registrations;

-- Create a simple policy that allows anonymous users to insert
CREATE POLICY "Allow anonymous pending registration creation" 
ON pending_registrations FOR INSERT 
TO anon 
WITH CHECK (true);

-- Allow authenticated users to insert as well
CREATE POLICY "Allow authenticated pending registration creation" 
ON pending_registrations FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow admins to manage all pending registrations
CREATE POLICY "Admins can manage all pending registrations" 
ON pending_registrations FOR ALL 
USING (auth.role() = 'admin') 
WITH CHECK (auth.role() = 'admin');

-- Allow users to view their own pending registrations by email
CREATE POLICY "Users can view own pending registrations by email" 
ON pending_registrations FOR SELECT 
TO authenticated 
USING (email = auth.email());

-- Allow users to update their own pending registrations by email
CREATE POLICY "Users can update own pending registrations by email" 
ON pending_registrations FOR UPDATE 
TO authenticated 
USING (email = auth.email())
WITH CHECK (email = auth.email());

-- Allow public to read pending registrations (for admin interface)
CREATE POLICY "Public can read pending registrations" 
ON pending_registrations FOR SELECT 
USING (true);
