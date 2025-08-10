
create or replace function get_gallery_for_user(p_user_id uuid, p_current_user_id uuid default null)
returns table (
    user_profile json,
    posts json,
    supporter_count bigint,
    supporting_count bigint,
    support_status text,
    has_mood boolean
)
language plpgsql
as $$
declare
    can_view boolean;
    is_private boolean;
begin
    -- Get user privacy setting
    select u.is_private into is_private from public.users u where u.id = p_user_id;

    -- Determine if the current user can view the profile content
    can_view := not is_private or p_user_id = p_current_user_id or exists (
        select 1 from public.supports s
        where s.supporter_id = p_current_user_id and s.supported_id = p_user_id and s.status = 'approved'
    );

    -- User Profile
    user_profile := (select row_to_json(u) from (
        select id, name, picture, is_private from public.users where id = p_user_id
    ) u);

    -- Posts (only if viewable)
    if can_view then
        posts := (
            select json_agg(p) from (
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
                    (select count(*) from public.likes l where l.emoji_id = e.id) as like_count,
                    case when l.user_id is not null then true else false end as is_liked
                from 
                    public.emojis e
                left join 
                    public.likes l on e.id = l.emoji_id and l.user_id = p_current_user_id
                where 
                    e.user_id = p_user_id
                order by 
                    e.created_at desc
            ) p
        );
    else
        posts := '[]'::json;
    end if;

    -- Supporter Count
    supporter_count := (select count(*) from public.supports where supported_id = p_user_id and status = 'approved');

    -- Supporting Count
    supporting_count := (select count(*) from public.supports where supporter_id = p_user_id and status = 'approved');

    -- Support Status
    if p_current_user_id is not null then
        select s.status into support_status from public.supports s
        where s.supporter_id = p_current_user_id and s.supported_id = p_user_id;
    else
        support_status := null;
    end if;

    -- Has Mood
    has_mood := exists (
        select 1 from public.moods
        where user_id = p_user_id and created_at >= now() - interval '24 hours'
    );

    return query select user_profile, posts, supporter_count, supporting_count, support_status, has_mood;
end;
$$;
