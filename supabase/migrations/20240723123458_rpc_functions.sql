
-- This script creates/updates all the RPC functions for the application.
-- It is designed to be idempotent and can be run multiple times.

-- Function to get paginated list of likers for a post, including support status
DROP FUNCTION IF EXISTS get_paginated_likers(uuid, uuid, int, int);
CREATE OR REPLACE FUNCTION get_paginated_likers(p_emoji_id uuid, p_current_user_id uuid, p_limit int, p_offset int)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, support_status text, has_mood boolean) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.picture,
    u.is_private,
    CASE WHEN p_current_user_id IS NULL THEN NULL
         ELSE (
            SELECT s.status FROM public.supports s
            WHERE s.supporter_id = p_current_user_id AND s.supported_id = u.id
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
CREATE OR REPLACE FUNCTION get_supporters_with_status(p_user_id uuid, p_current_user_id uuid, p_limit int, p_offset int)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, support_status text, has_mood boolean) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.picture,
    u.is_private,
    CASE WHEN p_current_user_id IS NULL THEN NULL
         ELSE (
            SELECT s.status FROM public.supports s
            WHERE s.supporter_id = p_current_user_id AND s.supported_id = u.id
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
CREATE OR REPLACE FUNCTION get_supporting_with_status(p_user_id uuid, p_current_user_id uuid, p_limit int, p_offset int)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, support_status text, has_mood boolean) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.picture,
    u.is_private,
    CASE WHEN p_current_user_id IS NULL THEN NULL
        ELSE (
            SELECT s.status FROM public.supports s
            WHERE s.supporter_id = p_current_user_id AND s.supported_id = u.id
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

-- Function to get mood viewers
DROP FUNCTION IF EXISTS get_mood_viewers(int);
CREATE OR REPLACE FUNCTION get_mood_viewers(p_mood_id int)
RETURNS TABLE(id uuid, name text, picture text) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.picture
  FROM public.mood_views mv
  JOIN public.users u ON mv.viewer_id = u.id
  WHERE mv.mood_id = p_mood_id
  ORDER BY mv.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;


-- Function to get moods for the feed, including user info and viewed status
DROP FUNCTION IF EXISTS get_feed_moods(uuid);
CREATE OR REPLACE FUNCTION get_feed_moods(p_user_id uuid)
RETURNS TABLE(
  mood_id int,
  mood_user_id uuid,
  mood_created_at timestamptz,
  is_viewed boolean,
  id uuid,
  model text,
  expression text,
  background_color text,
  emoji_color text,
  show_sunglasses boolean,
  show_mustache boolean,
  selected_filter text,
  animation_type text,
  shape text,
  eye_style text,
  mouth_style text,
  eyebrow_style text,
  feature_offset_x numeric,
  feature_offset_y numeric,
  caption text,
  mood_user json
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id AS mood_id,
    m.user_id AS mood_user_id,
    m.created_at AS mood_created_at,
    EXISTS(SELECT 1 FROM public.mood_views mv WHERE mv.mood_id = m.id AND mv.viewer_id = p_user_id) AS is_viewed,
    e.*,
    json_build_object(
      'id', u.id,
      'name', u.name,
      'picture', u.picture
    ) AS mood_user
  FROM public.moods m
  JOIN public.emojis e ON m.emoji_id = e.id
  JOIN public.users u ON m.user_id = u.id
  WHERE m.user_id = p_user_id -- User's own mood
     OR m.user_id IN (SELECT s.supported_id FROM public.supports s WHERE s.supporter_id = p_user_id AND s.status = 'approved') -- Moods of people user follows
  ORDER BY (m.user_id = p_user_id) DESC, m.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get posts for the feed
DROP FUNCTION IF EXISTS get_feed_posts(uuid, int, int);
CREATE OR REPLACE FUNCTION get_feed_posts(p_user_id uuid, p_limit int, p_offset int)
RETURNS TABLE(
    id uuid,
    created_at timestamptz,
    user_id uuid,
    model text,
    expression text,
    background_color text,
    emoji_color text,
    show_sunglasses boolean,
    show_mustache boolean,
    selected_filter text,
    animation_type text,
    shape text,
    eye_style text,
    mouth_style text,
    eyebrow_style text,
    feature_offset_x numeric,
    feature_offset_y numeric,
    caption text,
    "user" json,
    like_count bigint,
    is_liked boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.*,
    json_build_object(
        'id', u.id,
        'name', u.name,
        'picture', u.picture,
        'has_mood', EXISTS(SELECT 1 FROM public.moods m WHERE m.user_id = u.id)
    ) AS "user",
    count(l.emoji_id) AS like_count,
    EXISTS(SELECT 1 FROM public.likes li WHERE li.emoji_id = e.id AND li.user_id = p_user_id) AS is_liked
  FROM public.emojis e
  JOIN public.users u ON e.user_id = u.id
  LEFT JOIN public.likes l ON e.id = l.emoji_id
  WHERE e.user_id IN (SELECT s.supported_id FROM public.supports s WHERE s.supporter_id = p_user_id AND s.status = 'approved')
  GROUP BY e.id, u.id
  ORDER BY e.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get posts for a user's gallery
DROP FUNCTION IF EXISTS get_gallery_posts(uuid, uuid, int, int);
CREATE OR REPLACE FUNCTION get_gallery_posts(p_user_id uuid, p_current_user_id uuid, p_limit int, p_offset int)
RETURNS TABLE (
    id uuid, created_at timestamptz, user_id uuid, model text, expression text, background_color text, emoji_color text, show_sunglasses boolean, show_mustache boolean, selected_filter text, animation_type text, shape text, eye_style text, mouth_style text, eyebrow_style text, feature_offset_x numeric, feature_offset_y numeric, caption text, "user" json, like_count bigint, is_liked boolean
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.*,
        json_build_object('id', u.id, 'name', u.name, 'picture', u.picture) AS "user",
        count(l.emoji_id) AS like_count,
        CASE WHEN p_current_user_id IS NULL THEN false
             ELSE EXISTS(SELECT 1 FROM public.likes li WHERE li.emoji_id = e.id AND li.user_id = p_current_user_id)
        END AS is_liked
    FROM public.emojis e
    JOIN public.users u ON e.user_id = u.id
    LEFT JOIN public.likes l ON e.id = l.emoji_id
    WHERE e.user_id = p_user_id
    GROUP BY e.id, u.id
    ORDER BY e.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get posts for the explore page (public, non-private users)
DROP FUNCTION IF EXISTS get_explore_posts(uuid, int, int);
CREATE OR REPLACE FUNCTION get_explore_posts(p_current_user_id uuid, p_limit int, p_offset int)
RETURNS TABLE(
    id uuid, created_at timestamptz, user_id uuid, model text, expression text, background_color text, emoji_color text, show_sunglasses boolean, show_mustache boolean, selected_filter text, animation_type text, shape text, eye_style text, mouth_style text, eyebrow_style text, feature_offset_x numeric, feature_offset_y numeric, caption text, "user" json, like_count bigint, is_liked boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.*,
    json_build_object('id', u.id, 'name', u.name, 'picture', u.picture, 'has_mood', EXISTS(SELECT 1 FROM public.moods m WHERE m.user_id = u.id)) AS "user",
    count(l.emoji_id) AS like_count,
    CASE WHEN p_current_user_id IS NULL THEN false
         ELSE EXISTS(SELECT 1 FROM public.likes li WHERE li.emoji_id = e.id AND li.user_id = p_current_user_id)
    END AS is_liked
  FROM public.emojis e
  JOIN public.users u ON e.user_id = u.id
  LEFT JOIN public.likes l ON e.id = l.emoji_id
  WHERE u.is_private = false
  GROUP BY e.id, u.id
  ORDER BY e.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;


-- Function to search users, correctly handling null user_id
DROP FUNCTION IF EXISTS search_users(text, uuid);
DROP FUNCTION IF EXISTS search_users(text, text);
CREATE OR REPLACE FUNCTION search_users(p_search_term text, p_user_id text)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean) AS $$
DECLARE
    current_user_id uuid;
BEGIN
    -- Attempt to cast the text user ID to UUID. If it's null, invalid, or empty, it remains null.
    BEGIN
        current_user_id := p_user_id::uuid;
    EXCEPTION WHEN OTHERS THEN
        current_user_id := NULL;
    END;

    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private
    FROM public.users u
    WHERE
        u.name ILIKE p_search_term || '%'
        AND (current_user_id IS NULL OR u.id <> current_user_id) -- Exclude the current user
    ORDER BY u.name
    LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get notifications
DROP FUNCTION IF EXISTS get_user_notifications(uuid, int, int);
CREATE OR REPLACE FUNCTION get_user_notifications(p_user_id uuid, p_limit int, p_offset int)
RETURNS TABLE (
    id int,
    type text,
    created_at timestamptz,
    emoji_id uuid,
    actor json,
    emoji json,
    actor_support_status text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        n.id,
        n.type,
        n.created_at,
        n.emoji_id,
        json_build_object(
            'id', a.id,
            'name', a.name,
            'picture', a.picture,
            'is_private', a.is_private
        ) AS actor,
        (
            SELECT json_build_object(
                'id', e.id,
                'created_at', e.created_at,
                'user_id', e.user_id,
                'model', e.model,
                'expression', e.expression,
                'background_color', e.background_color,
                'emoji_color', e.emoji_color,
                'show_sunglasses', e.show_sunglasses,
                'show_mustache', e.show_mustache,
                'selected_filter', e.selected_filter,
                'animation_type', e.animation_type,
                'shape', e.shape,
                'eye_style', e.eye_style,
                'mouth_style', e.mouth_style,
                'eyebrow_style', e.eyebrow_style,
                'feature_offset_x', e.feature_offset_x,
                'feature_offset_y', e.feature_offset_y,
                'caption', e.caption
            )
            FROM public.emojis e WHERE e.id = n.emoji_id
        ) AS emoji,
        (
            SELECT s.status FROM public.supports s
            WHERE s.supporter_id = p_user_id AND s.supported_id = a.id
        )::text AS actor_support_status
    FROM public.notifications n
    JOIN public.users a ON n.actor_id = a.id
    WHERE n.recipient_id = p_user_id
    ORDER BY n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function for user deletion
DROP FUNCTION IF EXISTS handle_delete_user();
CREATE OR REPLACE FUNCTION handle_delete_user()
RETURNS void AS $$
DECLARE
  user_id uuid := auth.uid();
BEGIN
  -- Update the user's entry in the public.users table
  UPDATE public.users
  SET deleted_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to get users and their mood status
DROP FUNCTION IF EXISTS get_users_with_mood_status(uuid[]);
CREATE OR REPLACE FUNCTION get_users_with_mood_status(p_user_ids uuid[])
RETURNS TABLE(id uuid, name text, picture text, has_mood boolean) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        EXISTS(SELECT 1 FROM public.moods m WHERE m.user_id = u.id) AS has_mood
    FROM public.users u
    WHERE u.id = ANY(p_user_ids);
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to purge old users marked for deletion
DROP FUNCTION IF EXISTS purge_deleted_users();
CREATE OR REPLACE FUNCTION purge_deleted_users()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.users WHERE id IN (
    SELECT id FROM public.users WHERE deleted_at IS NOT NULL AND deleted_at < now() - interval '30 minutes'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to purge old notifications
DROP FUNCTION IF EXISTS purge_old_notifications();
CREATE OR REPLACE FUNCTION purge_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;
