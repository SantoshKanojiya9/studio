
-- This function permanently deletes users who were soft-deleted more than 30 minutes ago.
-- It's designed to be run periodically by a cron job.
create or replace function public.purge_deleted_users()
returns void
language plpgsql
security definer
as $$
declare
    user_id_to_delete uuid;
begin
    -- Loop through users marked for deletion over 30 minutes ago
    for user_id_to_delete in
        select id from auth.users where deleted_at is not null and deleted_at < (now() - interval '30 minutes')
    loop
        -- Use the built-in admin function to permanently delete the user.
        -- This will also cascade and delete associated data and storage objects.
        perform auth.admin_delete_user(user_id_to_delete);
    end loop;
end;
$$;
