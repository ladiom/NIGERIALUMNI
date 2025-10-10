-- Check existing RLS policies for pending_registrations table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pending_registrations'
ORDER BY policyname;
