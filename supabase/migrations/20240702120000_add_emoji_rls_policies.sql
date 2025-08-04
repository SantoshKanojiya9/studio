
-- Enable Row Level Security for the emojis table
alter table "public"."emojis" enable row level security;

-- Allow users to insert emojis for themselves
create policy "Allow insert for authenticated users"
on "public"."emojis"
as permissive
for insert
to authenticated
with check (auth.uid() = user_id);

-- Allow anyone to select (view) all emojis
create policy "Allow read access to everyone"
on "public"."emojis"
as permissive
for select
to public
using (true);

-- Allow users to update their own emojis
create policy "Allow update for own emojis"
on "public"."emojis"
as permissive
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Allow users to delete their own emojis
create policy "Allow delete for own emojis"
on "public"."emojis"
as permissive
for delete
to authenticated
using (auth.uid() = user_id);
