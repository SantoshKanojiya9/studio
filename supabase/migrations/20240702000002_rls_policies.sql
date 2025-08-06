
-- Make sure Row Level Security is enabled on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Allow users to read their own profile
DROP POLICY IF EXISTS "Users can view their own profile." ON public.users;
CREATE POLICY "Users can view their own profile."
ON public.users FOR SELECT
USING (auth.uid() = id);

-- 2. Policy: Allow users to update their own profile
DROP POLICY IF EXISTS "Users can update their own profile." ON public.users;
CREATE POLICY "Users can update their own profile."
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- 3. Also, ensure the emojis table has the correct policies.
ALTER TABLE public.emojis ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to see all emojis (for the explore page)
DROP POLICY IF EXISTS "Users can view all emojis." ON public.emojis;
CREATE POLICY "Users can view all emojis."
ON public.emojis FOR SELECT
USING (true);

-- Policy: Allow users to insert their own emojis
DROP POLICY IF EXISTS "Users can insert their own emojis." ON public.emojis;
CREATE POLICY "Users can insert their own emojis."
ON public.emojis FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own emojis
DROP POLICY IF EXISTS "Users can update their own emojis." ON public.emojis;
CREATE POLICY "Users can update their own emojis."
ON public.emojis FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Allow users to delete their own emojis
DROP POLICY IF EXISTS "Users can delete their own emojis." ON public.emojis;
CREATE POLICY "Users can delete their own emojis."
ON public.emojis FOR DELETE
USING (auth.uid() = user_id);

-- 4. Policies for subscriptions table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view any subscription (to check status)
DROP POLICY IF EXISTS "Users can view all subscriptions." ON public.subscriptions;
CREATE POLICY "Users can view all subscriptions."
ON public.subscriptions FOR SELECT
USING (true);

-- Policy: Allow users to manage their own subscriptions
DROP POLICY IF EXISTS "Users can manage their own subscriptions." ON public.subscriptions;
CREATE POLICY "Users can manage their own subscriptions."
ON public.subscriptions FOR ALL
USING (auth.uid() = subscriber_id);
