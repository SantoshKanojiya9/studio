
-- Enable RLS for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to update their own profile
CREATE POLICY "Allow individual user update access"
ON public.users FOR UPDATE
USING (auth.uid() = id);

-- Allow users to select their own profile
CREATE POLICY "Allow individual user select access"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Allow public read access to user profiles
CREATE POLICY "Allow public read access on users"
ON public.users FOR SELECT
TO anon, authenticated
USING (true);
