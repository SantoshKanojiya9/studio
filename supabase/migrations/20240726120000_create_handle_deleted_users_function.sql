
-- This function finds users who were soft-deleted more than 30 minutes ago
-- and permanently deletes them from the system.
-- It needs to be run by a scheduled cron job.
create or replace function public.handle_deleted_users()
returns void
language plpgsql
security definer
as $$
declare
  user_to_delete record;
begin
  for user_to_delete in
    select id from public.users
    where deleted_at is not null
    and deleted_at < (now() - interval '30 minutes')
  loop
    -- Delete the user from Supabase Auth.
    -- This will cascade and delete the user's profile from `public.users`
    -- if you have set up a `ON DELETE CASCADE` foreign key relationship.
    -- If not, you might need to manually delete from public.users as well.
    perform auth.admin_delete_user(user_to_delete.id);
  end loop;
end;
$$;
