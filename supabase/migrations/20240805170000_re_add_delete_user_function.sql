-- This function will be called by the cron job.
create or replace function public.handle_deleted_users()
returns void
language plpgsql
security definer
as $$
begin
  -- Deletes users from auth.users who were soft-deleted over 30 minutes ago.
  -- This will cascade delete their corresponding entry in public.users.
  delete from auth.users
  where id in (
    select id from public.users
    where deleted_at is not null
    and deleted_at <= now() - interval '30 minutes'
  );
end;
$$;
