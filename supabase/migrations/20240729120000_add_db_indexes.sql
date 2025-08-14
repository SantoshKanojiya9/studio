
-- Step 1: Add indexes to the 'users' table
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users USING btree (name);
CREATE INDEX IF NOT EXISTS idx_users_is_private ON public.users USING btree (is_private);

-- Step 2: Add indexes to the 'emojis' table
CREATE INDEX IF NOT EXISTS idx_emojis_user_id ON public.emojis USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_emojis_created_at ON public.emojis USING btree (created_at DESC);

-- Step 3: Add indexes to the 'likes' table
-- This index is good for finding likes for a specific post
CREATE INDEX IF NOT EXISTS idx_likes_emoji_id ON public.likes USING btree (emoji_id);
-- This composite index is perfect for checking if a user has liked a post
CREATE INDEX IF NOT EXISTS idx_likes_user_id_emoji_id ON public.likes USING btree (user_id, emoji_id);

-- Step 4: Add indexes to the 'supports' table (following/followers)
CREATE INDEX IF NOT EXISTS idx_supports_supporter_id ON public.supports USING btree (supporter_id);
CREATE INDEX IF NOT EXISTS idx_supports_supported_id ON public.supports USING btree (supported_id);
-- Composite index for quickly finding a specific relationship
CREATE INDEX IF NOT EXISTS idx_supports_supporter_supported ON public.supports USING btree (supporter_id, supported_id);

-- Step 5: Add indexes to the 'moods' table
CREATE INDEX IF NOT EXISTS idx_moods_user_id ON public.moods USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_moods_created_at ON public.moods USING btree (created_at DESC);

-- Step 6: Add indexes to the 'mood_views' table
CREATE INDEX IF NOT EXISTS idx_mood_views_mood_id ON public.mood_views USING btree (mood_id);
CREATE INDEX IF NOT EXISTS idx_mood_views_viewer_id ON public.mood_views USING btree (viewer_id);
CREATE INDEX IF NOT EXISTS idx_mood_views_mood_id_viewer_id ON public.mood_views USING btree (mood_id, viewer_id);

-- Step 7: Add indexes to the 'notifications' table
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications USING btree (recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications USING btree (created_at DESC);
