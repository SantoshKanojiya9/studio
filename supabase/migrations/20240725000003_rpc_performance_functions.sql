
-- Drop all potentially conflicting functions first for a clean slate
DROP FUNCTION IF EXISTS get_paginated_likers(uuid, uuid, int, int);
DROP FUNCTION IF EXISTS get_supporters_with_status(uuid, uuid, int, int);
DROP FUNCTION IF EXISTS get_supporting_with_status(uuid, uuid, int, int);
DROP FUNCTION IF EXISTS get_gallery_posts(uuid, uuid, int, int);
DROP FUNCTION IF EXISTS get_explore_posts(uuid, int, int);
DROP FUNCTION IF EXISTS search_users(text, uuid);

-- Recreate all functions with proper null handling for the current user ID

-- Function to get paginated list of likers for a post, including support status for the current user (if logged in)
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

-- Function to get posts for a user's gallery, correctly handling non-logged-in viewers
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

-- Function to get posts for the explore page, correctly handling non-logged-in viewers
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

-- Function to search users, correctly handling non-logged-in searchers
CREATE OR REPLACE FUNCTION search_users(p_search_term text, p_user_id uuid)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean) AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.picture,
    u.is_private
  FROM public.users u
  WHERE
    u.name ILIKE p_search_term || '%'
    AND (p_user_id IS NULL OR u.id <> p_user_id)
  ORDER BY u.name
  LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get feed posts
CREATE OR REPLACE FUNCTION get_feed_posts(p_user_id uuid, p_limit int, p_offset int)
RETURNS TABLE(
    id uuid, created_at timestamptz, user_id uuid, model text, expression text, background_color text, emoji_color text, show_sunglasses boolean, show_mustache boolean, selected_filter text, animation_type text, shape text, eye_style text, mouth_style text, eyebrow_style text, feature_offset_x numeric, feature_offset_y numeric, caption text, "user" json, like_count bigint, is_liked boolean
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

-- Grant execution permissions to the authenticated role for all new functions
GRANT EXECUTE ON FUNCTION get_paginated_likers(uuid, uuid, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_supporters_with_status(uuid, uuid, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_supporting_with_status(uuid, uuid, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_gallery_posts(uuid, uuid, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION get_explore_posts(uuid, int, int) TO authenticated;
GRANT EXECUTE ON FUNCTION search_users(text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_feed_posts(uuid, int, int) TO authenticated;

-- Grant execution permissions to the anonymous role for functions that can be accessed by logged-out users
GRANT EXECUTE ON FUNCTION get_gallery_posts(uuid, uuid, int, int) TO anon;
GRANT EXECUTE ON FUNCTION get_explore_posts(uuid, int, int) TO anon;
GRANT EXECUTE ON FUNCTION search_users(text, uuid) TO anon;
