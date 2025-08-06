-- This function is called by a cron job every 5 minutes.
-- It permanently deletes users who were soft-deleted more than 30 minutes ago.

CREATE OR REPLACE FUNCTION public.purge_deleted_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete the user profiles from public.users first
    DELETE FROM public.users p
    USING auth.users a
    WHERE a.id = p.id
      AND a.deleted_at IS NOT NULL
      AND a.deleted_at <= (now() - interval '30 minutes');

    -- Then, delete the user from auth.users.
    -- This will cascade delete their emojis due to the foreign key constraint.
    DELETE FROM auth.users
    WHERE deleted_at IS NOT NULL
      AND deleted_at <= (now() - interval '30 minutes');
END;
$$;
