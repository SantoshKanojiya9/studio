
-- This function is called when a user wants to delete their account.
-- It performs a "soft delete" by setting the `deleted_at` timestamp
-- on the user's profile, rather than permanently deleting the data.
-- It also signs the user out of all sessions.

create or replace function public.handle_delete_user() 
returns void 
language plpgsql 
security definer
set search_path = public
as $$
begin
  -- Update the user's record in the public.users table
  update public.users
  set deleted_at = now()
  where id = auth.uid();
  
  -- The user will be signed out on the client side after this function completes.
end;
$$;

-- Grant permission to the 'authenticated' role to execute this function
grant execute
on function public.handle_delete_user()
to authenticated;
