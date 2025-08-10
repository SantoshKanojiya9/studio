-- Function to get a list of users who are supporting a given user_id
create or replace function get_supporters_with_status(p_user_id uuid, p_current_user_id uuid)
returns table (
    id uuid,
    name text,
    picture text,
    is_private boolean,
    support_status text
) as $$
begin
    return query
    select
        u.id,
        u.name,
        u.picture,
        u.is_private,
        -- Determine the support status of the current user towards the supporter
        (select s2.status from public.supports s2 where s2.supporter_id = p_current_user_id and s2.supported_id = u.id) as support_status
    from
        public.supports s
    join
        public.users u on s.supporter_id = u.id
    where
        s.supported_id = p_user_id
        and s.status = 'approved';
end;
$$ language plpgsql;


-- Function to get a list of users a given user_id is supporting
create or replace function get_supporting_with_status(p_user_id uuid, p_current_user_id uuid)
returns table (
    id uuid,
    name text,
    picture text,
    is_private boolean,
    support_status text
) as $$
begin
    return query
    select
        u.id,
        u.name,
        u.picture,
        u.is_private,
        s.status as support_status -- The status is directly from the queried support relationship
    from
        public.supports s
    join
        public.users u on s.supported_id = u.id
    where
        s.supporter_id = p_user_id
        and s.status = 'approved';
end;
$$ language plpgsql;
