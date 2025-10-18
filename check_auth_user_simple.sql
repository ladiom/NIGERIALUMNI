-- Simple query to check Supabase Auth user details

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    confirmed_at,
    deleted_at
FROM auth.users 
WHERE email = 'ladiomole@hotmail.com';
