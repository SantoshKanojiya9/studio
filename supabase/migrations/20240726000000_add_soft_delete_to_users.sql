
-- Add a "deleted_at" column to the "users" table to enable soft deletes.
-- This allows us to mark users as deleted without permanently removing their data.
alter table public.users
add column deleted_at timestamp with time zone;

-- Grant permissions for authenticated users to update their own 'deleted_at' field.
grant update (deleted_at) on table public.users to authenticated;

-- Ensure that the 'select' policy also includes the new column for the user to see.
-- Note: Assuming a policy named "Enable select for users based on user_id" exists.
-- If your policy has a different name, you might need to adjust this.
-- This re-granting helps refresh the policy with the new column.
grant select on table public.users to authenticated;
