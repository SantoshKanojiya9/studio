
-- Marks a user for deletion by setting a `deleted_at` timestamp in their auth.users record.
create or replace function public.handle_delete_user()
returns void
language sql
security definer
as $$
  update auth.users
  set deleted_at = now()
  where id = auth.uid();
$$;
