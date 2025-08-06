-- Step 1: Remove the problematic default value from the user_id column
ALTER TABLE public.emojis
ALTER COLUMN user_id DROP DEFAULT;

-- Step 2: Drop the old, incorrect policies to ensure a clean slate
DROP POLICY IF EXISTS "Users can insert their own emojis." ON "public"."emojis";
DROP POLICY IF EXISTS "Enable read access for everyone" ON "public"."emojis";
DROP POLICY IF EXISTS "Users can update their own emojis." ON "public"."emojis";
DROP POLICY IF EXISTS "Users can delete their own emojis." ON "public"."emojis";

-- Step 3: Recreate the correct policies
-- Allow any authenticated user to VIEW all emojis.
CREATE POLICY "Enable read access for everyone"
ON "public"."emojis"
FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow a user to INSERT an emoji only if the user_id matches their own.
CREATE POLICY "Users can insert their own emojis."
ON "public"."emojis"
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Allow a user to UPDATE only their own emojis.
CREATE POLICY "Users can update their own emojis."
ON "public"."emojis"
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow a user to DELETE only their own emojis.
CREATE POLICY "Users can delete their own emojis."
ON "public"."emojis"
FOR DELETE
USING (auth.uid() = user_id);
