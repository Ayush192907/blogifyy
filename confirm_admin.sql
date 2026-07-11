-- Run this query in your Supabase SQL Editor to manually confirm the admin email address:
UPDATE auth.users 
SET email_confirmed_at = now(), 
    confirmed_at = now(),
    last_sign_in_at = now()
WHERE email = 'ayushaslaliya37@gmail.com';
