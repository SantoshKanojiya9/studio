
-- Enable RLS on the storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for the 'avatars' bucket if they exist, to ensure a clean slate
DROP POLICY IF EXISTS "allow_select_avatars" ON storage.objects;
DROP POLICY IF EXISTS "allow_insert_avatars" ON storage.objects;
DROP POLICY IF EXISTS "allow_update_avatars" ON storage.objects;
DROP POLICY IF EXISTS "allow_delete_avatars" ON storage.objects;

-- Policy: Allow logged-in users to view all avatars
CREATE POLICY "allow_select_avatars" ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'avatars');

-- Policy: Allow a user to upload their own avatar
-- The user's ID must match the first part of the file path (e.g., "user-id-12345.png")
CREATE POLICY "allow_insert_avatars" ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Policy: Allow a user to update their own avatar
CREATE POLICY "allow_update_avatars" ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
)
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Policy: Allow a user to delete their own avatar
CREATE POLICY "allow_delete_avatars" ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid() = (storage.foldername(name))[1]::uuid
);
