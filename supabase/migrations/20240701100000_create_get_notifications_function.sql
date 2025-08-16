
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
    type text,
    emoji_id uuid,
    is_read boolean,
    actor jsonb,
    emoji jsonb,
    actor_support_status text
)
language plpgsql
as $$
begin
    return query
    select
        n.id,
        n.created_at,
        n.recipient_id,
        n.actor_id,
        n.type,
        n.emoji_id,
        n.is_read,
        jsonb_build_object(
            'id', u.id,
            'name', u.name,
            'picture', u.picture,
            'is_private', u.is_private
        ),
        case
            when e.id is not null then
                jsonb_build_object(
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
                )
            else
                null
        end,
        s.status::text
    from
        public.notifications n
        join public.users u on n.actor_id = u.id
        left join public.emojis e on n.emoji_id = e.id
        left join public.supports s on s.supporter_id = p_current_user_id and s.supported_id = n.actor_id
    where
        n.recipient_id = p_recipient_id
        and n.created_at >= now() - interval '24 hours'
    order by
        n.created_at desc
    limit p_limit
    offset p_offset;
end;
$$;
