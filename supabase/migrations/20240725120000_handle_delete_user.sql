
create or replace function public.handle_delete_user()
returns void
language sql
security definer
as $$
  update auth.users
  set deleted_at = now()
  where id = auth.uid();
$$;
