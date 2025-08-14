
-- Function to get paginated list of likers for a post, including support status for the current user (if logged in)
DROP FUNCTION IF EXISTS get_paginated_likers(uuid, uuid, int, int);
CREATE OR REPLACE FUNCTION get_paginated_likers(p_emoji_id uuid, p_current_user_id text, p_limit int, p_offset int)
RETURNS TABLE(id uuid, name text, picture text, is_private boolean, support_status text, has_mood boolean) AS $$
DECLARE
    current_user_id_uuid uuid := NULL;
BEGIN
    IF p_current_user_id IS NOT NULL THEN
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
    IF p_current_user_id IS NOT NULL THEN
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
    IF p_current_user_id IS NOT NULL THEN
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


-- Function to get mood viewers
DROP FUNCTION IF EXISTS get_mood_viewers(int);
create or replace function get_mood_viewers(p_mood_id int)
returns table(id uuid, name text, picture text) as $$
begin
  return query
  select
    u.id,
    u.name,
    u.picture
  from public.mood_views mv
  join public.users u on mv.viewer_id = u.id
  where mv.mood_id = p_mood_id
  order by mv.created_at desc;
end;
$$ language plpgsql stable;


-- Function to get moods for the feed, including user info and viewed status
DROP FUNCTION IF EXISTS get_feed_moods(uuid);
create or replace function get_feed_moods(p_user_id uuid)
returns table(
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
) as $$
begin
  return query
  select
    m.id as mood_id,
    m.user_id as mood_user_id,
    m.created_at as mood_created_at,
    exists(select 1 from public.mood_views mv where mv.mood_id = m.id and mv.viewer_id = p_user_id) as is_viewed,
    e.*,
    json_build_object(
      'id', u.id,
      'name', u.name,
      'picture', u.picture
    ) as mood_user
  from public.moods m
  join public.emojis e on m.emoji_id = e.id
  join public.users u on m.user_id = u.id
  where m.user_id = p_user_id -- User's own mood
     or m.user_id in (select s.supported_id from public.supports s where s.supporter_id = p_user_id and s.status = 'approved') -- Moods of people user follows
  order by (m.user_id = p_user_id) desc, m.created_at desc;
end;
$$ language plpgsql stable;

-- Function to get posts for the feed
DROP FUNCTION IF EXISTS get_feed_posts(uuid, int, int);
create or replace function get_feed_posts(p_user_id uuid, p_limit int, p_offset int)
returns table(
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
) as $$
begin
  return query
  select
    e.*,
    json_build_object(
        'id', u.id,
        'name', u.name,
        'picture', u.picture,
        'has_mood', exists(select 1 from public.moods m where m.user_id = u.id)
    ) as "user",
    count(l.emoji_id) as like_count,
    exists(select 1 from public.likes li where li.emoji_id = e.id and li.user_id = p_user_id) as is_liked
  from public.emojis e
  join public.users u on e.user_id = u.id
  left join public.likes l on e.id = l.emoji_id
  where e.user_id in (select s.supported_id from public.supports s where s.supporter_id = p_user_id and s.status = 'approved')
  group by e.id, u.id
  order by e.created_at desc
  limit p_limit
  offset p_offset;
end;
$$ language plpgsql stable;

-- Function to get posts for a user's gallery, correctly handling non-logged in viewers
DROP FUNCTION IF EXISTS get_gallery_posts(uuid, uuid, int, int);
CREATE OR REPLACE FUNCTION get_gallery_posts(p_user_id uuid, p_current_user_id text, p_limit int, p_offset int)
RETURNS TABLE (
    id uuid, created_at timestamptz, user_id uuid, model text, expression text, background_color text, emoji_color text, show_sunglasses boolean, show_mustache boolean, selected_filter text, animation_type text, shape text, eye_style text, mouth_style text, eyebrow_style text, feature_offset_x numeric, feature_offset_y numeric, caption text, "user" json, like_count bigint, is_liked boolean
) AS $$
DECLARE
    current_user_id_uuid uuid := NULL;
BEGIN
    IF p_current_user_id IS NOT NULL THEN
        current_user_id_uuid := p_current_user_id::uuid;
    END IF;

    RETURN QUERY
    SELECT
        e.*,
        json_build_object('id', u.id, 'name', u.name, 'picture', u.picture) AS "user",
        count(l.emoji_id) AS like_count,
        CASE WHEN current_user_id_uuid IS NULL THEN false
             ELSE EXISTS(SELECT 1 FROM public.likes li WHERE li.emoji_id = e.id AND li.user_id = current_user_id_uuid)
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


