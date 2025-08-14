
-- This migration fixes the get_feed_moods function to prevent datatype mismatch errors.

DROP FUNCTION IF EXISTS get_feed_moods(uuid);
CREATE OR REPLACE FUNCTION get_feed_moods(p_user_id uuid)
RETURNS TABLE(
    mood_id integer,
    mood_created_at timestamptz,
    mood_user_id uuid,
    is_viewed boolean,
    mood_user json,
    -- Columns from the 'emojis' table
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
    caption text
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id AS mood_id,
        m.created_at AS mood_created_at,
        m.user_id AS mood_user_id,
        EXISTS(SELECT 1 FROM public.mood_views mv WHERE mv.mood_id = m.id AND mv.viewer_id = p_user_id) AS is_viewed,
        json_build_object('id', u.id, 'name', u.name, 'picture', u.picture) AS mood_user,
        e.*
    FROM
        public.moods m
    JOIN
        public.emojis e ON m.emoji_id = e.id
    JOIN
        public.users u ON m.user_id = u.id
    WHERE
        m.user_id IN (
            SELECT p_user_id
            UNION
            SELECT s.supported_id FROM public.supports s
            WHERE s.supporter_id = p_user_id AND s.status = 'approved'
        )
    ORDER BY
        CASE WHEN m.user_id = p_user_id THEN 0 ELSE 1 END,
        m.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;
