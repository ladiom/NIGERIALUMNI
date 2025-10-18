-- Get detailed info about the Supabase Auth user (FIXED VERSION)

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at,
    phone_confirmed,
    confirmed_at,
    recovery_sent_at,
    email_change_sent_at,
    new_email,
    invited_at,
    action_link,
    email_change,
    new_phone,
    phone_change,
    phone_change_sent_at,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at,
    is_anonymous
FROM auth.users 
WHERE email = 'ladiomole@hotmail.com';
