-- Fix RLS policies for pending_registrations to use the custom admin system
-- This addresses the issue where admin users can't update pending registrations

-- Drop the existing policies that use auth.role() = 'admin'
DROP POLICY IF EXISTS "Admins manage pending registrations" ON pending_registrations;

-- Create new policies that use the is_admin() function
CREATE POLICY "Admins manage pending registrations" 
ON pending_registrations FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Also update the other admin policies to use is_admin() function
DROP POLICY IF EXISTS "Admins can access everything" ON schools;
CREATE POLICY "Admins can access everything" 
ON schools FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can access everything" ON alumni;
CREATE POLICY "Admins can access everything" 
ON alumni FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can access everything" ON alumni_connections;
CREATE POLICY "Admins can access everything" 
ON alumni_connections FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can access everything" ON events;
CREATE POLICY "Admins can access everything" 
ON events FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can access everything" ON event_registrations;
CREATE POLICY "Admins can access everything" 
ON event_registrations FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can access everything" ON news;
CREATE POLICY "Admins can access everything" 
ON news FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());
