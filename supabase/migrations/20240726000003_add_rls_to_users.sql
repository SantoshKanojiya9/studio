
-- Enable Row Level Security for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to all user profiles
-- This is generally safe as sensitive info is not on this table.
-- Post visibility is controlled by other policies.
CREATE POLICY "Allow public read access to user profiles"
ON public.users
FOR SELECT
USING (true);

-- Policy: Allow authenticated users to update their own profile
-- This is the key policy that fixes the profile update error.
CREATE POLICY "Allow users to update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
