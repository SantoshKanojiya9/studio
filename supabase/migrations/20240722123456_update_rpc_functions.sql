
-- This migration updates all relevant RPC functions to correctly handle null user IDs,
-- preventing crashes when a non-logged-in user views pages. It also introduces
-- a new helper function to efficiently count likes.

-- Function to get paginated list of likers for a post, including support status for the current user (if logged in)
DROP FUNCTION IF EXISTS get_paginated_likers(uuid, uuid, int, int);
CREATE OR REPLACE FUNCTION get_paginated_likers(p_emoji_id uuid, p_current_user_id text, p_limit int, p_offset int)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, support_status text, has_mood boolean) AS $$
DECLARE
    current_user_id_uuid uuid := NULL;
BEGIN
    IF p_current_user_id IS NOT NULL AND p_current_user_id <> '' THEN
        current_user_id_uuid := p_current_user_id::uuid;
    END IF;

    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        CASE WHEN current_user_id_uuid IS NULL THEN NULL
             ELSE (
                SELECT s.status FROM public.supports s
                WHERE s.supporter_id = current_user_id_uuid AND s.supported_id = u.id
             )
        END::text AS support_status,
        EXISTS(SELECT 1 FROM public.moods m WHERE m.user_id = u.id) AS has_mood
    FROM public.likes l
    JOIN public.users u ON l.user_id = u.id
    WHERE l.emoji_id = p_emoji_id
    ORDER BY l.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get a paginated list of supporters for a user
DROP FUNCTION IF EXISTS get_supporters_with_status(uuid, uuid, int, int);
CREATE OR REPLACE FUNCTION get_supporters_with_status(p_user_id uuid, p_current_user_id text, p_limit int, p_offset int)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, support_status text, has_mood boolean) AS $$
DECLARE
    current_user_id_uuid uuid := NULL;
BEGIN
    IF p_current_user_id IS NOT NULL AND p_current_user_id <> '' THEN
        current_user_id_uuid := p_current_user_id::uuid;
    END IF;

    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        CASE WHEN current_user_id_uuid IS NULL THEN NULL
             ELSE (
                SELECT s.status FROM public.supports s
                WHERE s.supporter_id = current_user_id_uuid AND s.supported_id = u.id
             )
        END::text AS support_status,
        EXISTS(SELECT 1 FROM public.moods m WHERE m.user_id = u.id) AS has_mood
    FROM public.supports sup
    JOIN public.users u ON sup.supporter_id = u.id
    WHERE sup.supported_id = p_user_id AND sup.status = 'approved'
    ORDER BY sup.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get a paginated list of users someone is supporting
DROP FUNCTION IF EXISTS get_supporting_with_status(uuid, uuid, int, int);
CREATE OR REPLACE FUNCTION get_supporting_with_status(p_user_id uuid, p_current_user_id text, p_limit int, p_offset int)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, support_status text, has_mood boolean) AS $$
DECLARE
    current_user_id_uuid uuid := NULL;
BEGIN
    IF p_current_user_id IS NOT NULL AND p_current_user_id <> '' THEN
        current_user_id_uuid := p_current_user_id::uuid;
    END IF;

    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        CASE WHEN current_user_id_uuid IS NULL THEN NULL
            ELSE (
                SELECT s.status FROM public.supports s
                WHERE s.supporter_id = current_user_id_uuid AND s.supported_id = u.id
            )
        END::text AS support_status,
        EXISTS(SELECT 1 FROM public.moods m WHERE m.user_id = u.id) AS has_mood
    FROM public.supports sup
    JOIN public.users u ON sup.supported_id = u.id
    WHERE sup.supporter_id = p_user_id AND sup.status = 'approved'
    ORDER BY sup.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Drop old, incorrect function definitions
DROP FUNCTION IF EXISTS get_gallery_posts(uuid, uuid, int, int);
DROP FUNCTION IF EXISTS get_explore_posts(uuid, int, int);

-- This new helper function efficiently gets like counts for multiple posts at once.
DROP FUNCTION IF EXISTS get_like_counts_for_emojis(uuid[]);
CREATE OR REPLACE FUNCTION get_like_counts_for_emojis(p_emoji_ids uuid[])
RETURNS TABLE(emoji_id uuid, like_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.emoji_id,
    count(l.user_id) as like_count
  FROM public.likes l
  WHERE l.emoji_id = ANY(p_emoji_ids)
  GROUP BY l.emoji_id;
END;
$$ LANGUAGE plpgsql STABLE;


-- Function to search users, correctly handling non-logged in searchers and text UUIDs
DROP FUNCTION IF EXISTS search_users(text, uuid);
DROP FUNCTION IF EXISTS search_users(text, text);
CREATE OR REPLACE FUNCTION search_users(p_search_term text, p_user_id text)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean) AS $$
DECLARE
    current_user_id_uuid uuid;
BEGIN
    -- Safely convert the incoming text ID to a UUID. If it's null or invalid, it remains null.
    BEGIN
        current_user_id_uuid := p_user_id::uuid;
    EXCEPTION WHEN invalid_text_representation THEN
        current_user_id_uuid := NULL;
    END;

    -- Execute the search query
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private
    FROM public.users u
    WHERE
        u.name ILIKE p_search_term || '%'
        -- Exclude the current user from search results if they are logged in
        AND (current_user_id_uuid IS NULL OR u.id <> current_user_id_uuid)
    ORDER BY u.name
    LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE;
