
create or replace function public.purge_old_notifications()
returns void
language sql
as $$
  delete from public.notifications
  where created_at < now() - interval '24 hours';
$$;

-- Also, schedule the function to run every hour
select
  cron.schedule(
    'purge-old-notifications-hourly',
    '0 * * * *', -- every hour
    $$
      select public.purge_old_notifications();
    $$
  );
