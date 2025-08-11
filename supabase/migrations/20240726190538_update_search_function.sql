
-- Drop the existing function to replace it
DROP FUNCTION IF EXISTS public.search_users_with_mood_status(p_search_term text, p_user_id uuid);

-- Recreate the function with improved logic
CREATE OR REPLACE FUNCTION public.search_users_with_mood_status(p_search_term text, p_user_id uuid DEFAULT NULL)
RETURNS TABLE(
    id uuid,
    name text,
    picture text,
    is_private boolean,
    has_mood boolean
)
LANGUAGE plpgsql
AS $$
DECLARE
    twenty_four_hours_ago timestamptz := now() - interval '24 hours';
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
            WHERE m.user_id = u.id AND m.created_at >= twenty_four_hours_ago
        ) AS has_mood
    FROM
        public.users u
    WHERE
        u.name ILIKE '%' || p_search_term || '%'
    LIMIT 10;
END;
$$;
