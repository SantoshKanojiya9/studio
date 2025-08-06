
-- Add the deleted_at column to track scheduled deletions.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Create a function to schedule a user for deletion.
-- This sets the deleted_at timestamp.
CREATE OR REPLACE FUNCTION public.handle_delete_user()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET deleted_at = now()
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to cancel a scheduled deletion.
-- This is called when a user signs back in during the grace period.
CREATE OR REPLACE FUNCTION public.handle_recover_user()
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET deleted_at = NULL
  WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Create the function to permanently purge users after the grace period.
-- The existing cron job in your config.toml will call this.
CREATE OR REPLACE FUNCTION public.purge_deleted_users()
RETURNS void AS $$
DECLARE
    user_record RECORD;
BEGIN
    FOR user_record IN
        SELECT id FROM public.users WHERE deleted_at IS NOT NULL AND deleted_at < (now() - interval '30 minutes')
    LOOP
        -- This will cascade and delete all related data (emojis, subscriptions, etc.)
        DELETE FROM auth.users WHERE id = user_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the new user trigger is correct.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, picture)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'picture'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
