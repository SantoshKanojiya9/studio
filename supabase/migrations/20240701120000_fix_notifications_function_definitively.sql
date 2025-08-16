
-- Drop the old, problematic function and its dependent type if it exists.
drop function if exists public.get_notifications_for_user(uuid, uuid, int, int);

-- Create the new, simplified, and correct function.
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
        n.type,
        n.emoji_id,
        n.is_read,
        -- Use built-in row_to_json for safer JSON conversion
        row_to_json(u.*),
        row_to_json(e.*),
        s.status::text
    from
        public.notifications n
        join public.users u on n.actor_id = u.id
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

-- Re-add the purge function to ensure it exists and is correct.
create or replace function public.purge_old_notifications()
returns void
language sql
as $$
  delete from public.notifications
  where created_at < now() - interval '24 hours';
$$;
