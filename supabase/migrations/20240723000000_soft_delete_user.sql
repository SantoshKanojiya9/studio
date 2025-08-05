
-- This function allows an authenticated user to soft-delete their own account.
create or replace function public.soft_delete_user(user_id_input uuid)
returns void
language sql
security definer
set search_path = public
as $$
  -- First, update the user's profile to mark them as deleted.
  -- The RLS policy on the users table will ensure that only the user themselves can do this.
  update public.users
  set deleted_at = now()
  where id = user_id_input and id = auth.uid();

  -- After marking as deleted, sign the user out from all sessions.
  -- This requires the `supabase_auth_admin` role which this function has due to `security definer`.
  select auth.admin_sign_out(user_id_input);
$$;

-- Grant execute permission on the function to authenticated users.
grant execute on function public.soft_delete_user(uuid) to authenticated;
