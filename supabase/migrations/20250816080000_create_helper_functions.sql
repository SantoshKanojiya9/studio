
-- Function to get paginated supporters for a user with their support status relative to the current user
create or replace function get_supporters_with_status(
    p_user_id uuid,
    p_current_user_id uuid,
    p_limit int,
    p_offset int
)
returns table (
    id uuid,
    name text,
    picture text,
    is_private boolean,
    support_status support_status,
    has_mood boolean
) as $$
begin
    return query
    select
        u.id,
        u.name,
        u.picture,
        u.is_private,
        s_viewer.status as support_status,
        exists(select 1 from moods m where m.user_id = u.id and m.created_at > now() - interval '24 hours') as has_mood
    from
        supports s_main
    join
        users u on s_main.supporter_id = u.id
    left join
        supports s_viewer on s_viewer.supporter_id = p_current_user_id and s_viewer.supported_id = u.id
    where
        s_main.supported_id = p_user_id and s_main.status = 'approved'
    order by
        u.name
    limit p_limit
    offset p_offset;
end;
$$ language plpgsql;


-- Function to get paginated users a specific user is supporting
create or replace function get_supporting_with_status(
    p_user_id uuid,
    p_current_user_id uuid,
    p_limit int,
    p_offset int
)
returns table (
    id uuid,
    name text,
    picture text,
    is_private boolean,
    support_status support_status,
    has_mood boolean
) as $$
begin
    return query
    select
        u.id,
        u.name,
        u.picture,
        u.is_private,
        s_viewer.status as support_status,
        exists(select 1 from moods m where m.user_id = u.id and m.created_at > now() - interval '24 hours') as has_mood
    from
        supports s_main
    join
        users u on s_main.supported_id = u.id
    left join
        supports s_viewer on s_viewer.supporter_id = p_current_user_id and s_viewer.supported_id = u.id
    where
        s_main.supporter_id = p_user_id and s_main.status = 'approved'
    order by
        u.name
    limit p_limit
    offset p_offset;
end;
$$ language plpgsql;

-- Function to get users who have viewed a mood
create or replace function get_mood_viewers(p_mood_id bigint, p_current_user_id uuid)
returns table (
    id uuid,
    name text,
    picture text,
    is_private boolean,
    support_status support_status,
    has_mood boolean
) as $$
begin
    return query
    select
        u.id,
        u.name,
        u.picture,
        u.is_private,
        s.status as support_status,
        exists(select 1 from moods m where m.user_id = u.id and m.created_at > now() - interval '24 hours') as has_mood
    from
        mood_views mv
    join
        users u on mv.viewer_id = u.id
    left join
        supports s on s.supporter_id = p_current_user_id and s.supported_id = u.id
    where
        mv.mood_id = p_mood_id
    order by
        mv.created_at desc;
end;
$$ language plpgsql;

-- Function to get paginated likers of an emoji
create or replace function get_paginated_likers(
    p_emoji_id uuid,
    p_current_user_id uuid,
    p_limit int,
    p_offset int
)
returns table (
    id uuid,
    name text,
    picture text,
    is_private boolean,
    support_status support_status,
    has_mood boolean
) as $$
begin
    return query
    select
        u.id,
        u.name,
        u.picture,
        u.is_private,
        s.status as support_status,
        exists(select 1 from moods m where m.user_id = u.id and m.created_at > now() - interval '24 hours') as has_mood
    from
        likes l
    join
        users u on l.user_id = u.id
    left join
        supports s on s.supporter_id = p_current_user_id and s.supported_id = u.id
    where
        l.emoji_id = p_emoji_id
    order by
        l.created_at desc
    limit p_limit
    offset p_offset;
end;
$$ language plpgsql;


-- Function to get like counts for a list of emojis
create or replace function get_like_counts_for_emojis(p_emoji_ids uuid[])
returns table (
    emoji_id uuid,
    like_count bigint
) as $$
begin
    return query
    select
        l.emoji_id,
        count(l.id) as like_count
    from
        likes l
    where
        l.emoji_id = any(p_emoji_ids)
    group by
        l.emoji_id;
end;
$$ language plpgsql;


-- Function to get notifications with all related data
create or replace function get_notifications_for_user(
    p_recipient_id uuid,
    p_current_user_id uuid,
    p_limit int,
    p_offset int
)
returns table (
    id bigint,
    created_at timestamptz,
    recipient_id uuid,
    actor_id uuid,
    type notification_type,
    is_read boolean,
    emoji_id uuid,
    actor json,
    emoji json,
    actor_support_status support_status
) as $$
begin
    return query
    select
        n.id,
        n.created_at,
        n.recipient_id,
        n.actor_id,
        n.type,
        n.is_read,
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
            'caption', e.caption,
            'created_at', e.created_at
        ) as emoji,
        s.status as actor_support_status
    from
        notifications n
    join
        users u on n.actor_id = u.id
    left join
        emojis e on n.emoji_id = e.id
    left join
        supports s on s.supporter_id = p_current_user_id and s.supported_id = n.actor_id
    where
        n.recipient_id = p_recipient_id
    order by
        n.created_at desc
    limit
        p_limit
    offset
        p_offset;
end;
$$ language plpgsql;


-- Function to get user profiles along with their mood status
create or replace function get_users_with_mood_status(p_user_ids uuid[])
returns table (
    id uuid,
    name text,
    picture text,
    has_mood boolean
) as $$
begin
  return query
  select
    u.id,
    u.name,
    u.picture,
    exists(select 1 from moods m where m.user_id = u.id and m.created_at > now() - interval '24 hours') as has_mood
  from
    users u
  where
    u.id = any(p_user_ids);
end;
$$ language plpgsql;

-- Function to handle user deletion by marking them as deleted
CREATE OR REPLACE FUNCTION handle_delete_user()
RETURNS void AS $$
DECLARE
    user_id_to_delete uuid := auth.uid();
BEGIN
    UPDATE public.users
    SET deleted_at = now()
    WHERE id = user_id_to_delete;

    -- Here you could also add logic to remove their content,
    -- or handle it via scheduled cleanups.
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

