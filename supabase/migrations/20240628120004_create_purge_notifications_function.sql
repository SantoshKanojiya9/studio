
-- This function deletes notifications that are older than 24 hours.
create or replace function public.purge_old_notifications()
returns void
language sql
as $$
  delete from public.notifications
  where created_at < now() - interval '24 hours';
$$;
