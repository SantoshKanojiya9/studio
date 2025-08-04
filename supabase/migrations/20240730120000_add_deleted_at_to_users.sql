
-- Add a "deleted_at" column to the users table for soft deletes
alter table public.users add column if not exists deleted_at timestamptz;

-- Create a function to handle the soft delete
create or replace function public.handle_soft_delete_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Update the public.users table
  update public.users
  set deleted_at = now()
  where id = old.id;

  -- Revoke the user's session
  perform net.http_post(
    url := 'https://' || split_part(old.instance_id::text, '-', 1) || '.supabase.co/auth/v1/admin/users/' || old.id || '/logout',
    headers := jsonb_build_object(
        'apikey', current_setting('app.supabase.service_role_key'),
        'Authorization', 'Bearer ' || current_setting('app.supabase.service_role_key')
    )
  );
  
  return old;
end;
$$;

-- Create a trigger to call the function when a user is deleted from auth.users
drop trigger if exists on_auth_user_deleted on auth.users;
create trigger on_auth_user_deleted
  after delete on auth.users
  for each row execute procedure public.handle_soft_delete_user();
