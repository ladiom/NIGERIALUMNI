-- Nigeria Alumni Platform Row Level Security Policies

-- First, enable RLS for all tables
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni ENABLE ROW LEVEL SECURITY;
ALTER TABLE alumni_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Schools Table Policies
-- Allow public read access to schools
CREATE POLICY "Public schools are viewable by everyone" 
ON schools FOR SELECT 
USING (true);

-- Allow authenticated users to create schools
CREATE POLICY "Authenticated users can create schools" 
ON schools FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow school administrators to update schools
-- Note: This assumes you have an 'admin' role in your auth system
CREATE POLICY "School administrators can update schools" 
ON schools FOR UPDATE 
USING (auth.role() = 'admin');

-- Alumni Table Policies
-- Allow public to search alumni (limited view)
CREATE POLICY "Public can search alumni with limited data" 
ON alumni FOR SELECT 
USING (true) 
WITH CHECK (true);

-- Allow authenticated users to view full alumni profiles
CREATE POLICY "Authenticated users can view full alumni profiles" 
ON alumni FOR SELECT 
TO authenticated 
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON alumni FOR UPDATE 
USING (id = auth.uid()) 
WITH CHECK (id = auth.uid());

-- Allow authenticated users to create alumni records
CREATE POLICY "Authenticated users can create alumni records" 
ON alumni FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Alumni Connections Table Policies
-- Allow users to manage their own connections
CREATE POLICY "Users can manage their own connections" 
ON alumni_connections FOR ALL 
USING (alumni_id = auth.uid() OR connected_alumni_id = auth.uid()) 
WITH CHECK (alumni_id = auth.uid());

-- Events Table Policies
-- Allow public read access to events
CREATE POLICY "Public events are viewable by everyone" 
ON events FOR SELECT 
USING (true);

-- Allow authenticated users to create events
CREATE POLICY "Authenticated users can create events" 
ON events FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow event creators to update/delete their events
-- Note: This assumes you add a 'creator_id' column to the events table
-- CREATE POLICY "Event creators can modify their events" 
-- ON events FOR UPDATE 
-- USING (creator_id = auth.uid()) 
-- WITH CHECK (creator_id = auth.uid());

-- Event Registrations Table Policies
-- Allow users to register for events
CREATE POLICY "Users can register for events" 
ON event_registrations FOR INSERT 
TO authenticated 
WITH CHECK (alumni_id = auth.uid());

-- Allow users to view their own registrations
CREATE POLICY "Users can view their own registrations" 
ON event_registrations FOR SELECT 
USING (alumni_id = auth.uid());

-- News Table Policies
-- Allow public read access to news
CREATE POLICY "Public news are viewable by everyone" 
ON news FOR SELECT 
USING (true);

-- Allow authenticated users to create news
CREATE POLICY "Authenticated users can create news" 
ON news FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow news creators to update/delete their news
-- Note: This assumes you add a 'creator_id' column to the news table
-- CREATE POLICY "News creators can modify their news" 
-- ON news FOR UPDATE 
-- USING (creator_id = auth.uid()) 
-- WITH CHECK (creator_id = auth.uid());

-- Optional: Create an admin role policy
-- This policy grants full access to all tables for users with the 'admin' role
CREATE POLICY "Admins can access everything" 
ON schools FOR ALL 
USING (auth.role() = 'admin') 
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins can access everything" 
ON alumni FOR ALL 
USING (auth.role() = 'admin') 
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins can access everything" 
ON alumni_connections FOR ALL 
USING (auth.role() = 'admin') 
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins can access everything" 
ON events FOR ALL 
USING (auth.role() = 'admin') 
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins can access everything" 
ON event_registrations FOR ALL 
USING (auth.role() = 'admin') 
WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Admins can access everything" 
ON news FOR ALL 
USING (auth.role() = 'admin') 
WITH CHECK (auth.role() = 'admin');

-- Pending Registrations Policies
-- Allow anonymous and authenticated users to create pending registrations
CREATE POLICY "Anyone can create pending registrations" 
ON pending_registrations FOR INSERT 
TO anon, authenticated 
WITH CHECK (true);

-- Allow admins to select/delete/update all pending registrations
CREATE POLICY "Admins manage pending registrations" 
ON pending_registrations FOR ALL 
USING (auth.role() = 'admin') 
WITH CHECK (auth.role() = 'admin');

-- Allow authenticated users to select and update their own pending registrations (by email)
CREATE POLICY "Users can view own pending registrations" 
ON pending_registrations FOR SELECT 
TO authenticated 
USING (email = auth.email());

CREATE POLICY "Users can update own pending registrations" 
ON pending_registrations FOR UPDATE 
TO authenticated 
USING (email = auth.email())
WITH CHECK (email = auth.email());

-- Allow invited users to update their alumni record based on a matching pending registration
CREATE POLICY "Invited users can update alumni via pending" 
ON alumni FOR UPDATE 
TO authenticated 
USING (id IN (SELECT alumni_id FROM pending_registrations WHERE email = auth.email())) 
WITH CHECK (id IN (SELECT alumni_id FROM pending_registrations WHERE email = auth.email()));

-- Users table policies and helpers
-- Helper function to check admin role via users table
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN
LANGUAGE sql STABLE AS $$
  SELECT EXISTS(
    SELECT 1 FROM users
    WHERE id = auth.uid() AND 'admin' = ANY(roles)
  );
$$;

-- Allow authenticated users to create their profile row
CREATE POLICY "Users can insert own users row"
ON users FOR INSERT TO authenticated
WITH CHECK (id = auth.uid() AND email = auth.email());

-- Allow users to view and update their own row
CREATE POLICY "Users can select own users row"
ON users FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own users row"
ON users FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Admins can access all users rows
CREATE POLICY "Admins manage users"
ON users FOR ALL
USING (is_admin())
WITH CHECK (is_admin());
-- Secure helper: check if any admin exists (bypasses RLS safely)
CREATE OR REPLACE FUNCTION public.has_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  res boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE 'admin' = ANY(roles)
  ) INTO res;
  RETURN res;
END;
$$;

GRANT EXECUTE ON FUNCTION public.has_admin() TO anon, authenticated;

-- Rework users table policies to prevent self-promotion, allow first-admin setup
DROP POLICY IF EXISTS "Users insert own row" ON public.users;
CREATE POLICY "Users insert own row"
ON public.users FOR INSERT TO authenticated
WITH CHECK (
  id = auth.uid()
  AND email = auth.email()
  AND (
    NOT ('admin' = ANY(roles))
    OR NOT public.has_admin()
  )
);

DROP POLICY IF EXISTS "Users update own row" ON public.users;
CREATE POLICY "Users update own row"
ON public.users FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND (
    NOT ('admin' = ANY(roles))
    OR public.is_admin()
  )
);

DROP POLICY IF EXISTS "Admins manage users" ON public.users;
CREATE POLICY "Admins manage users"
ON public.users FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());