-- Function to get posts for the explore page, correctly handling non-logged in viewers
DROP FUNCTION IF EXISTS get_explore_posts(uuid, int, int);
CREATE OR REPLACE FUNCTION get_explore_posts(p_current_user_id text, p_limit int, p_offset int)
RETURNS TABLE(
    id uuid, created_at timestamptz, user_id uuid, model text, expression text, background_color text, emoji_color text, show_sunglasses boolean, show_mustache boolean, selected_filter text, animation_type text, shape text, eye_style text, mouth_style text, eyebrow_style text, feature_offset_x numeric, feature_offset_y numeric, caption text, "user" json, like_count bigint, is_liked boolean
) AS $$
DECLARE
    current_user_id_uuid uuid := NULL;
BEGIN
    IF p_current_user_id IS NOT NULL THEN
        current_user_id_uuid := p_current_user_id::uuid;
    END IF;

    RETURN QUERY
    SELECT
        e.*,
        json_build_object('id', u.id, 'name', u.name, 'picture', u.picture, 'has_mood', EXISTS(SELECT 1 FROM public.moods m WHERE m.user_id = u.id)) AS "user",
        count(l.emoji_id) AS like_count,
        CASE WHEN current_user_id_uuid IS NULL THEN false
             ELSE EXISTS(SELECT 1 FROM public.likes li WHERE li.emoji_id = e.id AND li.user_id = current_user_id_uuid)
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

-- Function to search users
DROP FUNCTION IF EXISTS search_users(text, uuid);
DROP FUNCTION IF EXISTS search_users(text, text);
create or replace function search_users(p_search_term text, p_user_id text)
returns table(id uuid, name text, picture text, is_private boolean) as $$
DECLARE
    current_user_id_uuid uuid;
BEGIN
    -- Attempt to cast the text user ID to UUID. If it's null or invalid, it remains null.
    BEGIN
        current_user_id_uuid := p_user_id::uuid;
    EXCEPTION WHEN invalid_text_representation THEN
        current_user_id_uuid := NULL;
    END;

    return query
    select
        u.id,
        u.name,
        u.picture,
        u.is_private
    from public.users u
    where 
        u.name ilike p_search_term || '%'
        and (current_user_id_uuid is null or u.id <> current_user_id_uuid)
    order by u.name
    limit 10;
end;
$$ language plpgsql stable;

-- Function to get notifications
DROP FUNCTION IF EXISTS get_user_notifications(uuid, int, int);
create or replace function get_user_notifications(p_user_id uuid, p_limit int, p_offset int)
returns table (
    id int,
    type text,
    created_at timestamptz,
    emoji_id uuid,
    actor json,
    emoji json,
    actor_support_status text
) as $$
begin
    return query
    select
        n.id,
        n.type,
        n.created_at,
        n.emoji_id,
        json_build_object(
            'id', a.id,
            'name', a.name,
            'picture', a.picture,
            'is_private', a.is_private
        ) as actor,
        (
            select json_build_object(
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
                'feature_offset_y', e.feature_offset_y
            )
            from public.emojis e where e.id = n.emoji_id
        ) as emoji,
        (
            select s.status from public.supports s
            where s.supporter_id = p_user_id and s.supported_id = a.id
        )::text as actor_support_status
    from public.notifications n
    join public.users a on n.actor_id = a.id
    where n.recipient_id = p_user_id
    order by n.created_at desc
    limit p_limit
    offset p_offset;
end;
$$ language plpgsql stable;

-- Function for user deletion
DROP FUNCTION IF EXISTS handle_delete_user();
create or replace function handle_delete_user()
returns void as $$
declare
  user_id uuid := auth.uid();
begin
  -- Update the user's entry in the public.users table
  update public.users
  set deleted_at = now()
  where id = user_id;
  
  -- Optionally, you can add more logic here, like marking related data for deletion
  
end;
$$ language plpgsql security definer;


-- Function to get users and their mood status
DROP FUNCTION IF EXISTS get_users_with_mood_status(uuid[]);
create or replace function get_users_with_mood_status(p_user_ids uuid[])
returns table(id uuid, name text, picture text, has_mood boolean) as $$
begin
    return query
    select
        u.id,
        u.name,
        u.picture,
        exists(select 1 from public.moods m where m.user_id = u.id) as has_mood
    from public.users u
    where u.id = any(p_user_ids);
end;
$$ language plpgsql stable;

-- Function to purge old users marked for deletion
DROP FUNCTION IF EXISTS purge_deleted_users();
create or replace function purge_deleted_users()
returns void as $$
begin
  delete from auth.users where id in (
    select id from public.users where deleted_at is not null and deleted_at < now() - interval '30 minutes'
  );
end;
$$ language plpgsql security definer;

-- Function to purge old notifications
DROP FUNCTION IF EXISTS purge_old_notifications();
create or replace function purge_old_notifications()
returns void as $$
begin
    delete from public.notifications
    where created_at < now() - interval '30 days';
end;
$$ language plpgsql;
