-- Purges moods older than 24 hours
create or replace function public.purge_old_moods()
returns void
language sql
as $$
  delete from public.moods
  where created_at < now() - interval '24 hours';
$$;
