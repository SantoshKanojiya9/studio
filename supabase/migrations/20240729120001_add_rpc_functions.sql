
-- =============================================
-- Function: get_supporters_with_status
-- Description: Fetches supporters of a user, along with the current user's support status towards them.
-- Parameters:
--   p_user_id: The ID of the user whose supporters are being fetched.
--   p_current_user_id: The ID of the user viewing the list.
--   p_limit: The number of records to return.
--   p_offset: The offset for pagination.
-- =============================================
CREATE OR REPLACE FUNCTION public.get_supporters_with_status(
    p_user_id uuid,
    p_current_user_id uuid,
    p_limit integer,
    p_offset integer
)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, support_status public.support_status, has_mood boolean)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        (SELECT s2.status FROM public.supports s2 WHERE s2.supporter_id = p_current_user_id AND s2.supported_id = u.id) AS support_status,
        EXISTS (SELECT 1 FROM public.moods m WHERE m.user_id = u.id AND m.created_at > now() - interval '24 hours') AS has_mood
    FROM
        public.supports s
    JOIN
        public.users u ON s.supporter_id = u.id
    WHERE
        s.supported_id = p_user_id AND s.status = 'approved'
    ORDER BY
        s.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- =============================================
-- Function: get_supporting_with_status
-- Description: Fetches users that a specific user is supporting, along with the current user's support status towards them.
-- Parameters:
--   p_user_id: The ID of the user whose supporting list is being fetched.
--   p_current_user_id: The ID of the user viewing the list.
--   p_limit: The number of records to return.
--   p_offset: The offset for pagination.
-- =============================================
CREATE OR REPLACE FUNCTION public.get_supporting_with_status(
    p_user_id uuid,
    p_current_user_id uuid,
    p_limit integer,
    p_offset integer
)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, support_status public.support_status, has_mood boolean)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        (SELECT s2.status FROM public.supports s2 WHERE s2.supporter_id = p_current_user_id AND s2.supported_id = u.id) AS support_status,
        EXISTS (SELECT 1 FROM public.moods m WHERE m.user_id = u.id AND m.created_at > now() - interval '24 hours') AS has_mood
    FROM
        public.supports s
    JOIN
        public.users u ON s.supported_id = u.id
    WHERE
        s.supporter_id = p_user_id AND s.status = 'approved'
    ORDER BY
        s.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


-- =============================================
-- Function: get_paginated_likers
-- Description: Fetches users who liked a post, with their support status relative to the current user.
-- Parameters:
--   p_emoji_id: The ID of the emoji post.
--   p_current_user_id: The ID of the user viewing the list.
--   p_limit: The number of records to return.
--   p_offset: The offset for pagination.
-- =============================================
CREATE OR REPLACE FUNCTION public.get_paginated_likers(
    p_emoji_id uuid,
    p_current_user_id uuid,
    p_limit integer,
    p_offset integer
)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, support_status public.support_status, has_mood boolean)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        (SELECT s.status FROM public.supports s WHERE s.supporter_id = p_current_user_id AND s.supported_id = u.id) AS support_status,
        EXISTS (SELECT 1 FROM public.moods m WHERE m.user_id = u.id AND m.created_at > now() - interval '24 hours') AS has_mood
    FROM
        public.likes l
    JOIN
        public.users u ON l.user_id = u.id
    WHERE
        l.emoji_id = p_emoji_id
    ORDER BY
        l.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- =============================================
-- Function: get_user_notifications
-- Description: Fetches notifications for a user, including details about the actor and related post.
-- Parameters:
--   p_user_id: The ID of the user whose notifications are being fetched.
--   p_limit: The number of records to return.
--   p_offset: The offset for pagination.
-- =============================================
CREATE OR REPLACE FUNCTION public.get_user_notifications(
    p_user_id uuid,
    p_limit integer,
    p_offset integer
)
RETURNS TABLE(id bigint, type public.notification_type, created_at timestamp with time zone, emoji_id uuid, actor json, emoji json, actor_support_status public.support_status)
LANGUAGE plpgsql
AS $$
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
        ) AS actor,
        (SELECT row_to_json(e.*) FROM public.emojis e WHERE e.id = n.emoji_id) AS emoji,
        (SELECT s.status FROM public.supports s WHERE s.supporter_id = p_user_id AND s.supported_id = u.id) AS actor_support_status
    FROM
        public.notifications n
    JOIN
        public.users u ON n.actor_id = u.id
    WHERE
        n.recipient_id = p_user_id
    ORDER BY
        n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


