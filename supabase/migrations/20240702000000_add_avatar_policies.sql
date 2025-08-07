
-- Create 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for 'avatars' bucket

-- 1. Allow authenticated users to view all avatars
DROP POLICY IF EXISTS "Authenticated users can view avatars" ON storage.objects;
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- 2. Allow users to upload their own avatar
-- The policy checks if the user's ID is present in the file path (e.g., 'user-id/avatar.png')
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow users to update their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Allow users to delete their own avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
