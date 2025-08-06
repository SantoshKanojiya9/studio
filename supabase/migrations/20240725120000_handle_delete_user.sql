
-- Enable the pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the function to handle soft-deleting a user
CREATE OR REPLACE FUNCTION public.handle_delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
BEGIN
  -- Check if the user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to delete their account.';
  END IF;

  -- Update the user's record to mark it as deleted
  UPDATE public.users
  SET deleted_at = now()
  WHERE id = auth.uid();
END;
$$;

-- Grant execute permission to the 'authenticated' role
GRANT EXECUTE ON FUNCTION public.handle_delete_user() TO authenticated;
