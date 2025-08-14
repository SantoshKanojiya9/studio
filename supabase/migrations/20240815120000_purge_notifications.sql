
create or replace function public.purge_old_notifications()
returns void
language sql
security definer
as $$
  delete from public.notifications
  where created_at < now() - interval '24 hours';
$$;
