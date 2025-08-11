
-- Function to get paginated public posts with user mood status
create or replace function get_public_posts_with_mood_status(
    p_limit int,
    p_offset int
)
returns table (
    id text,
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
    feature_offset_x double precision,
    feature_offset_y double precision,
    caption text,
    "user" jsonb
)
language plpgsql
as $$
begin
    return query
    select
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
        jsonb_build_object(
            'id', u.id,
            'name', u.name,
            'picture', u.picture,
            'has_mood', exists (
                select 1 from moods m
                where m.user_id = u.id and m.created_at > now() - interval '24 hours'
            )
        ) as "user"
    from
        emojis e
        join users u on e.user_id = u.id
    where
        u.is_private = false
    order by
        e.created_at desc
    limit p_limit
    offset p_offset;
end;
$$;


-- Function to search users and check if they have an active mood
create or replace function search_users_with_mood_status(
    p_search_term text,
    p_user_id uuid
)
returns table(id uuid, name text, picture text, is_private boolean, has_mood boolean)
language plpgsql
as $$
begin
    return query
    select
        u.id,
        u.name,
        u.picture,
        u.is_private,
        exists (
            select 1
            from public.moods m
            where m.user_id = u.id
            and m.created_at >= (now() - interval '24 hours')
        ) as has_mood
    from
        public.users u
    where
        u.name ilike '%' || p_search_term || '%'
        and u.id <> p_user_id
    limit 15;
end;
$$;
