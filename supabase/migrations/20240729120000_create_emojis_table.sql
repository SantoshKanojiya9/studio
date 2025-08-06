-- Step 1: Create the emojis table with all necessary columns
CREATE TABLE public.emojis (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    user_id uuid NOT NULL DEFAULT auth.uid(),
    model text NOT NULL,
    expression text NOT NULL,
    background_color text NOT NULL,
    emoji_color text NOT NULL,
    show_sunglasses boolean NOT NULL,
    show_mustache boolean NOT NULL,
    selected_filter text,
    animation_type text NOT NULL,
    shape text NOT NULL,
    eye_style text NOT NULL,
    mouth_style text NOT NULL,
    eyebrow_style text NOT NULL,
    feature_offset_x double precision NOT NULL,
    feature_offset_y double precision NOT NULL,
    CONSTRAINT emojis_pkey PRIMARY KEY (id),
    CONSTRAINT emojis_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Step 2: Enable Row Level Security on the new table
ALTER TABLE public.emojis ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies to control access
-- 3.1: Allow any authenticated user to VIEW all emojis (for the Explore page)
CREATE POLICY "Enable read access for everyone"
ON "public"."emojis"
FOR SELECT
USING (auth.role() = 'authenticated');

-- 3.2: Allow users to INSERT emojis only for themselves
CREATE POLICY "Users can insert their own emojis."
ON "public"."emojis"
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3.3: Allow users to UPDATE only their own emojis
CREATE POLICY "Users can update their own emojis."
ON "public"."emojis"
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3.4: Allow users to DELETE only their own emojis
CREATE POLICY "Users can delete their own emojis."
ON "public"."emojis"
FOR DELETE
USING (auth.uid() = user_id);