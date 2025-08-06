
-- STEP 1: CREATE THE USERS TABLE
-- This table will store public user profile information.
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    name TEXT,
    picture TEXT,
    deleted_at TIMESTAMPTZ
);
COMMENT ON TABLE public.users IS 'Public user profiles, linked to Supabase Auth users.';

-- STEP 2: CREATE THE EMOJIS TABLE
-- This table stores all the user-created emojis.
CREATE TABLE IF NOT EXISTS public.emojis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    model TEXT NOT NULL,
    expression TEXT NOT NULL,
    background_color TEXT NOT NULL,
    emoji_color TEXT NOT NULL,
    show_sunglasses BOOLEAN NOT NULL,
    show_mustache BOOLEAN NOT NULL,
    selected_filter TEXT,
    animation_type TEXT NOT NULL,
    shape TEXT NOT NULL,
    eye_style TEXT NOT NULL,
    mouth_style TEXT NOT NULL,
    eyebrow_style TEXT NOT NULL,
    feature_offset_x NUMERIC NOT NULL,
    feature_offset_y NUMERIC NOT NULL
);
COMMENT ON TABLE public.emojis IS 'Stores all user-created emoji designs.';

-- STEP 3: CREATE THE SUBSCRIPTIONS TABLE
-- This table manages follower/following relationships.
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    subscriber_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subscribed_to_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT subscriptions_subscriber_subscribed_to_unique UNIQUE (subscriber_id, subscribed_to_id)
);
COMMENT ON TABLE public.subscriptions IS 'Manages user follower and following relationships.';


-- STEP 4: DATABASE FUNCTIONS & TRIGGERS
-- Function to create a public profile when a new auth user signs up.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, picture)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'picture'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the new user function.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to mark a user for deletion.
CREATE OR REPLACE FUNCTION public.handle_delete_user()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET deleted_at = now()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to recover a user during the grace period.
CREATE OR REPLACE FUNCTION public.handle_recover_user()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET deleted_at = NULL
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to be called by cron job to purge deleted users.
CREATE OR REPLACE FUNCTION public.purge_deleted_users()
RETURNS void AS $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN
        SELECT id FROM public.users WHERE deleted_at IS NOT NULL AND deleted_at < (now() - interval '30 minutes')
    LOOP
        DELETE FROM auth.users WHERE id = user_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: ROW LEVEL SECURITY (RLS) POLICIES
-- Enable RLS and set up policies for all tables.

-- Policies for `users` table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to user profiles" ON public.users;
CREATE POLICY "Allow public read access to user profiles" ON public.users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
CREATE POLICY "Allow users to update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Policies for `emojis` table
ALTER TABLE public.emojis ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to all emojis" ON public.emojis;
CREATE POLICY "Allow public read access to all emojis" ON public.emojis FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow users to insert their own emojis" ON public.emojis;
CREATE POLICY "Allow users to insert their own emojis" ON public.emojis FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow users to update their own emojis" ON public.emojis;
CREATE POLICY "Allow users to update their own emojis" ON public.emojis FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Allow users to delete their own emojis" ON public.emojis;
CREATE POLICY "Allow users to delete their own emojis" ON public.emojis FOR DELETE USING (auth.uid() = user_id);

-- Policies for `subscriptions` table
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to all subscriptions" ON public.subscriptions;
CREATE POLICY "Allow public read access to all subscriptions" ON public.subscriptions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow users to manage their own subscriptions" ON public.subscriptions;
CREATE POLICY "Allow users to manage their own subscriptions" ON public.subscriptions FOR ALL USING (auth.uid() = subscriber_id);
