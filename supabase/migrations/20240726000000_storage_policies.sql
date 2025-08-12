-- Create 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policy for viewing avatars
CREATE POLICY "Avatar images are publicly accessible."
ON storage.objects FOR SELECT
USING ( bucket_id = 'avatars' );

-- RLS Policy for inserting/uploading avatars
CREATE POLICY "Anyone can upload an avatar."
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'avatars' );

-- RLS Policy for updating own avatar
CREATE POLICY "Anyone can update their own avatar."
ON storage.objects FOR UPDATE
TO authenticated
USING ( auth.uid() = owner )
WITH CHECK ( bucket_id = 'avatars' );

-- RLS Policy for deleting own avatar
CREATE POLICY "Anyone can delete their own avatar."
ON storage.objects FOR DELETE
TO authenticated
USING ( auth.uid() = owner );
