
-- This function runs when a new user signs up via Supabase Auth.
-- It creates a corresponding entry in the public `users` table.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name, picture)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'picture'
  );
  return new;
end;
$$;

-- This trigger calls the function after a new user is inserted.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
