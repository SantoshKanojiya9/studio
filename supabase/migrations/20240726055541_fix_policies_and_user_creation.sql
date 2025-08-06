
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
    CONSTRAINT emojis_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
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
WITH CHECK (auth.role() = 'authenticated');

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

-- Step 4: Create a function to copy new users to the public.users table
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, name, picture, email)
  values (new.id, new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'picture', new.email);
  return new;
end;
$$;

-- Step 5: Create a trigger to call the function when a new user signs up
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();