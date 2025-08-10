
create or replace function get_like_counts_for_posts(post_ids uuid[])
returns table (
    emoji_id uuid,
    like_count bigint
)
language sql
as $$
    select
        l.emoji_id,
        count(l.user_id) as like_count
    from
        public.likes l
    where
        l.emoji_id = any(post_ids)
    group by
        l.emoji_id;
$$;
