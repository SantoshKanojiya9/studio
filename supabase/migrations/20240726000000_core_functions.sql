
-- Helper function to search for users
CREATE OR REPLACE FUNCTION public.search_users(query text)
RETURNS TABLE (id uuid, name text, picture text, is_private boolean) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name, u.picture, u.is_private
    FROM public.users u
    WHERE u.name ILIKE '%' || query || '%';
END;
$$ LANGUAGE plpgsql;

-- Helper function to get paginated likers for a post
CREATE OR REPLACE FUNCTION public.get_paginated_likers(
    p_emoji_id uuid,
    p_current_user_id uuid,
    p_limit integer,
    p_offset integer
)
RETURNS TABLE (
    id uuid,
    name text,
    picture text,
    is_private boolean,
    support_status public.support_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        s.status
    FROM
        public.likes l
    JOIN
        public.users u ON l.user_id = u.id
    LEFT JOIN
        public.supports s ON s.supporter_id = p_current_user_id AND s.supported_id = u.id
    WHERE
        l.emoji_id = p_emoji_id
    ORDER BY
        l.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;


-- RPC to get user notifications with actor and emoji details
CREATE OR REPLACE FUNCTION public.get_user_notifications(p_user_id uuid, p_limit integer, p_offset integer)
RETURNS TABLE(
    id bigint,
    type text,
    created_at timestamp with time zone,
    emoji_id uuid,
    actor jsonb,
    emoji jsonb,
    actor_support_status public.support_status
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        n.id,
        n.type,
        n.created_at,
        n.emoji_id,
        jsonb_build_object(
            'id', u.id,
            'name', u.name,
            'picture', u.picture,
            'is_private', u.is_private
        ) as actor,
        jsonb_build_object(
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
            'feature_offset_y', e.feature_offset_y
        ) as emoji,
        s.status as actor_support_status
    FROM
        notifications n
    JOIN
        users u ON n.actor_id = u.id
    LEFT JOIN
        emojis e ON n.emoji_id = e.id
    LEFT JOIN
        supports s ON s.supporter_id = p_user_id AND s.supported_id = u.id
    WHERE
        n.recipient_id = p_user_id
    ORDER BY
        n.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$;


-- Helper function to get like counts for multiple posts efficiently
CREATE OR REPLACE FUNCTION get_like_counts_for_posts(post_ids uuid[])
RETURNS TABLE (emoji_id uuid, like_count bigint)
AS $$
BEGIN
  RETURN QUERY
  SELECT l.emoji_id, COUNT(l.user_id) as like_count
  FROM likes l
  WHERE l.emoji_id = ANY(post_ids)
  GROUP BY l.emoji_id;
END;
$$ LANGUAGE plpgsql;

-- Helper function to search for users and include mood status
CREATE OR REPLACE FUNCTION public.search_users_with_mood(p_query text, p_current_user_id uuid)
RETURNS TABLE (
    id uuid,
    name text,
    picture text,
    is_private boolean,
    has_mood boolean
) AS $$
DECLARE
    twenty_four_hours_ago timestamp with time zone := now() - interval '24 hours';
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        EXISTS (
            SELECT 1
            FROM public.moods m
            WHERE m.user_id = u.id
            AND m.created_at >= twenty_four_hours_ago
        ) as has_mood
    FROM
        public.users u
    WHERE
        u.name ILIKE '%' || p_query || '%';
END;
$$ LANGUAGE plpgsql;


-- Function to get mood viewers info
CREATE OR REPLACE FUNCTION get_mood_viewers(p_mood_id integer)
RETURNS TABLE (
    id uuid,
    name text,
    picture text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture
    FROM
        mood_views mv
    JOIN
        users u ON mv.viewer_id = u.id
    WHERE
        mv.mood_id = p_mood_id
    ORDER BY
        mv.viewed_at DESC;
END;
$$ LANGUAGE plpgsql;


-- Function to get mood status for a list of users
CREATE OR REPLACE FUNCTION get_users_with_mood_status(p_user_ids uuid[])
RETURNS TABLE(id uuid, name text, picture text, has_mood boolean) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        EXISTS (
            SELECT 1 FROM moods m
            WHERE m.user_id = u.id
            AND m.created_at >= (now() - interval '24 hours')
        ) AS has_mood
    FROM users u
    WHERE u.id = ANY(p_user_ids);
END;
$$ LANGUAGE plpgsql;

-- Function to get supporters with their support status relative to the current user
CREATE OR REPLACE FUNCTION get_supporters_with_status(p_user_id uuid, p_current_user_id uuid, p_limit integer, p_offset integer)
RETURNS TABLE (
    id uuid,
    name text,
    picture text,
    is_private boolean,
    support_status public.support_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        current_user_support.status
    FROM
        supports s
    JOIN
        users u ON s.supporter_id = u.id
    LEFT JOIN
        supports current_user_support ON current_user_support.supporter_id = p_current_user_id AND current_user_support.supported_id = u.id
    WHERE
        s.supported_id = p_user_id AND s.status = 'approved'
    ORDER BY
        s.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get list of users someone is supporting, with their support status relative to the current user
CREATE OR REPLACE FUNCTION get_supporting_with_status(p_user_id uuid, p_current_user_id uuid, p_limit integer, p_offset integer)
RETURNS TABLE (
    id uuid,
    name text,
    picture text,
    is_private boolean,
    support_status public.support_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        current_user_support.status
    FROM
        supports s
    JOIN
        users u ON s.supported_id = u.id
    LEFT JOIN
        supports current_user_support ON current_user_support.supporter_id = p_current_user_id AND current_user_support.supported_id = u.id
    WHERE
        s.supporter_id = p_user_id AND s.status = 'approved'
    ORDER BY
        s.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;


-- Function to get gallery posts, respecting privacy settings
DROP FUNCTION IF EXISTS public.get_gallery_posts(uuid, uuid, integer, integer);

CREATE OR REPLACE FUNCTION public.get_gallery_posts(p_user_id uuid, p_current_user_id uuid, p_limit integer, p_offset integer)
RETURNS TABLE(
    id uuid,
    created_at timestamp with time zone,
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
    is_liked boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
    can_view BOOLEAN;
BEGIN
    -- Determine if the current user can view the posts
    SELECT
        u.is_private = false OR -- The profile is public
        p_user_id = p_current_user_id OR -- The viewer is the owner
        EXISTS ( -- The viewer is an approved supporter
            SELECT 1
            FROM public.supports s
            WHERE s.supported_id = p_user_id
              AND s.supporter_id = p_current_user_id
              AND s.status = 'approved'
        )
    INTO can_view
    FROM public.users u
    WHERE u.id = p_user_id;

    -- If the user cannot view, return an empty set
    IF can_view IS NOT TRUE THEN
        RETURN;
    END IF;

    -- If the user can view, return the paginated posts
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
        (SELECT COUNT(*) FROM public.likes l WHERE l.emoji_id = e.id) AS like_count,
        EXISTS(SELECT 1 FROM public.likes l WHERE l.emoji_id = e.id AND l.user_id = p_current_user_id) AS is_liked
    FROM
        public.emojis e
    WHERE
        e.user_id = p_user_id
    ORDER BY
        e.created_at DESC
    LIMIT
        p_limit
    OFFSET
        p_offset;
END;
$$;


-- Function to handle user deletion by marking them and scheduling a purge
CREATE OR REPLACE FUNCTION handle_delete_user()
RETURNS void AS $$
DECLARE
    user_id_to_delete uuid := auth.uid();
BEGIN
    -- Update the user's record in the public.users table
    UPDATE public.users
    SET
        name = 'Deleted User',
        picture = 'https://placehold.co/128x128.png',
        deleted_at = now() + interval '30 minutes'
    WHERE id = user_id_to_delete;

    -- Update user's metadata in auth.users
    UPDATE auth.users
    SET
        raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
            'name', 'Deleted User',
            'picture', 'https://placehold.co/128x128.png'
        ),
        email = 'deleted-' || user_id_to_delete || '@example.com',
        phone = null,
        email_change_token_new = null,
        phone_change_token = null,
        -- Disable the user immediately
        banned_until = now() + interval '1000 years'
    WHERE id = user_id_to_delete;

    -- Sign out the user
    -- This part is tricky inside a function, as there's no direct pg_cron way to do this.
    -- The sign-out should ideally be handled on the client after calling this RPC.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to purge users marked for deletion
CREATE OR REPLACE FUNCTION purge_deleted_users()
RETURNS void AS $$
BEGIN
    -- Delete users from auth.users who were marked for deletion
    -- and the deletion time has passed.
    DELETE FROM auth.users
    WHERE id IN (
        SELECT id FROM public.users
        WHERE deleted_at IS NOT NULL AND deleted_at <= now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function to purge old read notifications
CREATE OR REPLACE FUNCTION purge_old_notifications()
RETURNS void AS $$
BEGIN
  -- Delete notifications older than 7 days
  DELETE FROM public.notifications
  WHERE created_at < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
