-- Purge users that were soft-deleted more than 30 minutes ago
create or replace function public.purge_deleted_users()
returns void
language plpgsql
security definer -- Required to delete users from auth.users
as $$
declare
    user_id_to_purge uuid;
begin
    -- Loop through users marked for deletion over 30 minutes ago
    for user_id_to_purge in 
        select id from auth.users where deleted_at is not null and deleted_at < (now() - interval '30 minutes')
    loop
        -- Use the built-in admin function to permanently delete the user
        perform auth.admin_delete_user(user_id_to_purge);
    end loop;
end;
$$;