-- =============================================
-- Function: get_feed_posts
-- Description: Fetches the feed posts for a user, including posts from users they support and their own posts.
-- Parameters:
--   p_user_id: The ID of the user whose feed is being fetched.
--   p_limit: The number of records to return.
--   p_offset: The offset for pagination.
-- =============================================
CREATE OR REPLACE FUNCTION public.get_feed_posts(
    p_user_id uuid,
    p_limit integer,
    p_offset integer
)
RETURNS TABLE(
    id uuid,
    created_at timestamp with time zone,
    user_id uuid,
    model public.model_type,
    expression public.expression,
    background_color text,
    emoji_color text,
    show_sunglasses boolean,
    show_mustache boolean,
    selected_filter text,
    animation_type public.animation_type,
    shape public.shape_type,
    eye_style public.feature_style,
    mouth_style public.feature_style,
    eyebrow_style public.feature_style,
    feature_offset_x double precision,
    feature_offset_y double precision,
    caption text,
    "user" json,
    like_count bigint,
    is_liked boolean
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.*,
        json_build_object(
            'id', u.id,
            'name', u.name,
            'picture', u.picture,
            'has_mood', EXISTS (SELECT 1 FROM public.moods m WHERE m.user_id = u.id AND m.created_at > now() - interval '24 hours')
        ) as "user",
        (SELECT count(*) FROM public.likes l WHERE l.emoji_id = e.id) as like_count,
        EXISTS (SELECT 1 FROM public.likes l WHERE l.emoji_id = e.id AND l.user_id = p_user_id) as is_liked
    FROM public.emojis e
    JOIN public.users u ON e.user_id = u.id
    WHERE e.user_id = p_user_id OR e.user_id IN (
        SELECT s.supported_id FROM public.supports s
        WHERE s.supporter_id = p_user_id AND s.status = 'approved'
    )
    ORDER BY e.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- =============================================
-- Function: get_gallery_posts
-- Description: Fetches posts for a user's gallery. Handles privacy checks.
-- Parameters:
--   p_user_id: The ID of the user whose gallery is being fetched.
--   p_current_user_id: The ID of the user viewing the gallery.
--   p_limit: The number of records to return.
--   p_offset: The offset for pagination.
-- =============================================
CREATE OR REPLACE FUNCTION public.get_gallery_posts(
    p_user_id uuid,
    p_current_user_id uuid,
    p_limit integer,
    p_offset integer
)
RETURNS TABLE(
    id uuid,
    created_at timestamp with time zone,
    user_id uuid,
    model public.model_type,
    expression public.expression,
    background_color text,
    emoji_color text,
    show_sunglasses boolean,
    show_mustache boolean,
    selected_filter text,
    animation_type public.animation_type,
    shape public.shape_type,
    eye_style public.feature_style,
    mouth_style public.feature_style,
    eyebrow_style public.feature_style,
    feature_offset_x double precision,
    feature_offset_y double precision,
    caption text,
    like_count bigint,
    is_liked boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_is_private boolean;
    v_can_view boolean;
BEGIN
    SELECT u.is_private INTO v_is_private FROM public.users u WHERE u.id = p_user_id;

    v_can_view := NOT v_is_private
                  OR p_user_id = p_current_user_id
                  OR EXISTS (
                      SELECT 1 FROM public.supports s
                      WHERE s.supporter_id = p_current_user_id AND s.supported_id = p_user_id AND s.status = 'approved'
                  );

    IF v_can_view THEN
        RETURN QUERY
        SELECT
            e.*,
            (SELECT count(*) FROM public.likes l WHERE l.emoji_id = e.id) as like_count,
            EXISTS (SELECT 1 FROM public.likes l WHERE l.emoji_id = e.id AND l.user_id = p_current_user_id) as is_liked
        FROM public.emojis e
        WHERE e.user_id = p_user_id
        ORDER BY e.created_at DESC
        LIMIT p_limit
        OFFSET p_offset;
    ELSE
        RETURN; -- Return empty set if user cannot view
    END IF;
END;
$$;

-- =============================================
-- Function: get_explore_posts
-- Description: Fetches public posts for the explore page.
-- Parameters:
--   p_current_user_id: The ID of the user viewing the page, to determine mood status.
--   p_limit: The number of records to return.
--   p_offset: The offset for pagination.
-- =============================================
CREATE OR REPLACE FUNCTION public.get_explore_posts(
    p_current_user_id uuid,
    p_limit integer,
    p_offset integer
)
RETURNS TABLE(
    id uuid,
    created_at timestamp with time zone,
    user_id uuid,
    model public.model_type,
    expression public.expression,
    background_color text,
    emoji_color text,
    show_sunglasses boolean,
    show_mustache boolean,
    selected_filter text,
    animation_type public.animation_type,
    shape public.shape_type,
    eye_style public.feature_style,
    mouth_style public.feature_style,
    eyebrow_style public.feature_style,
    feature_offset_x double precision,
    feature_offset_y double precision,
    caption text,
    "user" json
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.*,
        json_build_object(
            'id', u.id,
            'name', u.name,
            'picture', u.picture,
            'is_private', u.is_private,
            'has_mood', EXISTS (SELECT 1 FROM public.moods m WHERE m.user_id = u.id AND m.created_at > now() - interval '24 hours')
        ) as "user"
    FROM public.emojis e
    JOIN public.users u ON e.user_id = u.id
    WHERE u.is_private = false
    ORDER BY e.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


-- =============================================
-- Function: search_users
-- Description: Searches for users by name using trigram similarity.
-- Parameters:
--   p_search_term: The search query.
-- =============================================
CREATE OR REPLACE FUNCTION public.search_users(p_search_term text)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean)
LANGUAGE sql
AS $$
  SELECT id, name, picture, is_private
  FROM public.users
  WHERE name ILIKE '%' || p_search_term || '%'
  ORDER BY similarity(name, p_search_term) DESC
  LIMIT 10;
$$;

-- =============================================
-- Function: get_feed_moods
-- Description: Fetches moods from supported users and the current user from the last 24 hours.
-- Parameters:
--   p_user_id: The ID of the user whose mood feed is being fetched.
-- =============================================
CREATE OR REPLACE FUNCTION public.get_feed_moods(
    p_user_id uuid
)
RETURNS TABLE (
    id uuid,
    created_at timestamp with time zone,
    user_id uuid,
    model public.model_type,
    expression public.expression,
    background_color text,
    emoji_color text,
    show_sunglasses boolean,
    show_mustache boolean,
    selected_filter text,
    animation_type public.animation_type,
    shape public.shape_type,
    eye_style public.feature_style,
    mouth_style public.feature_style,
    eyebrow_style public.feature_style,
    feature_offset_x double precision,
    feature_offset_y double precision,
    caption text,
    mood_id integer,
    mood_created_at timestamp with time zone,
    mood_user_id uuid,
    mood_user json,
    is_viewed boolean
)
AS $$
BEGIN
    RETURN QUERY
    WITH user_and_supported_ids AS (
        SELECT s.supported_id AS id FROM public.supports s WHERE s.supporter_id = p_user_id AND s.status = 'approved'
        UNION ALL
        SELECT p_user_id
    )
    SELECT
        e.*,
        m.id AS mood_id,
        m.created_at AS mood_created_at,
        m.user_id AS mood_user_id,
        json_build_object(
            'id', u.id,
            'name', u.name,
            'picture', u.picture
        ) AS mood_user,
        EXISTS (SELECT 1 FROM public.mood_views mv WHERE mv.mood_id = m.id AND mv.viewer_id = p_user_id) AS is_viewed
    FROM public.moods m
    JOIN public.emojis e ON m.emoji_id = e.id
    JOIN public.users u ON m.user_id = u.id
    WHERE m.user_id IN (SELECT id FROM user_and_supported_ids)
      AND m.created_at > now() - interval '24 hours'
    ORDER BY
        -- Put current user's mood first
        (CASE WHEN m.user_id = p_user_id THEN 0 ELSE 1 END),
        -- Then unviewed moods
        (CASE WHEN EXISTS (SELECT 1 FROM public.mood_views mv WHERE mv.mood_id = m.id AND mv.viewer_id = p_user_id) THEN 1 ELSE 0 END),
        -- Then by creation date
        m.created_at DESC;
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- Function: get_mood_viewers
-- Description: Fetches a list of users who have viewed a specific mood.
-- Parameters:
--   p_mood_id: The ID of the mood.
-- =============================================
CREATE OR REPLACE FUNCTION public.get_mood_viewers(
    p_mood_id integer
)
RETURNS TABLE (id uuid, name text, picture text)
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
$$ LANGUAGE plpgsql;


-- =============================================
-- Function: get_like_counts_for_posts
-- Description: Fetches like counts for a given list of post IDs.
-- Parameters:
--   post_ids: An array of emoji IDs.
-- =============================================
CREATE OR REPLACE FUNCTION public.get_like_counts_for_posts(post_ids uuid[])
RETURNS TABLE(emoji_id uuid, like_count bigint) AS $$
    SELECT l.emoji_id, count(l.user_id) as like_count
    FROM public.likes l
    WHERE l.emoji_id = ANY(post_ids)
    GROUP BY l.emoji_id;
$$ LANGUAGE sql;


-- =============================================
-- Function: handle_delete_user
-- Description: Schedules a user for deletion by setting the deleted_at timestamp.
--              Called from a client-side RPC, so it operates on the authenticated user.
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_delete_user()
RETURNS void AS $$
  UPDATE public.users
  SET deleted_at = now() + interval '30 minutes'
  WHERE id = auth.uid();

  -- Note: The actual deletion is handled by a cron job `purge_deleted_users`.
$$ LANGUAGE sql SECURITY DEFINER;

-- =============================================
-- Function: purge_deleted_users
-- Description: Cron job function to permanently delete users marked for deletion.
-- =============================================
CREATE OR REPLACE FUNCTION public.purge_deleted_users()
RETURNS void AS $$
DECLARE
    user_to_delete record;
BEGIN
    FOR user_to_delete IN
        SELECT id FROM public.users WHERE deleted_at IS NOT NULL AND deleted_at <= now()
    LOOP
        -- Use the admin auth functions to delete the user from the auth schema
        PERFORM auth.admin_delete_user(user_to_delete.id);
        -- The trigger on the auth.users table will cascade delete the public.users record
    END LOOP;
END;
$$ LANGUAGE plpgsql;


-- =============================================
-- Function: purge_old_notifications
-- Description: Cron job function to delete notifications older than 30 days.
-- =============================================
CREATE OR REPLACE FUNCTION public.purge_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- Function: get_users_with_mood_status
-- Description: Fetches a list of users and indicates if they have a mood active within the last 24 hours.
-- Parameters:
--   p_user_ids: An array of user IDs to check.
-- =============================================
CREATE OR REPLACE FUNCTION public.get_users_with_mood_status(p_user_ids uuid[])
RETURNS TABLE (id uuid, name text, picture text, has_mood boolean)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    u.id,
    u.name,
    u.picture,
    EXISTS (SELECT 1 FROM public.moods m WHERE m.user_id = u.id AND m.created_at > now() - interval '24 hours') AS has_mood
  FROM public.users u
  WHERE u.id = ANY(p_user_ids);
END;
$$ LANGUAGE plpgsql;
