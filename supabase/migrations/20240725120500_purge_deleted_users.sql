
-- This function finds users who were soft-deleted more than 30 minutes ago
-- and permanently deletes them from the system, including their auth entry
-- and any associated storage objects.
create or replace function public.purge_deleted_users()
returns void
language plpgsql
security definer -- Must be run with elevated privileges to delete auth users
set search_path = public
as $$
declare
    user_record record;
begin
    for user_record in
        select id from auth.users where deleted_at is not null and deleted_at < (now() - interval '30 minutes')
    loop
        -- auth.admin_delete_user is a Supabase function that cascades deletes.
        -- It removes the user from auth.users, and any related data, including storage objects.
        perform auth.admin_delete_user(user_record.id);
    end loop;
end;
$$;
