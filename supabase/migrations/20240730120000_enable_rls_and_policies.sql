
-- Enable Row Level Security (RLS) for the tables
alter table "public"."emojis" enable row level security;
alter table "public"."subscriptions" enable row level security;
alter table "public"."notifications" enable row level security;

-- Create policies for the 'emojis' table
create policy "Allow public read access to all emojis" on "public"."emojis"
as permissive for select
to public
using (true);

create policy "Allow users to insert their own emojis" on "public"."emojis"
as permissive for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Allow users to update their own emojis" on "public"."emojis"
as permissive for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Allow users to delete their own emojis" on "public"."emojis"
as permissive for delete
to authenticated
using (auth.uid() = user_id);


-- Create policies for the 'subscriptions' table
create policy "Allow public read access to subscriptions" on "public"."subscriptions"
as permissive for select
to public
using (true);

create policy "Allow users to insert their own subscriptions" on "public"."subscriptions"
as permissive for insert
to authenticated
with check (auth.uid() = subscriber_id);

create policy "Allow users to delete their own subscriptions" on "public"."subscriptions"
as permissive for delete
to authenticated
using (auth.uid() = subscriber_id);


-- Create policies for the 'notifications' table
create policy "Allow users to read their own notifications" on "public"."notifications"
as permissive for select
to authenticated
using (auth.uid() = recipient_id);

create policy "Allow authenticated users to create notifications" on "public"."notifications"
as permissive for insert
to authenticated
with check (auth.uid() = sender_id);
