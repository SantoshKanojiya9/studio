
-- This policy allows any authenticated user to upload to the 'avatars' bucket.
-- It ensures that they can only upload to a path that is prefixed with their own user ID.
-- This is a common and secure pattern for user-specific file uploads.

-- First, ensure any previous, potentially incorrect policies are removed to avoid conflicts.
DROP POLICY IF EXISTS "Allow authenticated users to upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own avatar" ON storage.objects;

-- Allow read access to all authenticated users for all files in the 'avatars' bucket.
CREATE POLICY "Allow authenticated read access on avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- Allow insert access for authenticated users on their own folder.
CREATE POLICY "Allow authenticated insert on own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow update access for authenticated users on their own folder.
CREATE POLICY "Allow authenticated update on own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow delete access for authenticated users on their own folder.
CREATE POLICY "Allow authenticated delete on own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
