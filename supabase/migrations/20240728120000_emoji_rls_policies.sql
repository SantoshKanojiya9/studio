
-- Enable Row Level Security for the emojis table
ALTER TABLE public.emojis ENABLE ROW LEVEL SECURITY;

-- 1. Allow public read access to all emojis.
-- This policy allows anyone (including non-logged-in users) to view emojis, which is needed for public galleries and the explore page.
CREATE POLICY "Allow public read access to all emojis"
ON public.emojis
FOR SELECT
USING (true);

-- 2. Allow authenticated users to insert their own emojis.
-- This policy ensures that when a user creates an emoji, the `user_id` column matches their own authenticated user ID.
CREATE POLICY "Allow authenticated users to insert their own emojis"
ON public.emojis
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. Allow authenticated users to update their own emojis.
-- This policy ensures a user can only update emojis where the `user_id` matches their own.
CREATE POLICY "Allow authenticated users to update their own emojis"
ON public.emojis
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Allow authenticated users to delete their own emojis.
-- This policy ensures a user can only delete emojis they own.
CREATE POLICY "Allow authenticated users to delete their own emojis"
ON public.emojis
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
