
-- Drop the function if it exists to ensure a clean slate
drop function if exists public.get_notifications_for_user(p_recipient_id uuid, p_current_user_id uuid, p_limit integer, p_offset integer);

-- Create the new, robust function to fetch notifications
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
    actor json,
    emoji json,
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
        n.type::text,
        n.emoji_id,
        n.is_read,
        row_to_json(u.*),
        case
            when e.id is not null then row_to_json(e.*)
            else null
        end,
        s.status::text
    from
        public.notifications n
        -- Use INNER JOIN for actor because a notification must have an actor
        join public.users u on n.actor_id = u.id
        -- Use LEFT JOIN for emoji and supports as they are optional
        left join public.emojis e on n.emoji_id = e.id
        left join public.supports s on s.supporter_id = p_current_user_id and s.supported_id = n.actor_id
    where
        n.recipient_id = p_recipient_id
    order by
        n.created_at desc
    limit p_limit
    offset p_offset;
end;
$$;
