
create or replace function get_gallery_for_user(
    p_user_id uuid, -- The user whose gallery is being viewed
    p_current_user_id uuid -- The user viewing the gallery (can be null)
)
returns table (
    user_profile json,
    posts json,
    supporter_count int,
    supporting_count int,
    support_status text,
    has_mood boolean
)
language plpgsql
as $$
begin
    return query
    with
    profile_user as (
        select
            u.id,
            u.name,
            u.picture,
            u.is_private
        from public.users u
        where u.id = p_user_id
    ),
    user_posts as (
        select
            e.*,
            (select count(*) from public.likes l where l.emoji_id = e.id)::int as like_count,
            (p_current_user_id is not null and exists (
                select 1 from public.likes l where l.emoji_id = e.id and l.user_id = p_current_user_id
            )) as is_liked
        from public.emojis e
        where e.user_id = p_user_id
        order by e.created_at desc
    ),
    user_supporter_count as (
        select count(*)::int as count
        from public.supports
        where supported_id = p_user_id and status = 'approved'
    ),
    user_supporting_count as (
        select count(*)::int as count
        from public.supports
        where supporter_id = p_user_id and status = 'approved'
    ),
    current_user_support_status as (
        select s.status
        from public.supports s
        where s.supporter_id = p_current_user_id and s.supported_id = p_user_id
    ),
    user_has_mood as (
        select exists (
            select 1
            from public.moods
            where user_id = p_user_id and created_at >= now() - interval '24 hours'
        ) as has_mood
    )
    select
        (select row_to_json(pu) from profile_user pu) as user_profile,
        (select json_agg(up) from user_posts up) as posts,
        (select count from user_supporter_count) as supporter_count,
        (select count from user_supporting_count) as supporting_count,
        (select status from current_user_support_status) as support_status,
        (select has_mood from user_has_mood) as has_mood;
end;
$$;
