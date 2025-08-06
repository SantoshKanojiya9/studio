-- Sets the deleted_at timestamp on the user's auth record.
-- This is a "soft delete" that will be purged by a cron job.
create or replace function public.handle_delete_user()
returns void
language sql
security definer
as $$
  update auth.users
  set deleted_at = now()
  where id = auth.uid();
$$;
