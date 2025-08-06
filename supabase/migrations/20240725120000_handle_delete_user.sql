
--  Handle deleting user
create
or replace function public.handle_delete_user () returns void as $$
begin
  -- Update the public.users table
  update public.users
  set deleted_at = now()
  where id = auth.uid();
end;
$$ language plpgsql security definer;

-- Grant access to the function
grant execute on function public.handle_delete_user() to authenticated;
