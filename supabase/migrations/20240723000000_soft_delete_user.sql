
-- soft_delete_user.sql
create or replace function public.soft_delete_user(user_id uuid)
returns void as $$
begin
  update public.users
  set deleted_at = now()
  where id = user_id;
end;
$$ language plpgsql security definer;
