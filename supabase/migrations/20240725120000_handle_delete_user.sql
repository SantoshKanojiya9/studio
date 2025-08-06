-- Sets the deleted_at timestamp on the user's auth record.
create or replace function public.handle_delete_user()
returns void
language sql
security invoker
as $$
  update auth.users
  set raw_user_meta_data = raw_user_meta_data || jsonb_build_object('deleted_at', now())
  where id = auth.uid();
$$;
