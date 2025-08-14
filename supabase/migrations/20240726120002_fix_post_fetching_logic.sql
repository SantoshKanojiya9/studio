
-- Function to search users, correctly handling non-logged in users and data types
DROP FUNCTION IF EXISTS search_users(text, uuid);
DROP FUNCTION IF EXISTS search_users(text, text);

CREATE OR REPLACE FUNCTION search_users(p_search_term text, p_user_id text)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean) AS $$
DECLARE
    current_user_id_uuid uuid;
BEGIN
    -- Attempt to cast the text user ID to UUID. If it's null or invalid, it remains null.
    BEGIN
        current_user_id_uuid := p_user_id::uuid;
    EXCEPTION WHEN invalid_text_representation THEN
        current_user_id_uuid := NULL;
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
        AND (current_user_id_uuid IS NULL OR u.id <> current_user_id_uuid) -- Exclude the current user
    ORDER BY u.name
    LIMIT 10;
END;
$$ LANGUAGE plpgsql STABLE;

-- New function to efficiently get like counts for a batch of emojis
CREATE OR REPLACE FUNCTION get_like_counts_for_emojis(p_emoji_ids uuid[])
RETURNS TABLE(emoji_id uuid, like_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.emoji_id,
    count(l.emoji_id) as like_count
  FROM public.likes l
  WHERE l.emoji_id = ANY(p_emoji_ids)
  GROUP BY l.emoji_id;
END;
$$ LANGUAGE plpgsql STABLE;
