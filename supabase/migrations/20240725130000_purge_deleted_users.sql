-- This function finds users who were marked for deletion more than 30 minutes ago
-- and permanently deletes them from the auth.users table.
-- The deletion will cascade to the public.users table as well.
create or replace function public.purge_deleted_users()
returns void as $$
begin
  delete from auth.users
  where id in (
    select id from public.users
    where deleted_at is not null and deleted_at < (now() - interval '30 minutes')
  );
end;
$$ language plpgsql;
