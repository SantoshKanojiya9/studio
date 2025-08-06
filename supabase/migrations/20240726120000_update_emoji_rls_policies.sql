
-- Drop the old, more restrictive select policy
drop policy if exists "Allow users to view their own emojis" on public.emojis;

-- Create a new, more permissive select policy
create policy "Allow authenticated users to view all emojis"
on public.emojis for select
to authenticated
using (true);

-- Ensure the insert policy is correct (users can only insert for themselves)
drop policy if exists "Allow logged-in users to create their own emojis" on public.emojis;
create policy "Allow logged-in users to create their own emojis"
on public.emojis for insert
to authenticated
with check (auth.uid() = user_id);

-- Ensure the update policy is correct (users can only update their own)
drop policy if exists "Allow users to update their own emojis" on public.emojis;
create policy "Allow users to update their own emojis"
on public.emojis for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Ensure the delete policy is correct (users can only delete their own)
drop policy if exists "Allow users to delete their own emojis" on public.emojis;
create policy "Allow users to delete their own emojis"
on public.emojis for delete
to authenticated
using (auth.uid() = user_id);
