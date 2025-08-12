
-- Function to get a user's supporters along with the current user's support status towards them
CREATE OR REPLACE FUNCTION public.get_supporters_with_status(p_user_id uuid, p_current_user_id uuid, p_limit integer, p_offset integer)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, support_status public.support_status_enum, has_mood boolean)
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
        EXISTS (
            SELECT 1 FROM public.moods m
            WHERE m.user_id = u.id AND m.created_at > now() - interval '24 hours'
        ) as has_mood
    FROM public.supports s
    JOIN public.users u ON s.supporter_id = u.id
    WHERE s.supported_id = p_user_id AND s.status = 'approved'
    ORDER BY s.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Function to get who a user is supporting, along with the current user's support status towards them
CREATE OR REPLACE FUNCTION public.get_supporting_with_status(p_user_id uuid, p_current_user_id uuid, p_limit integer, p_offset integer)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, support_status public.support_status_enum, has_mood boolean)
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
        EXISTS (
            SELECT 1 FROM public.moods m
            WHERE m.user_id = u.id AND m.created_at > now() - interval '24 hours'
        ) as has_mood
    FROM public.supports s
    JOIN public.users u ON s.supported_id = u.id
    WHERE s.supporter_id = p_user_id AND s.status = 'approved'
    ORDER BY s.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Function to handle user deletion by marking them as deleted
CREATE OR REPLACE FUNCTION public.handle_delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Mark user in the public users table
    UPDATE public.users
    SET deleted_at = now()
    WHERE id = auth.uid();

    -- Also sign out the user from all sessions via the admin API
    -- Note: This requires the 'supabase_admin' role and direct function call might be restricted.
    -- The Edge Function approach is more robust for calling auth.admin.
END;
$$;

-- Function to get paginated list of likers for a post
CREATE OR REPLACE FUNCTION public.get_paginated_likers(p_emoji_id uuid, p_current_user_id uuid, p_limit integer, p_offset integer)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, support_status public.support_status_enum, has_mood boolean)
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
        EXISTS (
            SELECT 1 FROM public.moods m
            WHERE m.user_id = u.id AND m.created_at > now() - interval '24 hours'
        ) as has_mood
    FROM public.likes l
    JOIN public.users u ON l.user_id = u.id
    WHERE l.emoji_id = p_emoji_id
    ORDER BY l.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


-- Function to get notifications for a user
CREATE OR REPLACE FUNCTION public.get_user_notifications(p_user_id uuid, p_limit integer, p_offset integer)
RETURNS TABLE(
    id bigint,
    type public.notification_type,
    created_at timestamp with time zone,
    emoji_id uuid,
    actor json,
    emoji json,
    actor_support_status public.support_status_enum
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
        json_build_object(
            'id', u.id,
            'name', u.name,
            'picture', u.picture,
            'is_private', u.is_private
        ) as actor,
        json_build_object(
            'id', e.id,
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
        ) as emoji,
        (SELECT s.status FROM public.supports s WHERE s.supporter_id = p_user_id AND s.supported_id = u.id) AS actor_support_status
    FROM public.notifications n
    JOIN public.users u ON n.actor_id = u.id
    LEFT JOIN public.emojis e ON n.emoji_id = e.id
    WHERE n.recipient_id = p_user_id
    ORDER BY n.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;


-- Function to get like counts for multiple posts
CREATE OR REPLACE FUNCTION public.get_like_counts_for_posts(post_ids uuid[])
RETURNS TABLE (emoji_id uuid, like_count bigint)
AS $$
BEGIN
    RETURN QUERY
    SELECT l.emoji_id, COUNT(l.user_id)
    FROM public.likes l
    WHERE l.emoji_id = ANY(post_ids)
    GROUP BY l.emoji_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get mood viewers
CREATE OR REPLACE FUNCTION public.get_mood_viewers(p_mood_id integer)
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
    ORDER BY mv.viewed_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to search users
CREATE OR REPLACE FUNCTION public.search_users_with_mood(p_query text, p_current_user_id uuid)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, has_mood boolean)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.name,
        u.picture,
        u.is_private,
        EXISTS (
            SELECT 1 FROM public.moods m
            WHERE m.user_id = u.id AND m.created_at > now() - interval '24 hours'
        ) as has_mood
    FROM public.users u
    WHERE u.name ILIKE '%' || p_query || '%'
    LIMIT 10;
END;
$$;

-- Function to get user profiles with their current mood status
CREATE OR REPLACE FUNCTION public.get_users_with_mood_status(p_user_ids uuid[])
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
            SELECT 1 FROM public.moods m
            WHERE m.user_id = u.id AND m.created_at > now() - interval '24 hours'
        ) as has_mood
    FROM public.users u
    WHERE u.id = ANY(p_user_ids);
END;
$$;

-- Function to purge old, soft-deleted users
CREATE OR REPLACE FUNCTION public.purge_deleted_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM auth.users
    WHERE id IN (
        SELECT id FROM public.users
        WHERE deleted_at IS NOT NULL AND deleted_at < now() - interval '30 minutes'
    );
END;
$$;

-- Function to purge old notifications
CREATE OR REPLACE FUNCTION public.purge_old_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM public.notifications
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$;

-- Secure gallery posts function with privacy checks
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
