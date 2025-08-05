
-- This function is designed to be called by an authenticated user
-- to request the soft deletion of their own account.
-- It checks if the caller is the user being deleted.
create or replace function public.soft_delete_user(user_id_to_delete uuid)
returns void
language plpgsql
security definer -- This is crucial for allowing the function to update the users table
as $$
begin
  -- Check if the user making the request is the same as the user to be deleted
  if auth.uid() = user_id_to_delete then
    -- Perform the soft delete by setting the deleted_at timestamp
    update public.users
    set deleted_at = now()
    where id = user_id_to_delete;
  else
    -- If the user is not authorized, raise an exception
    raise exception 'You are not authorized to delete this account.';
  end if;
end;
$$;
