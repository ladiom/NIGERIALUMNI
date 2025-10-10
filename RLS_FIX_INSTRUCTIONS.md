# Fix RLS Policies for Pending Registrations

The registration form is failing because the RLS policies for `pending_registrations` table are not allowing anonymous users to insert records.

## Quick Fix via Supabase Dashboard:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Policies
3. Find the `pending_registrations` table
4. Delete all existing policies for this table
5. Create these new policies:

### Policy 1: Allow Anonymous Inserts
- **Policy Name**: `Allow anonymous pending registration creation`
- **Operation**: `INSERT`
- **Target Roles**: `anon`
- **USING Expression**: `true`
- **WITH CHECK Expression**: `true`

### Policy 2: Allow Authenticated Inserts
- **Policy Name**: `Allow authenticated pending registration creation`
- **Operation**: `INSERT`
- **Target Roles**: `authenticated`
- **USING Expression**: `true`
- **WITH CHECK Expression**: `true`

### Policy 3: Allow Public Reads
- **Policy Name**: `Public can read pending registrations`
- **Operation**: `SELECT`
- **Target Roles**: `anon, authenticated`
- **USING Expression**: `true`

### Policy 4: Allow Admin Management
- **Policy Name**: `Admins can manage all pending registrations`
- **Operation**: `ALL`
- **Target Roles**: `authenticated`
- **USING Expression**: `auth.role() = 'admin'`
- **WITH CHECK Expression**: `auth.role() = 'admin'`

## Alternative: SQL Commands

If you prefer to run SQL commands directly in the Supabase SQL Editor:

```sql
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create pending registrations" ON pending_registrations;
DROP POLICY IF EXISTS "Admins manage pending registrations" ON pending_registrations;
DROP POLICY IF EXISTS "Users can view own pending registrations" ON pending_registrations;
DROP POLICY IF EXISTS "Users can update own pending registrations" ON pending_registrations;

-- Create new policies
CREATE POLICY "Allow anonymous pending registration creation" 
ON pending_registrations FOR INSERT 
TO anon 
WITH CHECK (true);

CREATE POLICY "Allow authenticated pending registration creation" 
ON pending_registrations FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Public can read pending registrations" 
ON pending_registrations FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage all pending registrations" 
ON pending_registrations FOR ALL 
USING (auth.role() = 'admin') 
WITH CHECK (auth.role() = 'admin');
```

## Test the Fix

After applying the policies, test by:
1. Going to your registration form
2. Filling out the form
3. Submitting it
4. The form should now submit successfully without the RLS error

The error should change from "new row violates row-level security policy" to a successful submission.
