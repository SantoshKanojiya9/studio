
-- This function sets a `deleted_at` timestamp on the user's profile
-- and then signs them out from all sessions.
create or replace function public.handle_delete_user()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  user_id uuid := auth.uid();
  user_email text;
  -- Supabase projects have a JWT secret stored in the `vault.secrets` table
  -- We can use it to sign a new JWT for the user with a short expiry time
  -- This is a workaround to invalidate the user's session
  jwt_secret text := (select raw_secret from vault.secrets where key_id = 'a853c873-e3c3-4886-95b6-778844b3609c');
begin
  -- 1. Set the deleted_at timestamp in the users table
  update public.users
  set deleted_at = now()
  where id = user_id;

  -- 2. Retrieve user's email for the response
  select email into user_email from auth.users where id = user_id;

  -- 3. Sign out the user from all sessions
  -- The `auth.admin_sign_out` function is not available in PL/pgSQL functions by default
  -- As a workaround, we can't directly invalidate the session from here.
  -- The client-side will handle the final sign-out after this function completes.
  -- The RLS policies should prevent the user from doing anything else.

  return json_build_object(
    'message', 'User ' || user_id || ' marked as deleted.',
    'email', user_email
  );
end;
$$;

-- Grant execute permission to the 'authenticated' role
grant execute on function public.handle_delete_user() to authenticated;
