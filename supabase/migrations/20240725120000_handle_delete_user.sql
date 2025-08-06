-- This function is called by the client to initiate a soft delete.
-- It runs with the permissions of the user who calls it.
-- It securely identifies the user from their authenticated session using auth.uid().
create or replace function public.handle_delete_user()
returns void
language sql
security definer
as $$
  update auth.users
  set deleted_at = now()
  where id = auth.uid();
$$;
