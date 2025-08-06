
create or replace function handle_delete_user()
returns void
language sql
security invoker
as $$
  update public.users
  set deleted_at = now()
  where id = auth.uid();
$$;
