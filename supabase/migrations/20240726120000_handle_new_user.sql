
-- Creates a function that inserts a new row into public.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, picture, email)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'picture', new.email);
  return new;
end;
$$;

-- Creates a trigger that calls the function when a new user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();