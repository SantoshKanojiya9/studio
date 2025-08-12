
-- Helper function to get support status between two users
CREATE OR REPLACE FUNCTION get_support_status(p_current_user_id uuid, p_target_user_id uuid)
RETURNS TEXT AS $$
DECLARE
    status TEXT;
BEGIN
    IF p_current_user_id IS NULL THEN
        RETURN NULL;
    END IF;
    SELECT s.status INTO status
    FROM public.supports s
    WHERE s.supporter_id = p_current_user_id AND s.supported_id = p_target_user_id;
    RETURN status;
END;
$$ LANGUAGE plpgsql;

-- RPC to get a user's supporters with their support status relative to the current user
CREATE OR REPLACE FUNCTION get_supporters_with_status(p_user_id uuid, p_current_user_id uuid, p_limit integer, p_offset integer)
RETURNS TABLE (
    id uuid,
    name TEXT,
    picture TEXT,
    is_private BOOLEAN,
    support_status TEXT,
    has_mood BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        get_support_status(p_current_user_id, u.id) AS support_status,
        EXISTS (
            SELECT 1 FROM public.moods m
            WHERE m.user_id = u.id
            AND m.created_at >= NOW() - INTERVAL '24 hours'
        ) AS has_mood
    FROM public.supports s
    JOIN public.users u ON s.supporter_id = u.id
    WHERE s.supported_id = p_user_id AND s.status = 'approved'
    ORDER BY s.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- RPC to get whom a user is supporting, with their support status relative to the current user
CREATE OR REPLACE FUNCTION get_supporting_with_status(p_user_id uuid, p_current_user_id uuid, p_limit integer, p_offset integer)
RETURNS TABLE (
    id uuid,
    name TEXT,
    picture TEXT,
    is_private BOOLEAN,
    support_status TEXT,
    has_mood BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        get_support_status(p_current_user_id, u.id) AS support_status,
        EXISTS (
            SELECT 1 FROM public.moods m
            WHERE m.user_id = u.id
            AND m.created_at >= NOW() - INTERVAL '24 hours'
        ) AS has_mood
    FROM public.supports s
    JOIN public.users u ON s.supported_id = u.id
    WHERE s.supporter_id = p_user_id AND s.status = 'approved'
    ORDER BY s.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;


-- RPC to get a list of users who liked a post, with their support status relative to the current user
CREATE OR REPLACE FUNCTION get_paginated_likers(p_emoji_id uuid, p_current_user_id uuid, p_limit integer, p_offset integer)
RETURNS TABLE (
    id uuid,
    name TEXT,
    picture TEXT,
    is_private BOOLEAN,
    support_status TEXT,
    has_mood BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        get_support_status(p_current_user_id, u.id) AS support_status,
        EXISTS (
            SELECT 1 FROM public.moods m
            WHERE m.user_id = u.id
            AND m.created_at >= NOW() - INTERVAL '24 hours'
        ) AS has_mood
    FROM public.likes l
    JOIN public.users u ON l.user_id = u.id
    WHERE l.emoji_id = p_emoji_id
    ORDER BY l.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;


-- RPC to get like counts for a batch of posts
CREATE OR REPLACE FUNCTION get_like_counts_for_posts(post_ids uuid[])
RETURNS TABLE (emoji_id uuid, like_count bigint) AS $$
BEGIN
    RETURN QUERY
    SELECT l.emoji_id, COUNT(l.user_id)
    FROM public.likes l
    WHERE l.emoji_id = ANY(post_ids)
    GROUP BY l.emoji_id;
END;
$$ LANGUAGE plpgsql;


-- RPC to get a user's notifications
CREATE OR REPLACE FUNCTION get_user_notifications(p_user_id uuid, p_limit integer, p_offset integer)
RETURNS TABLE (
    id BIGINT,
    type TEXT,
    created_at TIMESTAMPTZ,
    emoji_id UUID,
    actor JSON,
    emoji JSON,
    actor_support_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
      n.id,
      n.type,
      n.created_at,
      n.emoji_id,
      json_build_object(
          'id', u.id,
          'name', u.name,
          'picture', u.picture,
          'is_private', u.is_private
      ) as actor,
      (
          SELECT json_build_object(
              'id', e.id,
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
          FROM public.emojis e
          WHERE e.id = n.emoji_id
      ) as emoji,
      get_support_status(p_user_id, u.id) AS actor_support_status
  FROM public.notifications n
  JOIN public.users u ON n.actor_id = u.id
  WHERE n.recipient_id = p_user_id
  ORDER BY n.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- RPC to get users with their mood status
CREATE OR REPLACE FUNCTION get_users_with_mood_status(p_user_ids uuid[])
RETURNS TABLE(id uuid, name text, picture text, has_mood boolean)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
      u.id,
      u.name,
      u.picture,
      EXISTS (
          SELECT 1
          FROM public.moods m
          WHERE m.user_id = u.id
          AND m.created_at >= now() - interval '24 hours'
      ) as has_mood
  FROM public.users u
  WHERE u.id = ANY(p_user_ids);
END;
$$;


-- RPC to search for users
CREATE OR REPLACE FUNCTION search_users_with_mood(p_query text, p_current_user_id uuid)
RETURNS TABLE (
    id uuid,
    name TEXT,
    picture TEXT,
    is_private BOOLEAN,
    has_mood BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        EXISTS (
            SELECT 1 FROM public.moods m
            WHERE m.user_id = u.id
            AND m.created_at >= NOW() - INTERVAL '24 hours'
        ) AS has_mood
    FROM public.users u
    WHERE u.name ILIKE '%' || p_query || '%'
    AND u.id <> p_current_user_id -- Exclude the current user from search results
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- RPC to get mood viewers
CREATE OR REPLACE FUNCTION get_mood_viewers(p_mood_id bigint)
RETURNS TABLE (id uuid, name text, picture text)
LANGUAGE plpgsql
AS $$
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
$$;

-- RPC to handle user deletion marking
CREATE OR REPLACE FUNCTION handle_delete_user()
RETURNS void AS $$
DECLARE
    user_id uuid := auth.uid();
BEGIN
    -- Update the user's record to mark as deleted
    UPDATE public.users
    SET deleted_at = now()
    WHERE id = user_id;

    -- It's often better to let a separate cron job handle the actual deletion.
    -- This function just marks them. The cron job will purge them later.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- RPC to get gallery posts with privacy checks
CREATE OR REPLACE FUNCTION get_gallery_posts(p_user_id uuid, p_current_user_id uuid, p_limit integer, p_offset integer)
RETURNS TABLE (
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
    feature_offset_x real,
    feature_offset_y real,
    caption text,
    like_count bigint,
    is_liked boolean,
    "user" json
)
SECURITY DEFINER -- Use definer to check privacy before returning posts
AS $$
DECLARE
    is_private_profile BOOLEAN;
    is_supported BOOLEAN;
BEGIN
    -- Check if the profile is private
    SELECT u.is_private INTO is_private_profile FROM public.users u WHERE u.id = p_user_id;

    -- Check if the current user is an approved supporter
    IF p_current_user_id IS NOT NULL THEN
        SELECT EXISTS (
            SELECT 1 FROM public.supports s 
            WHERE s.supported_id = p_user_id AND s.supporter_id = p_current_user_id AND s.status = 'approved'
        ) INTO is_supported;
    ELSE
        is_supported := false;
    END IF;

    -- Return posts only if:
    -- 1. The profile is not private
    -- 2. The viewer is the owner of the profile
    -- 3. The viewer is an approved supporter
    IF NOT is_private_profile OR p_user_id = p_current_user_id OR is_supported THEN
        RETURN QUERY
        SELECT
            e.id,
            e.created_at,
            e.user_id,
            e.model,
            e.expression,
            e.background_color,
            e.emoji_color,
            e.show_sunglasses,
            e.show_mustache,
            e.selected_filter,
            e.animation_type,
            e.shape,
            e.eye_style,
            e.mouth_style,
            e.eyebrow_style,
            e.feature_offset_x,
            e.feature_offset_y,
            e.caption,
            (SELECT count(*) FROM public.likes l WHERE l.emoji_id = e.id) as like_count,
            EXISTS(SELECT 1 FROM public.likes l WHERE l.emoji_id = e.id AND l.user_id = p_current_user_id) as is_liked,
            json_build_object('id', u.id, 'name', u.name, 'picture', u.picture, 'is_private', u.is_private) as "user"
        FROM public.emojis e
        JOIN public.users u ON e.user_id = u.id
        WHERE e.user_id = p_user_id
        ORDER BY e.created_at DESC
        LIMIT p_limit
        OFFSET p_offset;
    END IF;
END;
$$ LANGUAGE plpgsql;
