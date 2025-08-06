
create table public.emojis (
    id uuid not null default gen_random_uuid(),
    created_at timestamp with time zone not null default now(),
    user_id uuid null,
    model text not null,
    expression text not null,
    background_color text not null,
    emoji_color text not null,
    show_sunglasses boolean not null default false,
    show_mustache boolean not null default false,
    selected_filter text null,
    animation_type text not null,
    shape text not null,
    eye_style text not null,
    mouth_style text not null,
    eyebrow_style text not null,
    feature_offset_x double precision not null default 0,
    feature_offset_y double precision not null default 0,
    constraint emojis_pkey primary key (id),
    constraint emojis_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

alter table public.emojis enable row level security;

create policy "Users can see their own emojis."
on public.emojis for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can see all public emojis."
on public.emojis for select
to public
using (true);

create policy "Users can create their own emojis."
on public.emojis for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Users can update their own emojis."
on public.emojis for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Users can delete their own emojis."
on public.emojis for delete
to authenticated
using (auth.uid() = user_id);
