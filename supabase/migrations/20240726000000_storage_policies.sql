
-- Enable RLS for storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, to ensure a clean slate.
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatar" ON storage.objects;


-- Policy: Allow authenticated users to UPLOAD to the 'avatars' bucket.
-- The user's ID must be part of the file path.
CREATE POLICY "Allow authenticated users to upload avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: Allow users to VIEW their own avatar.
-- The file's `owner` must match the user's ID.
CREATE POLICY "Allow users to view their own avatar"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

-- Policy: Allow users to UPDATE their own avatar.
-- The file's `owner` must match the user's ID.
CREATE POLICY "Allow users to update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);

-- Policy: Allow users to DELETE their own avatar.
-- The file's `owner` must match the user's ID.
CREATE POLICY "Allow users to delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid() = owner
);
