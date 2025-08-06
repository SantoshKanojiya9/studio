-- Drop all existing policies on the emojis table to ensure a clean slate
DROP POLICY IF EXISTS "Enable read access for everyone" ON "public"."emojis";
DROP POLICY IF EXISTS "Enable read access for own emojis" ON "public"."emojis";
DROP POLICY IF EXISTS "Users can insert their own emojis." ON "public"."emojis";
DROP POLICY IF EXISTS "Users can update their own emojis." ON "public"."emojis";
DROP POLICY IF EXISTS "Users can delete their own emojis." ON "public"."emojis";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."emojis";


-- 1. Allow any authenticated user to VIEW all emojis.
--    This is necessary for the Explore page and for sharing.
CREATE POLICY "Enable read access for everyone"
ON "public"."emojis"
FOR SELECT
USING (auth.role() = 'authenticated');


-- 2. Allow a user to INSERT an emoji only for themselves.
CREATE POLICY "Users can insert their own emojis."
ON "public"."emojis"
FOR INSERT
WITH CHECK (auth.uid() = user_id);


-- 3. Allow a user to UPDATE only their own emojis.
CREATE POLICY "Users can update their own emojis."
ON "public"."emojis"
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- 4. Allow a user to DELETE only their own emojis.
CREATE POLICY "Users can delete their own emojis."
ON "public"."emojis"
FOR DELETE
USING (auth.uid() = user_id);
