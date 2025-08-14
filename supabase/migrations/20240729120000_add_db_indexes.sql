
-- Enable the pg_trgm extension for trigram text matching (speeds up "like" queries)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Performance Indexes

-- Index for fetching emojis by user
CREATE INDEX IF NOT EXISTS emojis_user_id_idx ON public.emojis (user_id);

-- Index for sorting emojis by creation date
CREATE INDEX IF NOT EXISTS emojis_created_at_desc_idx ON public.emojis (created_at DESC);

-- Index for user privacy status for explore page
CREATE INDEX IF NOT EXISTS users_is_private_idx ON public.users (is_private);

-- Index for searching users by name (using the newly enabled extension)
CREATE INDEX IF NOT EXISTS users_name_idx ON public.users USING gin (name gin_trgm_ops);

-- Indexes for the 'supports' table (most critical for social features)
CREATE INDEX IF NOT EXISTS supports_supporter_id_idx ON public.supports (supporter_id);
CREATE INDEX IF NOT EXISTS supports_supported_id_idx ON public.supports (supported_id);
CREATE INDEX IF NOT EXISTS supports_status_idx ON public.supports (status);
CREATE UNIQUE INDEX IF NOT EXISTS supports_supporter_supported_unique_idx ON public.supports(supporter_id, supported_id);


-- Indexes for the 'likes' table
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON public.likes (user_id);
CREATE INDEX IF NOT EXISTS likes_emoji_id_idx ON public.likes (emoji_id);
CREATE UNIQUE INDEX IF NOT EXISTS likes_user_emoji_unique_idx ON public.likes(user_id, emoji_id);


-- Indexes for the 'moods' table
CREATE INDEX IF NOT EXISTS moods_user_id_idx ON public.moods (user_id);
CREATE INDEX IF NOT EXISTS moods_created_at_idx ON public.moods (created_at);

-- Indexes for the 'mood_views' table
CREATE INDEX IF NOT EXISTS mood_views_mood_id_idx ON public.mood_views (mood_id);
CREATE INDEX IF NOT EXISTS mood_views_viewer_id_idx ON public.mood_views (viewer_id);
CREATE UNIQUE INDEX IF NOT EXISTS mood_views_mood_viewer_unique_idx ON public.mood_views(mood_id, viewer_id);


-- Indexes for the 'notifications' table
CREATE INDEX IF NOT EXISTS notifications_recipient_id_idx ON public.notifications (recipient_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_type_idx ON public.notifications (type);
